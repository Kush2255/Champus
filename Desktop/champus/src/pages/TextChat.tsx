import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/ChatMessage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Loader2, 
  Trash2, 
  MessageSquare,
  Search,
  X,
  Keyboard
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  inputType: 'text' | 'voice';
  timestamp: string;
}

/**
 * TEXT CHAT MODULE
 * ================
 * This module provides a dedicated text-based chat interface for IARE campus enquiries.
 * 
 * Features:
 * - Type-based interaction with input field and send button
 * - Chat bubbles with timestamps
 * - Full text chat history stored in database
 * - Search functionality within chat history
 * - Clear history option
 * 
 * Security:
 * - All API calls go through backend edge function
 * - User authentication required
 * - Input validation and sanitization
 */
const TextChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount - filters only text messages
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('input_type', 'text')
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
              inputType: 'text',
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Input validation
    const userMessage = input.trim().slice(0, 1000); // Limit message length
    setInput('');

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      inputType: 'text',
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

      // Save to database with input_type = 'text'
      await supabase.from('chat_history').insert({
        user_id: user?.id,
        user_query: userMessage,
        ai_response: aiResponse,
        input_type: 'text'
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        inputType: 'text',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMessage]);

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
    sendMessage();
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
        .eq('input_type', 'text');

      if (error) throw error;

      setMessages([]);
      toast({
        title: 'Chat Cleared',
        description: 'Your text chat history has been cleared.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear chat history.',
        variant: 'destructive'
      });
    }
  };

  // Filter messages based on search
  const filteredMessages = searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <Card className="mb-4 border-primary/20">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <Keyboard className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Text Chat</CardTitle>
                  <p className="text-sm text-muted-foreground">Type your questions about IARE</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages..."
                      className="w-48"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setIsSearching(false);
                        setSearchQuery('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsSearching(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
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
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Welcome to Text Chat!</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Type your questions about IARE admissions, courses, placements, campus facilities, or any other enquiries.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {['Admission requirements?', 'Placement statistics?', 'Available courses?', 'Campus facilities?'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMessages.map((message) => (
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
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <CardContent className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="flex-1"
                maxLength={1000}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TextChat;
