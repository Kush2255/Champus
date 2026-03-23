import React from 'react';
import { useAudioDevices, AudioDevice } from '@/hooks/useAudioDevices';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mic, 
  Speaker, 
  Bluetooth, 
  Usb, 
  Monitor, 
  HelpCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioDeviceSelectorProps {
  compact?: boolean;
  showOutputDevice?: boolean;
  onDeviceChange?: (inputDeviceId: string | null) => void;
}

const DeviceTypeIcon: React.FC<{ type: AudioDevice['deviceType']; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'bluetooth':
      return <Bluetooth className={cn("h-4 w-4", className)} />;
    case 'usb':
      return <Usb className={cn("h-4 w-4", className)} />;
    case 'built-in':
      return <Monitor className={cn("h-4 w-4", className)} />;
    default:
      return <HelpCircle className={cn("h-4 w-4", className)} />;
  }
};

const DeviceTypeBadge: React.FC<{ type: AudioDevice['deviceType'] }> = ({ type }) => {
  const variants: Record<AudioDevice['deviceType'], { label: string; className: string }> = {
    'bluetooth': { label: 'Bluetooth', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    'usb': { label: 'USB', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    'built-in': { label: 'Built-in', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    'unknown': { label: 'Unknown', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
  };
  
  const { label, className } = variants[type];
  
  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      <DeviceTypeIcon type={type} className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

export const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({ 
  compact = false,
  showOutputDevice = true,
  onDeviceChange
}) => {
  const {
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    setSelectedInputDevice,
    setSelectedOutputDevice,
    refreshDevices,
    isLoading,
    error,
    hasPermission,
    requestPermission
  } = useAudioDevices();

  const handleInputChange = (deviceId: string) => {
    setSelectedInputDevice(deviceId);
    onDeviceChange?.(deviceId);
  };

  const selectedInput = inputDevices.find(d => d.deviceId === selectedInputDevice);
  const selectedOutput = outputDevices.find(d => d.deviceId === selectedOutputDevice);

  // Permission request view
  if (!hasPermission && !isLoading) {
    return (
      <Card className={cn("border-primary/20", compact && "p-2")}>
        <CardContent className={cn("pt-4", compact && "p-2")}>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Microphone Access Required</p>
              <p className="text-sm text-muted-foreground">
                Grant permission to see available audio devices
              </p>
            </div>
            <Button onClick={requestPermission} size="sm">
              Allow Microphone Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact view for inline use
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedInputDevice || ''} onValueChange={handleInputChange}>
          <SelectTrigger className="w-[200px] h-9">
            <div className="flex items-center gap-2 truncate">
              {selectedInput && <DeviceTypeIcon type={selectedInput.deviceType} />}
              <SelectValue placeholder="Select microphone" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {inputDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                <div className="flex items-center gap-2">
                  <DeviceTypeIcon type={device.deviceType} />
                  <span className="truncate max-w-[150px]">{device.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9"
          onClick={refreshDevices}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>
    );
  }

  // Full card view
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Audio Devices
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={refreshDevices}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Device (Microphone) */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Microphone
          </label>
          
          <Select value={selectedInputDevice || ''} onValueChange={handleInputChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select microphone">
                {selectedInput && (
                  <div className="flex items-center gap-2">
                    <DeviceTypeIcon type={selectedInput.deviceType} />
                    <span className="truncate">{selectedInput.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {inputDevices.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No microphones detected
                </div>
              ) : (
                inputDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-2">
                        <DeviceTypeIcon type={device.deviceType} />
                        <span className="truncate max-w-[200px]">{device.label}</span>
                      </div>
                      <DeviceTypeBadge type={device.deviceType} />
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {selectedInput && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-green-500" />
              <span>
                {selectedInput.deviceType === 'bluetooth' 
                  ? 'Bluetooth device connected' 
                  : selectedInput.deviceType === 'usb'
                    ? 'USB device connected'
                    : 'Device ready'}
              </span>
            </div>
          )}
        </div>

        {/* Output Device (Speaker) */}
        {showOutputDevice && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Speaker className="h-4 w-4" />
              Speaker / Output
            </label>
            
            <Select value={selectedOutputDevice || ''} onValueChange={setSelectedOutputDevice}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select speaker">
                  {selectedOutput && (
                    <div className="flex items-center gap-2">
                      <DeviceTypeIcon type={selectedOutput.deviceType} />
                      <span className="truncate">{selectedOutput.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {outputDevices.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No speakers detected
                  </div>
                ) : (
                  outputDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-2">
                          <DeviceTypeIcon type={device.deviceType} />
                          <span className="truncate max-w-[200px]">{device.label}</span>
                        </div>
                        <DeviceTypeBadge type={device.deviceType} />
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Device Summary */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {inputDevices.length} microphone{inputDevices.length !== 1 ? 's' : ''} detected
            {inputDevices.filter(d => d.deviceType === 'bluetooth').length > 0 && (
              <span className="ml-2">
                • <Bluetooth className="h-3 w-3 inline" /> {inputDevices.filter(d => d.deviceType === 'bluetooth').length} Bluetooth
              </span>
            )}
            {inputDevices.filter(d => d.deviceType === 'usb').length > 0 && (
              <span className="ml-2">
                • <Usb className="h-3 w-3 inline" /> {inputDevices.filter(d => d.deviceType === 'usb').length} USB
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioDeviceSelector;
