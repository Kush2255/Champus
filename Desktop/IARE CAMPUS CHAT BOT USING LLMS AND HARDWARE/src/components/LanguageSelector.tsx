import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

export const LANGUAGES = [
  { code: 'en-US', label: 'English', flag: '🇺🇸', bcp47: 'en' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', flag: '🇮🇳', bcp47: 'hi' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)', flag: '🇮🇳', bcp47: 'te' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', flag: '🇮🇳', bcp47: 'ta' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', bcp47: 'kn' },
  { code: 'ml-IN', label: 'മലയാളം (Malayalam)', flag: '🇮🇳', bcp47: 'ml' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', flag: '🇮🇳', bcp47: 'mr' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)', flag: '🇮🇳', bcp47: 'bn' },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
  compact?: boolean;
}

export const LanguageSelector = ({ value, onChange, className, compact }: LanguageSelectorProps) => {
  const selected = LANGUAGES.find(l => l.code === value);

  return (
    <div className={className}>
      {!compact && <Label className="text-sm font-medium mb-1.5 block">Language</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={compact ? "w-[130px] h-9 text-xs" : "w-full"}>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <SelectValue placeholder="Language">
              {selected && (
                <span>{selected.flag} {compact ? selected.label.split(' ')[0] : selected.label}</span>
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
