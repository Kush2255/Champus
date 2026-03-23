import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VUMeterProps {
  stream: MediaStream | null;
  isActive: boolean;
  className?: string;
  barCount?: number;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * VU METER COMPONENT
 * ==================
 * Real-time volume level indicator using Web Audio API.
 * Shows input sensitivity as animated bars next to the microphone button.
 */
export const VUMeter = ({
  stream,
  isActive,
  className,
  barCount = 12,
  orientation = 'vertical',
}: VUMeterProps) => {
  const [level, setLevel] = useState(0);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      setLevel(0);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyserRef.current = analyser;
    audioContextRef.current = audioContext;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!isActive) return;
      animationRef.current = requestAnimationFrame(updateLevel);
      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const normalized = Math.min(rms / 128, 1); // Normalize to 0-1
      setLevel(normalized);
    };

    updateLevel();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream, isActive]);

  const activeBars = Math.round(level * barCount);

  const getBarColor = (index: number) => {
    const ratio = index / barCount;
    if (ratio > 0.8) return 'bg-destructive';
    if (ratio > 0.6) return 'bg-chart-1';
    return 'bg-primary';
  };

  return (
    <div
      className={cn(
        'flex gap-0.5',
        orientation === 'vertical' ? 'flex-col-reverse items-center' : 'flex-row items-end',
        className
      )}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-sm transition-all duration-75',
            orientation === 'vertical' ? 'w-3 h-1.5' : 'w-1.5 h-3',
            i < activeBars ? getBarColor(i) : 'bg-muted/40'
          )}
        />
      ))}
    </div>
  );
};
