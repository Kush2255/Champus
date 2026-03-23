import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useSharedSession } from '@/hooks/useSharedSession';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { ModelSelector } from '@/components/ModelSelector';
import { TypingIndicator } from '@/components/TypingIndicator';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { NotificationToggle } from '@/components/NotificationToggle';
import { TypingPresenceIndicator, useTypingPresence } from '@/components/TypingPresence';
import {
  Send, Loader2, Users, ArrowLeft, Copy, Check, Bot, User as UserIcon, Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const CollaborativeChat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    messages, participants, currentSession, isLoading, sendMessage
  } = useSharedSession(sessionId);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sendNotification } = useNotifications();
  const { typingUsers, setTyping } = useTypingPresence(sessionId || '');

  // Notify on new messages from others
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.user_id !== user?.id) {
        sendNotification({
          title: last.role === 'assistant' ? 'AI Response' : (last.user_name || 'New message'),
          body: last.content.slice(0, 100),
          tag: `collab-${sessionId}`,
        });
      }
    }
  }, [messages.length]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const text = input.trim().slice(0, 1000);
    setInput('');
    setTyping(false);
    setIsSending(true);
    await sendMessage(text, 'user');
    setIsSending(false);
  };

  const handleAskAI = async () => {
    if (!input.trim() || isAiLoading) return;
    const text = input.trim().slice(0, 1000);
    setInput('');
    setIsAiLoading(true);
    
    // Send user message first
    await sendMessage(text, 'user');

    try {
      const { data, error } = await supabase.functions.invoke('chat-grok', {
        body: {
          message: text,
          conversationHistory: messages.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
          selectedModel,
        }
      });
      if (error) throw error;
      const aiResponse = data.response || 'Sorry, I could not generate a response.';
      await sendMessage(aiResponse, 'assistant');
    } catch {
      toast({ title: 'Error', description: 'Failed to get AI response.', variant: 'destructive' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyInviteCode = () => {
    if (currentSession?.invite_code) {
      navigator.clipboard.writeText(currentSession.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!', description: 'Invite code copied to clipboard.' });
    }
  };

  const currentUserId = user?.id;

  return (
    <div className="flex flex-col h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-card/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/collaborate')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{currentSession?.name || 'Collaborative Chat'}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants.length} participant{participants.length !== 1 ? 's' : ''} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector value={language} onChange={setLanguage} compact />
          <ModelSelector value={selectedModel} onChange={setSelectedModel} className="w-[140px] h-9 text-xs" />
          <NotificationToggle />
          {currentSession?.invite_code && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={copyInviteCode} className="gap-1 text-xs">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {currentSession.invite_code}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy invite code</TooltipContent>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto py-6 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Start Collaborating</h2>
              <p className="text-lg text-muted-foreground max-w-lg">
                Send messages to chat with participants. Use the AI button to ask the AI assistant together.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isOwn = msg.user_id === currentUserId;
                const isAI = msg.role === 'assistant';

                return (
                  <div key={msg.id} className={cn(
                    'flex gap-3 p-3 animate-fade-in',
                    isAI ? 'justify-start' : isOwn ? 'justify-end' : 'justify-start'
                  )}>
                    {!isOwn && (
                      <div className={cn(
                        'flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-md',
                        isAI ? 'bg-gradient-to-br from-primary to-primary/70' : 'bg-secondary'
                      )}>
                        {isAI ? <Bot className="h-5 w-5 text-primary-foreground" /> : <UserIcon className="h-5 w-5 text-secondary-foreground" />}
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                      isAI ? 'bg-card border border-border' :
                      isOwn ? 'bg-primary text-primary-foreground' :
                      'bg-muted border border-border'
                    )}>
                      {!isOwn && !isAI && (
                        <p className="text-xs font-medium text-primary mb-1">{msg.user_name || 'User'}</p>
                      )}
                      <div className="text-sm leading-relaxed">
                        {isAI ? <MarkdownRenderer content={msg.content} /> : <p>{msg.content}</p>}
                      </div>
                      <p className={cn(
                        'text-[10px] mt-1',
                        isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {isOwn && (
                      <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
                        <UserIcon className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
              {isAiLoading && (
                <div className="flex gap-3 p-3 animate-fade-in">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-muted/50 border border-border">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Typing indicators */}
      {sessionId && <TypingPresenceIndicator sessionId={sessionId} />}

      {/* Input */}
      <div className="border-t border-border bg-card/80 backdrop-blur-md p-4 flex-shrink-0">
        <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setTyping(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isSending || isAiLoading}
              className="flex-1 min-h-[48px] max-h-[160px] resize-none text-base"
              maxLength={1000}
              rows={1}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isSending || isAiLoading} className="h-12 px-4 rounded-xl">
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleAskAI} disabled={!input.trim() || isSending || isAiLoading} variant="secondary" className="h-12 px-4 rounded-xl">
                  {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ask AI</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeChat;
