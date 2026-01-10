import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/ChatMessage';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Mic,
  MicOff,
  Send,
  Square,
  AlertCircle,
  Headphones
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  inputType: 'text' | 'voice';
  timestamp: string;
}

/**
 * VOICE CHAT MODULE
 * =================
 * This module provides a dedicated voice-based chat interface for IARE campus enquiries.
 * 
 * HARDWARE INTEGRATION:
 * - Uses external USB microphone through Web Speech API
 * - Hardware Flow: USB Microphone → Browser Microphone Access → SpeechRecognition API
 *   → Text Conversion → Backend API → Grok (xAI) API → Text Response → SpeechSynthesis → Audio Output
 * 
 * Features:
 * - Microphone button with start/stop controls
 * - Real-time speech-to-text display
 * - Auto-send or confirm voice input before sending
 * - Voice response playback using text-to-speech
 * - Mute/unmute option for voice output
 * 
 * Error Handling:
 * - Mic not available detection
 * - Permission denied handling
 * - Timeout handling
 * - Fallback to text chat if voice fails
 * 
 * Security:
 * - All API calls go through backend edge function
 * - User authentication required
 * - Microphone permission handled securely
 */
const VoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [autoSend, setAutoSend] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    transcript, 
    isListening, 
    error: speechError, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: speechRecognitionSupported 
  } = useSpeechRecognition();
  
  const { 
    speak, 
    cancel: cancelSpeech,
    isSpeaking,
    isMuted, 
    toggleMute,
    isSupported: speechSynthesisSupported 
  } = useSpeechSynthesis();

  // Load voice chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('input_type', 'voice')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        if (data) {
          const loadedMessages: Message[] = [];
          data.forEach((chat) => {
            loadedMessages.push({
              id: `${chat.id}-user`,
              role: 'user',
              content: chat.user_query,
              inputType: 'voice',
              timestamp: new Date(chat.created_at).toLocaleTimeString()
            });
            loadedMessages.push({
              id: `${chat.id}-assistant`,
              role: 'assistant',
              content: chat.ai_response,
              inputType: 'voice',
              timestamp: new Date(chat.created_at).toLocaleTimeString()
            });
          });
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user]);

  // Update current transcript when speech recognition provides new text
  useEffect(() => {
    if (transcript) {
      setCurrentTranscript(transcript);
      
      // Auto-send after 2 seconds of silence if enabled
      if (autoSend && !isListening) {
        if (autoSendTimeoutRef.current) {
          clearTimeout(autoSendTimeoutRef.current);
        }
        autoSendTimeoutRef.current = setTimeout(() => {
          if (transcript.trim()) {
            sendMessage(transcript.trim());
          }
        }, 2000);
      }
    }
  }, [transcript, isListening, autoSend]);

  // Show speech recognition errors
  useEffect(() => {
    if (speechError) {
      toast({
        title: 'Voice Recognition Error',
        description: speechError,
        variant: 'destructive'
      });
    }
  }, [speechError, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSendTimeoutRef.current) {
        clearTimeout(autoSendTimeoutRef.current);
      }
    };
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setCurrentTranscript('');
      startListening();
    }
  };

  const sendMessage = async (messageText?: string) => {
    const userMessage = (messageText || currentTranscript).trim();
    if (!userMessage || isLoading) return;

    // Clear transcript and stop listening
    resetTranscript();
    setCurrentTranscript('');
    stopListening();

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      inputType: 'voice',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-grok', {
        body: { 
          message: userMessage,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const aiResponse = data.response || 'I apologize, but I was unable to generate a response. Please try again.';

      // Save to database with input_type = 'voice'
      await supabase.from('chat_history').insert({
        user_id: user?.id,
        user_query: userMessage,
        ai_response: aiResponse,
        input_type: 'voice'
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        inputType: 'voice',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak the response if not muted
      if (!isMuted && speechSynthesisSupported) {
        speak(aiResponse);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to get a response. Please try again.';
      if (error.message?.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('402')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
        .eq('input_type', 'voice');

      if (error) throw error;

      setMessages([]);
      toast({
        title: 'Chat Cleared',
        description: 'Your voice chat history has been cleared.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear chat history.',
        variant: 'destructive'
      });
    }
  };

  if (!speechRecognitionSupported) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Voice Chat Unavailable</AlertTitle>
            <AlertDescription>
              Your browser doesn't support voice recognition. Please use a modern browser like Chrome, Edge, or Safari,
              or switch to <a href="/text-chat" className="underline font-medium">Text Chat</a> instead.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <Card className="mb-4 border-primary/20">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <Headphones className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Voice Chat</CardTitle>
                  <p className="text-sm text-muted-foreground">Speak your questions about IARE</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Auto-send toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-send"
                    checked={autoSend}
                    onCheckedChange={setAutoSend}
                  />
                  <Label htmlFor="auto-send" className="text-sm">Auto-send</Label>
                </div>
                
                {/* Mute toggle */}
                {speechSynthesisSupported && (
                  <Button 
                    variant={isMuted ? "outline" : "secondary"}
                    size="icon"
                    onClick={toggleMute}
                    title={isMuted ? "Unmute responses" : "Mute responses"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
                
                {/* Clear history */}
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={clearHistory}
                  disabled={messages.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 && !currentTranscript ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 relative">
                  <Mic className="h-12 w-12 text-primary" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Welcome to Voice Chat!</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Click the microphone button below and speak your question about IARE. 
                  Your voice will be converted to text and sent to our AI assistant.
                </p>
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 max-w-md">
                  <p className="font-medium mb-2">💡 Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>Speak clearly near your microphone</li>
                    <li>Enable "Auto-send" for hands-free mode</li>
                    <li>Toggle mute to control voice responses</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    inputType={message.inputType}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-muted/50 border border-border">
                      <span className="text-sm text-muted-foreground">Processing voice input...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Voice Input Area */}
          <CardContent className="border-t border-border p-6">
            {/* Live transcript display */}
            {(isListening || currentTranscript) && (
              <div className="mb-4 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {isListening && (
                    <span className="flex items-center gap-2 text-sm text-destructive animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-destructive" />
                      Listening...
                    </span>
                  )}
                </div>
                <p className="text-sm min-h-[2rem]">
                  {currentTranscript || <span className="text-muted-foreground italic">Speak now...</span>}
                </p>
              </div>
            )}

            {/* Voice controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Main microphone button */}
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                onClick={handleVoiceToggle}
                disabled={isLoading}
                className="h-16 w-16 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isListening ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              {/* Send button - visible when transcript exists */}
              {currentTranscript && !autoSend && (
                <Button
                  size="lg"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !currentTranscript.trim()}
                  className="h-16 px-8 rounded-full shadow-lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </Button>
              )}

              {/* Stop speaking button */}
              {isSpeaking && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={cancelSpeech}
                  className="h-16 px-6 rounded-full"
                >
                  <VolumeX className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {isListening ? 'Tap the button to stop recording' : 'Tap the microphone to start speaking'}
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VoiceChat;
