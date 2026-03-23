import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface SilenceTimerProps {
  silenceDuration: number;
  silenceTimeout: number;
  isActive: boolean;
  className?: string;
}

export const SilenceTimer = ({ silenceDuration, silenceTimeout, isActive, className }: SilenceTimerProps) => {
  if (!isActive || silenceDuration === 0) return null;

  const progress = Math.min((silenceDuration / silenceTimeout) * 100, 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground whitespace-nowrap">Auto-stop</span>
      <Progress value={progress} className="h-1.5 w-20" />
      <span className="text-xs text-muted-foreground">{Math.ceil((silenceTimeout - silenceDuration) / 1000)}s</span>
    </div>
  );
};
