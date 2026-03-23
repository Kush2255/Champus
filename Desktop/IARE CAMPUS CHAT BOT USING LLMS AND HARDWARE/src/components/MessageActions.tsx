import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Copy, ThumbsUp, ThumbsDown, Check, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  content: string;
  messageId: string;
  isAssistant: boolean;
  className?: string;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

/**
 * MESSAGE ACTIONS COMPONENT
 * =========================
 * Provides action buttons for chat messages:
 * - Copy to clipboard
 * - Like/dislike reactions
 * - Text-to-speech playback
 */
export const MessageActions = ({
  content,
  messageId,
  isAssistant,
  className,
  onSpeak,
  isSpeaking,
}: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        description: 'Copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        description: 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    setReaction(reaction === type ? null : type);
    // Could send feedback to analytics here
  };

  return (
    <div className={cn('flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity', className)}>
      {/* Copy Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy message</TooltipContent>
      </Tooltip>

      {/* Reactions - only for assistant messages */}
      {isAssistant && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', reaction === 'like' && 'text-green-500')}
                onClick={() => handleReaction('like')}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Helpful</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', reaction === 'dislike' && 'text-red-500')}
                onClick={() => handleReaction('dislike')}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Not helpful</TooltipContent>
          </Tooltip>

          {/* Text-to-Speech */}
          {onSpeak && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onSpeak}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isSpeaking ? 'Stop' : 'Read aloud'}</TooltipContent>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};
