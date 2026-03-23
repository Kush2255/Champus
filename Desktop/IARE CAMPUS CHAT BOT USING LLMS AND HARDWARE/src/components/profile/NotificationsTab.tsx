import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationPreferences {
  email_notifications: boolean;
  system_alerts: boolean;
  chat_notifications: boolean;
}

interface NotificationsTabProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: NotificationPreferences) => Promise<void>;
}

export const NotificationsTab = ({ preferences, onUpdate }: NotificationsTabProps) => {
  const [settings, setSettings] = useState<NotificationPreferences>({
    email_notifications: preferences.email_notifications ?? true,
    system_alerts: preferences.system_alerts ?? true,
    chat_notifications: preferences.chat_notifications ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = 
      settings.email_notifications !== preferences.email_notifications ||
      settings.system_alerts !== preferences.system_alerts ||
      settings.chat_notifications !== preferences.chat_notifications;
    setHasChanges(changed);
  }, [settings, preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(settings);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationOptions = [
    {
      id: 'email_notifications',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive email updates about your account activity and important announcements',
      checked: settings.email_notifications,
      onChange: (checked: boolean) => setSettings({ ...settings, email_notifications: checked }),
    },
    {
      id: 'system_alerts',
      icon: AlertCircle,
      title: 'System Alerts',
      description: 'Get notified about system updates, maintenance, and security alerts',
      checked: settings.system_alerts,
      onChange: (checked: boolean) => setSettings({ ...settings, system_alerts: checked }),
    },
    {
      id: 'chat_notifications',
      icon: MessageSquare,
      title: 'Chat Notifications',
      description: 'Receive notifications for new chat responses and messages',
      checked: settings.chat_notifications,
      onChange: (checked: boolean) => setSettings({ ...settings, chat_notifications: checked }),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationOptions.map((option) => (
            <div key={option.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <option.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                    {option.title}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
              <Switch
                id={option.id}
                checked={option.checked}
                onCheckedChange={option.onChange}
              />
            </div>
          ))}
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
