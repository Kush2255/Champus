import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface TypingPresenceProps {
  sessionId: string;
  className?: string;
}

export const useTypingPresence = (sessionId: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId || !user) return;

    const channel = supabase.channel(`typing-${sessionId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: string[] = [];
        for (const [userId, presences] of Object.entries(state)) {
          if (userId === user.id) continue;
          const latest = (presences as any[])[0];
          if (latest?.is_typing) {
            typing.push(latest.user_name || 'Someone');
          }
        }
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            is_typing: false,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, user]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !user) return;

    channelRef.current.track({
      user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      is_typing: isTyping,
    });

    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current?.track({
          user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          is_typing: false,
        });
      }, 3000);
    }
  }, [user]);

  return { typingUsers, setTyping };
};

export const TypingPresenceIndicator = ({ sessionId, className }: TypingPresenceProps) => {
  const { typingUsers } = useTypingPresence(sessionId);

  if (typingUsers.length === 0) return null;

  const text = typingUsers.length === 1
    ? `${typingUsers[0]} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
    : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;

  return (
    <div className={cn('flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground animate-fade-in', className)}>
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  );
};
