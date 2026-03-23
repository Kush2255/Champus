import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  isSupported: boolean;
  setOutputDeviceId: (deviceId: string | null) => void;
  outputDeviceId: string | null;
  voiceId: string;
  setVoiceId: (id: string) => void;
}

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const DEFAULT_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // Sarah

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [outputDeviceId, setOutputDeviceIdState] = useState<string | null>(null);
  const [voiceId, setVoiceIdState] = useState<string>(
    () => localStorage.getItem('preferredVoiceId') || DEFAULT_VOICE
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isSupported = true;

  const setOutputDeviceId = useCallback((deviceId: string | null) => {
    setOutputDeviceIdState(deviceId);
    if (deviceId) localStorage.setItem('preferredOutputDevice', deviceId);
  }, []);

  const setVoiceId = useCallback((id: string) => {
    setVoiceIdState(id);
    localStorage.setItem('preferredVoiceId', id);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('preferredOutputDevice');
    if (stored) setOutputDeviceIdState(stored);
  }, []);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (isMuted || !text.trim()) return;
    cancel();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsSpeaking(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        console.error('No auth session for TTS');
        setIsSpeaking(false);
        return;
      }

      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.slice(0, 5000), voiceId }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`TTS failed: ${response.status}`);

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      if (outputDeviceId && 'setSinkId' in audio) {
        try { await (audio as any).setSinkId(outputDeviceId); } catch {}
      }

      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); audioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(audioUrl); audioRef.current = null; };

      audioRef.current = audio;
      await audio.play();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('ElevenLabs TTS error, falling back to browser:', error);
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
          return;
        }
      }
      setIsSpeaking(false);
    }
  }, [isMuted, outputDeviceId, voiceId, cancel]);

  const toggleMute = useCallback(() => {
    if (isSpeaking) cancel();
    setIsMuted(prev => !prev);
  }, [isSpeaking, cancel]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { speak, cancel, isSpeaking, isMuted, toggleMute, isSupported, setOutputDeviceId, outputDeviceId, voiceId, setVoiceId };
};
