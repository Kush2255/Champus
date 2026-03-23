import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WaveformAnimationProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
}

/**
 * WAVEFORM ANIMATION COMPONENT
 * ============================
 * Animated audio waveform visualization for voice chat.
 * Shows responsive bars that animate when microphone is active.
 */
export const WaveformAnimation = ({
  isActive,
  className,
  barCount = 5,
}: WaveformAnimationProps) => {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full bg-primary transition-all duration-150',
            isActive ? 'animate-waveform' : 'h-2'
          )}
          style={{
            animationDelay: isActive ? `${i * 100}ms` : '0ms',
            height: isActive ? undefined : '8px',
          }}
        />
      ))}
    </div>
  );
};

/**
 * AUDIO VISUALIZER COMPONENT
 * ==========================
 * Real-time audio visualization using Web Audio API.
 * Displays actual microphone input levels.
 */
interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  className?: string;
}

export const AudioVisualizer = ({ stream, isActive, className }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream || !isActive || !canvasRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const draw = () => {
      if (!isActive) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Get computed styles for theme-aware colors
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--primary').trim();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Use HSL color from CSS variable
        ctx.fillStyle = `hsl(${primaryColor})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [stream, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className={cn('rounded-lg', className)}
    />
  );
};

/**
 * PULSE RING ANIMATION
 * ====================
 * Animated pulse rings around the microphone button.
 */
interface PulseRingProps {
  isActive: boolean;
  className?: string;
}

export const PulseRing = ({ isActive, className }: PulseRingProps) => {
  if (!isActive) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
      <div 
        className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50"
        style={{ animationDelay: '300ms' }}
      />
      <div 
        className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-25"
        style={{ animationDelay: '600ms' }}
      />
    </div>
  );
};
