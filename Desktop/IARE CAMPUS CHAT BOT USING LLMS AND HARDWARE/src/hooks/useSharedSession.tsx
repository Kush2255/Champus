import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SharedSession {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  is_active: boolean;
  created_at: string;
}

export interface SharedMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: string;
  content: string;
  user_name: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
}

export const useSharedSession = (sessionId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SharedSession[]>([]);
  const [messages, setMessages] = useState<SharedMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentSession, setCurrentSession] = useState<SharedSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's sessions
  const loadSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('shared_sessions')
      .select('*')
      .or(`owner_id.eq.${user.id},id.in.(select session_id from session_participants where user_id = '${user.id}')`)
      .order('created_at', { ascending: false });
    if (data) setSessions(data as SharedSession[]);
  }, [user]);

  // Create session
  const createSession = async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('shared_sessions')
      .insert({ name, owner_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: 'Error', description: 'Failed to create session.', variant: 'destructive' });
      return null;
    }
    // Owner joins as participant too
    await supabase.from('session_participants').insert({ session_id: data.id, user_id: user.id });
    await loadSessions();
    return data as SharedSession;
  };

  // Join session by invite code
  const joinSession = async (inviteCode: string) => {
    if (!user) return null;
    const { data: session } = await supabase
      .from('shared_sessions')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('is_active', true)
      .single();
    if (!session) {
      toast({ title: 'Not Found', description: 'Invalid or expired invite code.', variant: 'destructive' });
      return null;
    }
    const { error } = await supabase
      .from('session_participants')
      .insert({ session_id: session.id, user_id: user.id });
    if (error && !error.message.includes('duplicate')) {
      toast({ title: 'Error', description: 'Failed to join session.', variant: 'destructive' });
      return null;
    }
    toast({ title: 'Joined!', description: `You joined "${session.name}".` });
    await loadSessions();
    return session as SharedSession;
  };

  // Load messages for a session
  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('shared_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (data) setMessages(data as SharedMessage[]);
    setIsLoading(false);
  }, [sessionId]);

  // Load participants
  const loadParticipants = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId);
    if (data) setParticipants(data as Participant[]);
  }, [sessionId]);

  // Load current session
  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      const { data } = await supabase
        .from('shared_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (data) setCurrentSession(data as SharedSession);
    };
    load();
    loadMessages();
    loadParticipants();
  }, [sessionId, loadMessages, loadParticipants]);

  // Send message
  const sendMessage = async (content: string, role: string = 'user') => {
    if (!user || !sessionId) return;
    const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    await supabase.from('shared_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
      user_name: userName,
    });
  };

  // Realtime subscriptions
  useEffect(() => {
    if (!sessionId) return;

    const msgChannel = supabase
      .channel(`shared-messages-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'shared_messages',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as SharedMessage]);
      })
      .subscribe();

    const partChannel = supabase
      .channel(`session-participants-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'session_participants',
        filter: `session_id=eq.${sessionId}`,
      }, () => {
        loadParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(partChannel);
    };
  }, [sessionId, loadParticipants]);

  // Delete session
  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('shared_sessions').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete session.', variant: 'destructive' });
      return;
    }
    await loadSessions();
  };

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    messages,
    participants,
    currentSession,
    isLoading,
    createSession,
    joinSession,
    sendMessage,
    deleteSession,
    loadSessions,
  };
};
