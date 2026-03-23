import { useState, useEffect, useCallback } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  isDefault: boolean;
  deviceType: 'built-in' | 'usb' | 'bluetooth' | 'unknown';
}

interface AudioDevicesHook {
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
  selectedInputDevice: string | null;
  selectedOutputDevice: string | null;
  setSelectedInputDevice: (deviceId: string) => void;
  setSelectedOutputDevice: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * Detect device type based on label and device info
 * Bluetooth devices typically have "Bluetooth" in their name
 * USB devices often have "USB" or specific vendor names
 */
const detectDeviceType = (label: string): AudioDevice['deviceType'] => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('bluetooth') || lowerLabel.includes('airpods') || 
      lowerLabel.includes('wireless') || lowerLabel.includes('bt ') ||
      lowerLabel.includes('beats') || lowerLabel.includes('jabra') ||
      lowerLabel.includes('bose') || lowerLabel.includes('sony wh') ||
      lowerLabel.includes('galaxy buds') || lowerLabel.includes('pixel buds')) {
    return 'bluetooth';
  }
  
  if (lowerLabel.includes('usb') || lowerLabel.includes('yeti') || 
      lowerLabel.includes('blue ') || lowerLabel.includes('rode') ||
      lowerLabel.includes('samson') || lowerLabel.includes('audio-technica') ||
      lowerLabel.includes('shure') || lowerLabel.includes('elgato')) {
    return 'usb';
  }
  
  if (lowerLabel.includes('built-in') || lowerLabel.includes('internal') ||
      lowerLabel.includes('default') || lowerLabel.includes('realtek') ||
      lowerLabel.includes('macbook') || lowerLabel.includes('laptop')) {
    return 'built-in';
  }
  
  return 'unknown';
};

export const useAudioDevices = (): AudioDevicesHook => {
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDeviceState] = useState<string | null>(null);
  const [selectedOutputDevice, setSelectedOutputDeviceState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const processDevices = useCallback((devices: MediaDeviceInfo[]): { inputs: AudioDevice[], outputs: AudioDevice[] } => {
    const inputs: AudioDevice[] = [];
    const outputs: AudioDevice[] = [];
    
    devices.forEach((device, index) => {
      const audioDevice: AudioDevice = {
        deviceId: device.deviceId,
        label: device.label || `${device.kind === 'audioinput' ? 'Microphone' : 'Speaker'} ${index + 1}`,
        kind: device.kind as 'audioinput' | 'audiooutput',
        isDefault: device.deviceId === 'default' || index === 0,
        deviceType: detectDeviceType(device.label || '')
      };
      
      if (device.kind === 'audioinput') {
        inputs.push(audioDevice);
      } else if (device.kind === 'audiooutput') {
        outputs.push(audioDevice);
      }
    });
    
    // Sort devices: built-in first, then USB, then Bluetooth, then unknown
    const sortOrder: Record<AudioDevice['deviceType'], number> = {
      'built-in': 1,
      'usb': 2,
      'bluetooth': 3,
      'unknown': 4
    };
    
    inputs.sort((a, b) => sortOrder[a.deviceType] - sortOrder[b.deviceType]);
    outputs.sort((a, b) => sortOrder[a.deviceType] - sortOrder[b.deviceType]);
    
    return { inputs, outputs };
  }, []);

  const refreshDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const { inputs, outputs } = processDevices(devices);
      
      setInputDevices(inputs);
      setOutputDevices(outputs);
      
      // Set default selections if not already set
      if (!selectedInputDevice && inputs.length > 0) {
        const defaultInput = inputs.find(d => d.isDefault) || inputs[0];
        setSelectedInputDeviceState(defaultInput.deviceId);
      }
      
      if (!selectedOutputDevice && outputs.length > 0) {
        const defaultOutput = outputs.find(d => d.isDefault) || outputs[0];
        setSelectedOutputDeviceState(defaultOutput.deviceId);
      }
      
      // Check if we have device labels (indicates permission was granted)
      const hasLabels = devices.some(d => d.label && d.label.length > 0);
      setHasPermission(hasLabels);
      
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Failed to get audio devices. Please check your browser settings.');
    } finally {
      setIsLoading(false);
    }
  }, [processDevices, selectedInputDevice, selectedOutputDevice]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop all tracks immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      
      // Refresh devices now that we have permission (labels will be available)
      await refreshDevices();
      
      return true;
    } catch (err: any) {
      console.error('Permission request failed:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to access microphone. Please check your device settings.');
      }
      
      setHasPermission(false);
      return false;
    }
  }, [refreshDevices]);

  const setSelectedInputDevice = useCallback((deviceId: string) => {
    setSelectedInputDeviceState(deviceId);
    // Store preference in localStorage
    localStorage.setItem('preferredInputDevice', deviceId);
  }, []);

  const setSelectedOutputDevice = useCallback((deviceId: string) => {
    setSelectedOutputDeviceState(deviceId);
    // Store preference in localStorage
    localStorage.setItem('preferredOutputDevice', deviceId);
  }, []);

  // Initial device enumeration
  useEffect(() => {
    // Load stored preferences
    const storedInput = localStorage.getItem('preferredInputDevice');
    const storedOutput = localStorage.getItem('preferredOutputDevice');
    
    if (storedInput) setSelectedInputDeviceState(storedInput);
    if (storedOutput) setSelectedOutputDeviceState(storedOutput);
    
    refreshDevices();
  }, []);

  // Listen for device changes (connect/disconnect)
  useEffect(() => {
    const handleDeviceChange = () => {
      console.log('Audio device change detected');
      refreshDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [refreshDevices]);

  return {
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
  };
};
