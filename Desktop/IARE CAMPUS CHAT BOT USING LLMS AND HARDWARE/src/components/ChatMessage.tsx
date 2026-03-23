import { User, Bot, Mic, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamingText } from '@/components/StreamingText';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  inputType?: 'text' | 'voice';
  timestamp?: string;
  isNew?: boolean;
}

export const ChatMessage = ({ role, content, inputType, timestamp, isNew = false }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn(
      'flex gap-4 p-4 md:p-5 animate-fade-in',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
          <Bot className="h-6 w-6 text-primary-foreground" />
        </div>
      )}
      
      <div className={cn(
        'max-w-[80%] rounded-2xl px-5 py-4 shadow-sm',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card border border-border'
      )}>
        <div className="text-base leading-relaxed">
          {!isUser && isNew ? (
            <StreamingText text={content} speed={12} />
          ) : !isUser ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p>{content}</p>
          )}
        </div>
        <div className={cn(
          'flex items-center gap-2 mt-2 text-xs',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {inputType && (
            <span className="flex items-center gap-1">
              {inputType === 'voice' ? (<><Mic className="h-3 w-3" />Voice</>) : (<><Keyboard className="h-3 w-3" />Text</>)}
            </span>
          )}
          {inputType && timestamp && <span>•</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shadow-md">
          <User className="h-6 w-6 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
