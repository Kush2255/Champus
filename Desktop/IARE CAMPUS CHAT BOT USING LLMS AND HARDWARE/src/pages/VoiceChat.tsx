import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { WaveformAnimation, PulseRing, AudioVisualizer } from '@/components/WaveformAnimation';
import { VUMeter } from '@/components/VUMeter';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import { useVoiceActivityDetection } from '@/hooks/useVoiceActivityDetection';
import { AudioDeviceSelector } from '@/components/AudioDeviceSelector';
import { VoiceSelector } from '@/components/VoiceSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AudioQualityIndicator } from '@/components/AudioQualityIndicator';
import { SilenceTimer } from '@/components/SilenceTimer';
import { NotificationToggle } from '@/components/NotificationToggle';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Volume2, VolumeX, Trash2, Mic, MicOff, Send, Square,
  AlertCircle, Headphones, Settings2, Bluetooth, Usb, Gauge
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SubtleGridBackground } from '@/components/backgrounds/SubtleGridBackground';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  inputType: 'text' | 'voice';
  timestamp: string;
  isNew?: boolean;
}

const SILENCE_TIMEOUT = 3000;

const VoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [autoSend, setAutoSend] = useState(false);
  const [vadAutoStop, setVadAutoStop] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('voiceLang') || 'en-US');
  const [ttsSpeed, setTtsSpeed] = useState(() => {
    const stored = localStorage.getItem('ttsSpeed');
    return stored ? parseFloat(stored) : 1.0;
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendNotification } = useNotifications();
  const viewportRef = useRef<HTMLDivElement>(null);
  const autoSendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { inputDevices, outputDevices, selectedInputDevice, selectedOutputDevice, setSelectedOutputDevice, hasPermission: hasAudioPermission, requestPermission: requestAudioPermission } = useAudioDevices();
  const { transcript, isListening, error: speechError, startListening, stopListening, resetTranscript, isSupported: speechRecognitionSupported, mediaStream } = useSpeechRecognition(language);
  const { speak, cancel: cancelSpeech, isSpeaking, isMuted, toggleMute, isSupported: speechSynthesisSupported, setOutputDeviceId, voiceId, setVoiceId } = useSpeechSynthesis();

  // Voice Activity Detection
  const handleSilenceDetected = useCallback(() => {
    if (vadAutoStop && isListening && currentTranscript.trim()) {
      stopListening();
      if (autoSend) {
        sendMessage(currentTranscript.trim());
      }
    }
  }, [vadAutoStop, isListening, currentTranscript, autoSend]);

  const { isSpeechActive, noiseLevel, silenceDuration, audioQuality } = useVoiceActivityDetection(
    mediaStream,
    isListening,
    { silenceTimeout: SILENCE_TIMEOUT, onSilenceDetected: handleSilenceDetected }
  );

  useEffect(() => { if (selectedOutputDevice) setOutputDeviceId(selectedOutputDevice); }, [selectedOutputDevice, setOutputDeviceId]);

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    localStorage.setItem('voiceLang', code);
    if (isListening) {
      stopListening();
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setTtsSpeed(value[0]);
    localStorage.setItem('ttsSpeed', String(value[0]));
  };

  const currentDevice = inputDevices.find(d => d.deviceId === selectedInputDevice);

  // Load voice chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from('chat_history').select('*').eq('input_type', 'voice').order('created_at', { ascending: true }).limit(50);
        if (error) throw error;
        if (data) {
          const loaded: Message[] = [];
          data.forEach((chat) => {
            loaded.push({ id: `${chat.id}-user`, role: 'user', content: chat.user_query, inputType: 'voice', timestamp: new Date(chat.created_at).toLocaleTimeString() });
            loaded.push({ id: `${chat.id}-assistant`, role: 'assistant', content: chat.ai_response, inputType: 'voice', timestamp: new Date(chat.created_at).toLocaleTimeString() });
          });
          setMessages(loaded);
        }
      } catch (error) { console.error('Error loading chat history:', error); }
      finally { setIsLoadingHistory(false); }
    };
    loadChatHistory();
  }, [user]);

  useEffect(() => {
    if (transcript) {
      setCurrentTranscript(transcript);
      if (autoSend && !isListening) {
        if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
        autoSendTimeoutRef.current = setTimeout(() => { if (transcript.trim()) sendMessage(transcript.trim()); }, 2000);
      }
    }
  }, [transcript, isListening, autoSend]);

  useEffect(() => { if (speechError) toast({ title: 'Voice Recognition Error', description: speechError, variant: 'destructive' }); }, [speechError, toast]);
  useEffect(() => { if (viewportRef.current) viewportRef.current.scrollTop = viewportRef.current.scrollHeight; }, [messages]);
  useEffect(() => { return () => { if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current); }; }, []);

  const handleVoiceToggle = async () => {
    if (isListening) { stopListening(); return; }
    if (!hasAudioPermission) {
      const granted = await requestAudioPermission();
      if (!granted) { toast({ title: 'Microphone Access Required', description: 'Please allow microphone access.', variant: 'destructive' }); return; }
    }
    resetTranscript(); setCurrentTranscript('');
    startListening(selectedInputDevice || undefined);
  };

  const sendMessage = async (messageText?: string) => {
    const userMessage = (messageText || currentTranscript).trim();
    if (!userMessage || isLoading) return;
    resetTranscript(); setCurrentTranscript(''); stopListening();
    setMessages(prev => [...prev, { id: `temp-${Date.now()}`, role: 'user', content: userMessage, inputType: 'voice', timestamp: new Date().toLocaleTimeString() }]);
    setIsLoading(true);
    try {
      const langLabel = language !== 'en-US' ? ` (User is speaking in ${language}. Respond in the same language.)` : '';
      const { data, error } = await supabase.functions.invoke('chat-grok', { body: { message: userMessage + langLabel, conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })) } });
      if (error) throw error;
      const aiResponse = data.response || 'I apologize, but I was unable to generate a response.';
      await supabase.from('chat_history').insert({ user_id: user?.id, user_query: userMessage, ai_response: aiResponse, input_type: 'voice' });
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: aiResponse, inputType: 'voice', timestamp: new Date().toLocaleTimeString(), isNew: true }]);
      if (!isMuted && speechSynthesisSupported) speak(aiResponse);
      sendNotification({ title: 'IARE Voice Assistant', body: aiResponse.slice(0, 100), tag: 'voice-response' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorMessage = 'Failed to get a response. Please try again.';
      const raw = String(error?.message || '');
      if (raw.includes('429')) errorMessage = 'Too many requests. Please wait.';
      else if (raw.includes('403') || raw.toLowerCase().includes('credits')) errorMessage = 'AI service unavailable. Try again later.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const clearHistory = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('chat_history').delete().eq('user_id', user.id).eq('input_type', 'voice');
      if (error) throw error;
      setMessages([]); toast({ title: 'Chat Cleared', description: 'Voice chat history cleared.' });
    } catch (error) { toast({ title: 'Error', description: 'Failed to clear history.', variant: 'destructive' }); }
  };

  if (!speechRecognitionSupported) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Voice Chat Unavailable</AlertTitle>
          <AlertDescription>
            Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari,
            or switch to <a href="/text-chat" className="underline font-medium">Text Chat</a>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background animate-fade-in relative">
      <SubtleGridBackground />
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-card/80 backdrop-blur-md flex-shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Headphones className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">IARE Voice Chat</h1>
            <p className="text-xs text-muted-foreground">Speak your questions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSelector value={language} onChange={handleLanguageChange} compact />
          <Button variant={showDeviceSettings ? 'secondary' : 'ghost'} size="icon" onClick={() => setShowDeviceSettings(!showDeviceSettings)}>
            <Settings2 className="h-4 w-4" />
          </Button>
          <div className="hidden sm:flex items-center gap-2">
            <Switch id="auto-send" checked={autoSend} onCheckedChange={setAutoSend} />
            <Label htmlFor="auto-send" className="text-xs">Auto-send</Label>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Switch id="vad-stop" checked={vadAutoStop} onCheckedChange={setVadAutoStop} />
            <Label htmlFor="vad-stop" className="text-xs">VAD</Label>
          </div>
          {speechSynthesisSupported && (
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
          <NotificationToggle />
          <Button variant="ghost" size="icon" onClick={clearHistory} disabled={messages.length === 0}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Device settings collapsible */}
      <Collapsible open={showDeviceSettings} onOpenChange={setShowDeviceSettings}>
        <CollapsibleContent className="px-4 md:px-8 py-4 space-y-4 border-b border-border bg-card/50">
          <AudioDeviceSelector showOutputDevice={true} />
          <VoiceSelector value={voiceId} onChange={setVoiceId} />
          <LanguageSelector value={language} onChange={handleLanguageChange} />
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Speech Speed: {ttsSpeed.toFixed(1)}x
            </Label>
            <Slider
              value={[ttsSpeed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full max-w-xs"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Conversation area */}
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto py-6 px-2">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 && !currentTranscript ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in">
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 relative">
                <Mic className="h-14 w-14 text-primary" />
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Voice Assistant Ready</h2>
              <p className="text-lg text-muted-foreground max-w-md mb-4">
                Click the microphone below and speak your question about IARE.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded-full bg-muted">🎙️ Noise Cancellation</span>
                <span className="px-2 py-1 rounded-full bg-muted">🗣️ Voice Activity Detection</span>
                <span className="px-2 py-1 rounded-full bg-muted">🌐 Multi-language</span>
                <span className="px-2 py-1 rounded-full bg-muted">🔔 Notifications</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <ChatMessage key={message.id} role={message.role} content={message.content} inputType={message.inputType} timestamp={message.timestamp} isNew={message.isNew} />
              ))}
              {isLoading && (
                <div className="flex gap-3 p-4 animate-fade-in">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-muted/50 border border-border text-base">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Voice controls */}
      <div className="border-t border-border bg-card/80 backdrop-blur-md p-6 md:p-8 flex-shrink-0">
        {/* Live transcript */}
        {(isListening || currentTranscript) && (
          <div className="mb-5 p-4 rounded-xl bg-muted/50 border border-border max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isListening && (
                <span className="flex items-center gap-2 text-sm text-destructive animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-destructive" />Listening...
                </span>
              )}
              {isListening && (
                <AudioQualityIndicator quality={audioQuality} noiseLevel={noiseLevel} />
              )}
              {isListening && vadAutoStop && (
                <SilenceTimer
                  silenceDuration={silenceDuration}
                  silenceTimeout={SILENCE_TIMEOUT}
                  isActive={isListening && !isSpeechActive && currentTranscript.trim().length > 0}
                />
              )}
              {currentDevice && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  {currentDevice.deviceType === 'bluetooth' ? <Bluetooth className="h-3 w-3" /> : currentDevice.deviceType === 'usb' ? <Usb className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  {currentDevice.label.substring(0, 20)}
                </span>
              )}
            </div>
            <p className="text-base min-h-[2rem]">
              {currentTranscript || <span className="text-muted-foreground italic">Speak now...</span>}
            </p>
          </div>
        )}

        {/* Waveform */}
        {isListening && mediaStream && (
          <div className="mb-5 flex justify-center">
            <AudioVisualizer stream={mediaStream} isActive={isListening} className="w-full max-w-xl h-20 bg-muted/30 border border-border rounded-xl" />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <div className="h-20 flex items-center">
            <VUMeter stream={mediaStream} isActive={isListening} barCount={12} orientation="vertical" />
          </div>

          <div className="relative">
            <PulseRing isActive={isListening} />
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={cn(
                "h-20 w-20 rounded-full shadow-xl transition-all duration-200 hover:scale-110 relative z-10",
                isListening && isSpeechActive && "ring-4 ring-primary/50"
              )}
            >
              {isListening ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          <div className="h-20 flex items-center">
            <VUMeter stream={mediaStream} isActive={isListening} barCount={12} orientation="vertical" />
          </div>

          {currentTranscript && !autoSend && (
            <Button size="lg" onClick={() => sendMessage()} disabled={isLoading || !currentTranscript.trim()} className="h-20 px-10 rounded-full shadow-xl text-lg">
              <Send className="h-6 w-6 mr-2" />Send
            </Button>
          )}

          {isSpeaking && (
            <Button size="lg" variant="outline" onClick={cancelSpeech} className="h-20 px-8 rounded-full">
              <VolumeX className="h-6 w-6 mr-2" />Stop
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isListening 
            ? vadAutoStop 
              ? 'Speaking detected — will auto-stop after silence' 
              : 'Tap to stop recording'
            : 'Tap the microphone to start speaking'}
        </p>
      </div>
    </div>
  );
};

export default VoiceChat;
