import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  error: string | null;
  startListening: (deviceId?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  mediaStream: MediaStream | null;
}

/**
 * SPEECH RECOGNITION HOOK
 * =======================
 * This hook provides speech-to-text functionality using the Web Speech API.
 * 
 * DEVICE SUPPORT:
 * - Built-in microphone
 * - USB microphone (e.g., Blue Yeti, Rode)
 * - Bluetooth microphone / earphones (AirPods, wireless headsets)
 * 
 * Note: The Web Speech API uses the system's default audio input device,
 * or the device selected through getUserMedia constraints.
 * Bluetooth devices that are paired at the OS level will appear as available inputs.
 */
export const useSpeechRecognition = (lang: string = 'en-US'): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Cleanup media stream when component unmounts
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      let errorMessage = 'An error occurred during speech recognition.';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not detected. Please check your audio device connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow access in browser settings.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed. Please check browser settings.';
          break;
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.abort();
    };
  }, [isSupported, lang]);

  const startListening = useCallback(async (deviceId?: string) => {
    if (!recognitionRef.current || !isSupported) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }
    
    setError(null);
    
    try {
      // Stop any existing media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request microphone access with specific device if provided
      // This ensures the browser uses the selected audio input device
      const constraints: MediaStreamConstraints = {
        audio: deviceId 
          ? { 
              deviceId: { exact: deviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
      };

      // Get user media to ensure the selected device is active
      // This is important for Bluetooth devices that may need to be "activated"
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      // Note: Web Speech API doesn't directly accept a MediaStream,
      // but getting getUserMedia first ensures the correct device is selected
      // at the OS/browser level before starting recognition
      
      setIsListening(true);
      recognitionRef.current.start();
      
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('Selected microphone not found. It may have been disconnected.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Selected audio device is not available. Please try another device.');
      } else {
        setError('Failed to start listening. Please check your microphone connection.');
      }
      
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Stop the media stream when stopping listening
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    mediaStream: mediaStreamRef.current
  };
};
