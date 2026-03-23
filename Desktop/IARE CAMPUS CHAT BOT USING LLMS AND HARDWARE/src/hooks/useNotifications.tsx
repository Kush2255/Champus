import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [isSupported] = useState(typeof Notification !== 'undefined');

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const sendNotification = useCallback(({ title, body, icon, tag }: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;
    if (document.hasFocus()) return; // Don't notify if tab is focused

    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag,
        badge: '/favicon.ico',
      });
    } catch (e) {
      console.error('Notification error:', e);
    }
  }, [isSupported, permission]);

  return { permission, isSupported, requestPermission, sendNotification };
};
