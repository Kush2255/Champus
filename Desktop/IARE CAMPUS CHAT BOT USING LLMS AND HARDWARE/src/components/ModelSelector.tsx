import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cpu, Sparkles, Zap, Brain } from 'lucide-react';

export interface AIModel {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  speed: 'fast' | 'medium' | 'slow';
}

export const AI_MODELS: AIModel[] = [
  { id: 'grok', label: 'Grok 3', description: 'xAI flagship model', icon: Zap, speed: 'medium' },
  { id: 'gemini-flash', label: 'Gemini Flash', description: 'Fast & balanced', icon: Sparkles, speed: 'fast' },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Best reasoning', icon: Brain, speed: 'slow' },
  { id: 'gpt5-mini', label: 'GPT-5 Mini', description: 'Cost-effective', icon: Cpu, speed: 'fast' },
  { id: 'gpt5', label: 'GPT-5', description: 'Most powerful', icon: Brain, speed: 'slow' },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ModelSelector = ({ value, onChange, className }: ModelSelectorProps) => {
  const selected = AI_MODELS.find(m => m.id === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || 'w-[180px] h-9 text-xs'}>
        <SelectValue>
          <span className="flex items-center gap-1.5">
            {selected && <selected.icon className="h-3.5 w-3.5" />}
            {selected?.label || 'Select Model'}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {AI_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center gap-2">
              <model.icon className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">{model.label}</div>
                <div className="text-xs text-muted-foreground">{model.description}</div>
              </div>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                model.speed === 'fast' ? 'bg-green-500/10 text-green-600' :
                model.speed === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                'bg-orange-500/10 text-orange-600'
              }`}>
                {model.speed}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
