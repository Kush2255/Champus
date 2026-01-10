import { User, Bot, Mic, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  inputType?: 'text' | 'voice';
  timestamp?: string;
}

export const ChatMessage = ({ role, content, inputType, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn(
      'flex gap-3 p-4 animate-fade-in',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card border border-border'
      )}>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        <div className={cn(
          'flex items-center gap-2 mt-2 text-xs',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {inputType && (
            <span className="flex items-center gap-1">
              {inputType === 'voice' ? (
                <>
                  <Mic className="h-3 w-3" />
                  Voice
                </>
              ) : (
                <>
                  <Keyboard className="h-3 w-3" />
                  Text
                </>
              )}
            </span>
          )}
          {inputType && timestamp && <span>•</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
