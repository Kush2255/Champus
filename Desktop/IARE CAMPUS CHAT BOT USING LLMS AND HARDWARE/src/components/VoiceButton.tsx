import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceButton = ({ isListening, isSupported, onClick, disabled }: VoiceButtonProps) => {
  if (!isSupported) {
    return (
      <Button variant="outline" size="icon" disabled className="flex-shrink-0">
        <MicOff className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant={isListening ? 'destructive' : 'outline'}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-shrink-0 transition-all duration-200',
        isListening && 'animate-pulse ring-2 ring-destructive/50'
      )}
    >
      {isListening ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};
