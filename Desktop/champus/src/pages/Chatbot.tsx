import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/ChatMessage';
import { VoiceButton } from '@/components/VoiceButton';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Trash2, 
  MessageSquare,
  Mic
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  inputType: 'text' | 'voice';
  timestamp: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  
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
    isMuted, 
    toggleMute,
    isSupported: speechSynthesisSupported 
  } = useSpeechSynthesis();

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
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
              inputType: chat.input_type as 'text' | 'voice',
              timestamp: new Date(chat.created_at).toLocaleTimeString()
            });
            loadedMessages.push({
              id: `${chat.id}-assistant`,
              role: 'assistant',
              content: chat.ai_response,
              inputType: 'text',
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

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

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

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInput('');
      startListening();
    }
  };

  const sendMessage = async (inputType: 'text' | 'voice') => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    resetTranscript();
    stopListening();

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      inputType,
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

      // Save to database
      await supabase.from('chat_history').insert({
        user_id: user?.id,
        user_query: userMessage,
        ai_response: aiResponse,
        input_type: inputType
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        inputType: 'text',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if not muted
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputType = transcript ? 'voice' : 'text';
    sendMessage(inputType);
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);
      toast({
        title: 'Chat Cleared',
        description: 'Your chat history has been cleared.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear chat history.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">IARE Campus Assistant</h1>
              <p className="text-sm text-muted-foreground">Powered by Grok AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {speechSynthesisSupported && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleMute}
                className="flex-shrink-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={clearHistory}
              disabled={messages.length === 0}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to IARE Assistant!</h2>
                <p className="text-muted-foreground max-w-md">
                  Ask me about admissions, courses, placements, campus facilities, or any IARE-related questions.
                </p>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Mic className="h-4 w-4" />
                  <span>Click the microphone to use voice input</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
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
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-card border border-border">
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-background">
            {isListening && (
              <div className="mb-3 flex items-center gap-2 text-sm text-primary animate-pulse">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span>Listening... Speak now</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <VoiceButton
                isListening={isListening}
                isSupported={speechRecognitionSupported}
                onClick={handleVoiceToggle}
                disabled={isLoading}
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message or use voice..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chatbot;
