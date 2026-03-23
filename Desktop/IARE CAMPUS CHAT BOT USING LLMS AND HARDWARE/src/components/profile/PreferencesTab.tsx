import { useState, useEffect } from 'react';
import { Palette, Globe, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/components/ThemeProvider';

interface UserPreferences {
  theme: string;
  language: string;
  voice_enabled: boolean;
}

interface PreferencesTabProps {
  preferences: UserPreferences;
  onUpdate: (preferences: UserPreferences) => Promise<void>;
}

export const PreferencesTab = ({ preferences, onUpdate }: PreferencesTabProps) => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserPreferences>({
    theme: preferences.theme || 'system',
    language: preferences.language || 'en',
    voice_enabled: preferences.voice_enabled ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = 
      settings.theme !== preferences.theme ||
      settings.language !== preferences.language ||
      settings.voice_enabled !== preferences.voice_enabled;
    setHasChanges(changed);
  }, [settings, preferences]);

  const handleThemeChange = (value: string) => {
    setSettings({ ...settings, theme: value });
    setTheme(value as 'light' | 'dark' | 'system');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(settings);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'hi', label: 'हिंदी' },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'system'].map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => handleThemeChange(themeOption)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.theme === themeOption
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-full aspect-video rounded-lg mb-2 ${
                    themeOption === 'light' 
                      ? 'bg-white border border-border' 
                      : themeOption === 'dark' 
                        ? 'bg-gray-900' 
                        : 'bg-gradient-to-r from-white to-gray-900'
                  }`} />
                  <span className="text-sm font-medium capitalize">{themeOption}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language
          </CardTitle>
          <CardDescription>Select your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">Display Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => setSettings({ ...settings, language: value })}
            >
              <SelectTrigger id="language" className="w-full md:w-64">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice & Chat
          </CardTitle>
          <CardDescription>Configure voice chat preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="voice-enabled" className="text-base font-medium cursor-pointer">
                  Voice Responses
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Enable text-to-speech for AI responses
                </p>
              </div>
            </div>
            <Switch
              id="voice-enabled"
              checked={settings.voice_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, voice_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};
