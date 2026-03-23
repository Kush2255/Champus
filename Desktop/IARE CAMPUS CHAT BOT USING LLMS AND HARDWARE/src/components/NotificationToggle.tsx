import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationToggle = () => {
  const { permission, isSupported, requestPermission } = useNotifications();

  if (!isSupported) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={requestPermission}
          className="relative"
        >
          {permission === 'granted' ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          {permission === 'granted' && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {permission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
      </TooltipContent>
    </Tooltip>
  );
};
