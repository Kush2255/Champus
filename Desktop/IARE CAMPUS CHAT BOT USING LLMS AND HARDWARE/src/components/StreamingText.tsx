import { useState, useEffect, useRef } from 'react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
  enabled?: boolean;
}

/**
 * STREAMING TEXT COMPONENT
 * ========================
 * Simulates token-by-token streaming of AI responses.
 * Characters appear progressively for a real-time feel.
 */
export const StreamingText = ({ text, speed = 15, onComplete, enabled = true }: StreamingTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        const chunkSize = Math.min(
          Math.floor(Math.random() * 3) + 2,
          text.length - indexRef.current
        );
        indexRef.current += chunkSize;
        setDisplayedText(text.slice(0, indexRef.current));
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, enabled]);

  return (
    <div>
      <MarkdownRenderer content={displayedText} />
      {!isComplete && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom rounded-sm" />}
    </div>
  );
};
