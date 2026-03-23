import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

/**
 * TYPING INDICATOR COMPONENT
 * ==========================
 * Animated dots that show when the AI is generating a response.
 */
export const TypingIndicator = ({ className }: TypingIndicatorProps) => {
  return (
    <div className={cn('flex items-center gap-1 px-4 py-3', className)}>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
            style={{
              animationDelay: `${i * 150}ms`,
              animationDuration: '600ms',
            }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
    </div>
  );
};
