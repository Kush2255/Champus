import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm & natural' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Deep & professional' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Soft & gentle' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Clear & articulate' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', description: 'Bright & energetic' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Calm & steady' },
];

interface VoiceSelectorProps {
  value: string;
  onChange: (voiceId: string) => void;
  className?: string;
}

export const VoiceSelector = ({ value, onChange, className }: VoiceSelectorProps) => {
  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-1.5 block">AI Voice</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent>
          {VOICES.map((voice) => (
            <SelectItem key={voice.id} value={voice.id}>
              <span className="font-medium">{voice.name}</span>
              <span className="text-muted-foreground ml-2 text-xs">— {voice.description}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { VOICES };
