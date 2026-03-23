import { useState, useEffect, useRef, useCallback } from 'react';

interface VADOptions {
  silenceThreshold?: number; // 0-1, below this = silence
  silenceTimeout?: number; // ms of silence before triggering
  onSilenceDetected?: () => void;
  onSpeechDetected?: () => void;
}

interface VADResult {
  isSpeechActive: boolean;
  noiseLevel: number; // 0-1 ambient noise level
  silenceDuration: number; // ms of current silence
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useVoiceActivityDetection = (
  stream: MediaStream | null,
  isActive: boolean,
  options: VADOptions = {}
): VADResult => {
  const {
    silenceThreshold = 0.08,
    silenceTimeout = 2000,
    onSilenceDetected,
    onSpeechDetected,
  } = options;

  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [silenceDuration, setSilenceDuration] = useState(0);
  const [audioQuality, setAudioQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  const animationRef = useRef<number>();
  const silenceStartRef = useRef<number | null>(null);
  const wasSpeakingRef = useRef(false);
  const noiseSamplesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!stream || !isActive) {
      setIsSpeechActive(false);
      setNoiseLevel(0);
      setSilenceDuration(0);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.85;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const detect = () => {
      if (!isActive) return;
      animationRef.current = requestAnimationFrame(detect);

      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length) / 128;
      const level = Math.min(rms, 1);

      // Track noise samples for quality assessment
      noiseSamplesRef.current.push(level);
      if (noiseSamplesRef.current.length > 100) noiseSamplesRef.current.shift();

      const avgNoise = noiseSamplesRef.current.reduce((a, b) => a + b, 0) / noiseSamplesRef.current.length;
      setNoiseLevel(avgNoise);

      // Assess audio quality
      if (avgNoise < 0.03) setAudioQuality('excellent');
      else if (avgNoise < 0.08) setAudioQuality('good');
      else if (avgNoise < 0.15) setAudioQuality('fair');
      else setAudioQuality('poor');

      const speaking = level > silenceThreshold;

      if (speaking) {
        silenceStartRef.current = null;
        setSilenceDuration(0);
        if (!wasSpeakingRef.current) {
          wasSpeakingRef.current = true;
          setIsSpeechActive(true);
          onSpeechDetected?.();
        }
      } else {
        if (wasSpeakingRef.current) {
          if (!silenceStartRef.current) {
            silenceStartRef.current = Date.now();
          }
          const elapsed = Date.now() - silenceStartRef.current;
          setSilenceDuration(elapsed);

          if (elapsed >= silenceTimeout) {
            wasSpeakingRef.current = false;
            setIsSpeechActive(false);
            onSilenceDetected?.();
            silenceStartRef.current = null;
          }
        }
      }
    };

    detect();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream, isActive, silenceThreshold, silenceTimeout, onSilenceDetected, onSpeechDetected]);

  return { isSpeechActive, noiseLevel, silenceDuration, audioQuality };
};
