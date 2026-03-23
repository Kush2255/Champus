import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AudioQualityIndicatorProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  noiseLevel: number;
  className?: string;
}

export const AudioQualityIndicator = ({ quality, noiseLevel, className }: AudioQualityIndicatorProps) => {
  const config = {
    excellent: { icon: ShieldCheck, color: 'text-green-500', label: 'Excellent audio quality' },
    good: { icon: ShieldCheck, color: 'text-primary', label: 'Good audio quality' },
    fair: { icon: Shield, color: 'text-yellow-500', label: 'Fair audio — some background noise' },
    poor: { icon: ShieldAlert, color: 'text-destructive', label: 'Poor audio — high background noise' },
  };

  const { icon: Icon, color, label } = config[quality];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('flex items-center gap-1.5', className)}>
          <Icon className={cn('h-4 w-4', color)} />
          <span className={cn('text-xs font-medium', color)}>
            {quality.charAt(0).toUpperCase() + quality.slice(1)}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
        <p className="text-xs text-muted-foreground">Noise level: {Math.round(noiseLevel * 100)}%</p>
      </TooltipContent>
    </Tooltip>
  );
};
