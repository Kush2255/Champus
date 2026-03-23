import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/components/ChatMessage';
import { TypingIndicator } from '@/components/TypingIndicator';
import { MessageActions } from '@/components/MessageActions';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptTemplates } from '@/components/PromptTemplates';
import { ChatExport } from '@/components/ChatExport';
import { useAuth } from '@/hooks/useAuth';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, Loader2, Trash2, MessageSquare, Search, X,
  Keyboard, Sparkles, Image as ImageIcon, RefreshCw, Pencil, Download,
  SlidersHorizontal, ChevronDown, LayoutGrid
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ImageGalleryTab } from '@/components/ImageGalleryTab';
import { SubtleGridBackground } from '@/components/backgrounds/SubtleGridBackground';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  inputType: 'text' | 'voice';
  timestamp: string;
  isNew?: boolean;
  images?: Array<{ type: string; image_url: { url: string }; photographer?: string; alt?: string; pexels_url?: string }>;
  originalPrompt?: string;
  isRealImages?: boolean;
}

const TextChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [imageOrientation, setImageOrientation] = useState<string>('any');
  const [imageSize, setImageSize] = useState<string>('any');
  const [imageColor, setImageColor] = useState<string>('any');
  const [showImageFilters, setShowImageFilters] = useState(false);
  const [imageMode, setImageMode] = useState<'off' | 'ai' | 'real'>('off');
  const [activeTab, setActiveTab] = useState<'chat' | 'gallery'>('chat');

  useEffect(() => {
    const state = location.state as { prefillQuery?: string } | null;
    if (state?.prefillQuery) {
      setInput(state.prefillQuery);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
            loadedMessages.push({ id: `${chat.id}-user`, role: 'user', content: chat.user_query, inputType: 'text', timestamp: new Date(chat.created_at).toLocaleTimeString() });
            const parsedImages = (chat as any).images as Message['images'] | null;
            loadedMessages.push({ id: `${chat.id}-assistant`, role: 'assistant', content: chat.ai_response, inputType: 'text', timestamp: new Date(chat.created_at).toLocaleTimeString(), images: parsedImages || undefined, isRealImages: !!(parsedImages && parsedImages.length > 0) });
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

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeak = (messageId: string, content: string) => {
    if (speakingMessageId === messageId && isSpeaking) {
      cancelSpeech();
      setSpeakingMessageId(null);
    } else {
      speak(content);
      setSpeakingMessageId(messageId);
    }
  };

  const regenerateImage = async (messageId: string, prompt: string) => {
    setRegeneratingId(messageId);
    try {
      const { data, error } = await supabase.functions.invoke('chat-grok', {
        body: { message: prompt, conversationHistory: [], selectedModel, generateImageRequest: true }
      });
      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, images: data.images, content: data.response || m.content, isNew: false } : m));
      toast({ description: 'Image regenerated!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to regenerate image.', variant: 'destructive' });
    } finally {
      setRegeneratingId(null);
    }
  };

  const editImage = async (messageId: string, sourceImageUrl: string) => {
    if (!editPrompt.trim()) return;
    const prompt = editPrompt.trim();
    setEditPrompt('');
    setEditingImageId(null);
    setRegeneratingId(messageId);
    try {
      const { data, error } = await supabase.functions.invoke('chat-grok', {
        body: { message: prompt, conversationHistory: [], selectedModel, editImageRequest: true, sourceImageUrl }
      });
      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, images: data.images, content: data.response || m.content, isNew: false } : m));
      toast({ description: 'Image edited!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to edit image.', variant: 'destructive' });
    } finally {
      setRegeneratingId(null);
    }
  };

  const isRealImageSearch = (text: string) => {
    const lower = text.toLowerCase();
    const realKeywords = ['real photo', 'real picture', 'real image', 'real pics', 'stock photo', 'actual photo', 'find photo', 'find image', 'find picture', 'search photo', 'search image', 'search picture', 'show me photos', 'show me pictures', 'show me images', 'pics of', 'photos of', 'pictures of', 'images of'];
    const aiExclusions = ['generate', 'create', 'draw', 'design', 'make an', 'ai image', 'ai photo'];
    if (realKeywords.some(k => lower.includes(k)) && !aiExclusions.some(k => lower.includes(k))) return true;
    // Detect "college/collage images" pattern as real image search (not AI generation)
    if (/\b(college|collage|institute|university|campus)\b/.test(lower) && /\b(images?|photos?|pictures?|pics)\b/.test(lower) && !aiExclusions.some(k => lower.includes(k))) return true;
    // Detect "college + specific place/building" as real image search (e.g. "IARE college auditorium")
    if (/\b(college|collage|institute|university|campus)\b/.test(lower) && /\b(auditorium|hostel|library|lab|canteen|cafeteria|playground|ground|gate|entrance|building|block|department|corridor|garden|park|stadium|gym|hall|room|class|seminar)\b/.test(lower) && !aiExclusions.some(k => lower.includes(k))) return true;
    return false;
  };

  const isImageRequest = (text: string) => {
    if (isRealImageSearch(text)) return false; // real image search handled separately
    const lower = text.toLowerCase();
    const imgKeywords = ['image', 'picture', 'photo', 'illustration', 'drawing', 'iamge', 'imge', 'pictur'];
    const genKeywords = ['generate', 'create', 'draw', 'make', 'genrate', 'genrete', 'creat', 'design', 'show', 'give', 'build'];
    // "collage" removed from standalone triggers - too often a misspelling of "college"
    const standaloneTriggers = ['poster', 'banner', 'wallpaper', 'artwork', 'sketch'];
    const hasImgWord = imgKeywords.some(k => lower.includes(k));
    const hasGenWord = genKeywords.some(k => lower.includes(k));
    const hasStandalone = standaloneTriggers.some(k => lower.includes(k));
    // "collage" only triggers AI gen when combined with explicit gen keywords like "create a collage"
    const isExplicitCollage = lower.includes('collage') && genKeywords.some(k => lower.includes(k));
    return (hasImgWord && hasGenWord) || hasStandalone || isExplicitCollage || lower.startsWith('draw ') || lower.startsWith('/image ');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim().slice(0, 1000);
    setInput('');
    const tempUserMessage: Message = { id: `temp-${Date.now()}`, role: 'user', content: userMessage, inputType: 'text', timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    const shouldGenImage = imageMode === 'ai' || (imageMode === 'off' && isImageRequest(userMessage));
    const shouldSearchReal = imageMode === 'real' || (imageMode === 'off' && isRealImageSearch(userMessage));

    try {
      const imageSearchFilters = shouldSearchReal ? {
        orientation: imageOrientation !== 'any' ? imageOrientation : undefined,
        size: imageSize !== 'any' ? imageSize : undefined,
        color: imageColor !== 'any' ? imageColor : undefined,
      } : {};

      const { data, error } = await supabase.functions.invoke('chat-grok', {
        body: { 
          message: shouldGenImage ? userMessage.replace(/^\/image\s*/i, '') : userMessage,
          conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          selectedModel,
          generateImageRequest: shouldGenImage,
          searchRealImagesRequest: shouldSearchReal,
          imageSearchFilters,
        }
      });
      if (error) throw error;

      const aiResponse = data.response || 'I apologize, but I was unable to generate a response. Please try again.';
      const provider = data.provider || '';
      
      await supabase.from('chat_history').insert({ user_id: user?.id, user_query: userMessage, ai_response: aiResponse, input_type: 'text', images: data.images || null } as any);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        inputType: 'text',
        timestamp: new Date().toLocaleTimeString(),
        isNew: true,
        images: data.images,
        originalPrompt: (shouldGenImage || data.images?.length) && !data.isRealImages ? userMessage : undefined,
        isRealImages: data.isRealImages || false,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (provider && !provider.includes('fallback')) {
        // silently note provider
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorMessage = 'Failed to get a response. Please try again.';
      const raw = String(error?.message || '');
      if (raw.includes('429')) errorMessage = 'Too many requests. Please wait a moment and try again.';
      else if (raw.includes('403') || raw.toLowerCase().includes('credits') || raw.toLowerCase().includes('licenses')) errorMessage = 'AI service is unavailable right now. Please try again later.';
      else if (raw.includes('402')) errorMessage = 'Service temporarily unavailable. Please try again later.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('chat_history').delete().eq('user_id', user.id).eq('input_type', 'text');
      if (error) throw error;
      setMessages([]);
      toast({ title: 'Chat Cleared', description: 'Your text chat history has been cleared.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear chat history.', variant: 'destructive' });
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-screen bg-background animate-fade-in relative">
      <SubtleGridBackground />
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-card/80 backdrop-blur-md flex-shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Keyboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">IARE Text Chat</h1>
            <p className="text-xs text-muted-foreground">AI-powered campus assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={activeTab === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chat')}
            className="h-8 text-xs gap-1"
          >
            <MessageSquare className="h-3.5 w-3.5" />Chat
          </Button>
          <Button
            variant={activeTab === 'gallery' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('gallery')}
            className="h-8 text-xs gap-1"
          >
            <LayoutGrid className="h-3.5 w-3.5" />Gallery
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'chat' && <ModelSelector value={selectedModel} onChange={setSelectedModel} className="w-[160px] h-9 text-xs" />}
          {activeTab === 'chat' && (isSearching ? (
            <div className="flex items-center gap-2 animate-fade-in">
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search messages..." className="w-48" autoFocus />
              <Button variant="ghost" size="icon" onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setIsSearching(true)}><Search className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Search</TooltipContent></Tooltip>
          ))}
          {activeTab === 'chat' && <ChatExport messages={messages} disabled={messages.length === 0} />}
          {activeTab === 'chat' && <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={clearHistory} disabled={messages.length === 0}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Clear</TooltipContent></Tooltip>}
        </div>
      </header>

      {activeTab === 'gallery' ? (
        <ScrollArea className="flex-1">
          <ImageGalleryTab />
        </ScrollArea>
      ) : (
      <>
      {/* Chat area */}
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto py-6 px-2">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome to IARE Assistant</h2>
              <p className="text-lg text-muted-foreground max-w-lg mb-8">
                Ask about admissions, courses, placements, campus facilities, or generate images with AI.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {['Admission requirements?', 'Placement statistics?', 'Available courses?', 'Generate campus image'].map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => setInput(s)} className="text-sm hover:scale-105 transition-transform">
                    {s.includes('image') ? <ImageIcon className="h-3 w-3 mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}{s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMessages.map((message) => (
                <div key={message.id} className="group animate-fade-in">
                  <ChatMessage role={message.role} content={message.content} inputType={message.inputType} timestamp={message.timestamp} isNew={message.isNew} />
                  {/* Render generated images */}
                  {message.images && message.images.length > 0 && (
                    <div className="ml-14 mt-2 mb-4">
                      <div className={cn(
                        "grid gap-3",
                        message.isRealImages ? "grid-cols-2 md:grid-cols-3" : "flex flex-wrap"
                      )}>
                        {message.images.map((img, idx) => (
                          <div key={idx} className="relative group/img">
                            <img
                              src={img.image_url.url}
                              alt={img.alt || 'Image'}
                              className={cn(
                                "rounded-xl border border-border shadow-lg object-cover",
                                message.isRealImages ? "w-full h-48" : "max-w-sm max-h-80 object-contain"
                              )}
                            />
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a href={img.image_url.url} download={`image-${Date.now()}-${idx}.png`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>Download image</TooltipContent>
                              </Tooltip>
                            </div>
                            {img.photographer && (
                              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-b-xl text-muted-foreground">
                                📷 {img.photographer}
                                {img.pexels_url && (
                                  <a href={img.pexels_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">
                                    (Pexels)
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Only show edit/regenerate for AI-generated images */}
                      {!message.isRealImages && (
                        <>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {message.originalPrompt && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    disabled={regeneratingId === message.id}
                                    onClick={() => regenerateImage(message.id, message.originalPrompt!)}
                                  >
                                    <RefreshCw className={cn("h-3.5 w-3.5", regeneratingId === message.id && "animate-spin")} />
                                    {regeneratingId === message.id ? 'Working...' : 'Regenerate'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Generate a new image with the same prompt</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                  disabled={regeneratingId === message.id}
                                  onClick={() => setEditingImageId(editingImageId === message.id ? null : message.id)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Modify this image with a follow-up prompt</TooltipContent>
                            </Tooltip>
                          </div>
                          {editingImageId === message.id && (
                            <div className="flex gap-2 mt-2 animate-fade-in">
                              <Input
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="e.g. Make it darker, add more students..."
                                className="flex-1 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    editImage(message.id, message.images![0].image_url.url);
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                disabled={!editPrompt.trim() || regeneratingId === message.id}
                                onClick={() => editImage(message.id, message.images![0].image_url.url)}
                              >
                                <Send className="h-3.5 w-3.5 mr-1" />
                                Apply
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end -mt-2 mb-2">
                    <MessageActions content={message.content} messageId={message.id} isAssistant={message.role === 'assistant'} onSpeak={message.role === 'assistant' ? () => handleSpeak(message.id, message.content) : undefined} isSpeaking={speakingMessageId === message.id && isSpeaking} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 p-4 animate-fade-in">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-muted/50 border border-border">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-md p-4 flex-shrink-0">
        <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PromptTemplates onSelect={(prompt) => setInput(prompt)} />
            {/* Image mode toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={imageMode === 'off' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2.5 text-xs rounded-md"
                    onClick={() => setImageMode('off')}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat mode (auto-detect)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={imageMode === 'ai' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2.5 text-xs rounded-md"
                    onClick={() => setImageMode('ai')}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI image generation</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={imageMode === 'real' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2.5 text-xs rounded-md"
                    onClick={() => setImageMode('real')}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Real photo search (Pexels)</TooltipContent>
              </Tooltip>
            </div>
            {/* Filters for real image mode */}
            {(imageMode === 'real' || (imageMode === 'off' && isRealImageSearch(input))) && (
              <Popover open={showImageFilters} onOpenChange={setShowImageFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {(imageOrientation !== 'any' || imageSize !== 'any' || imageColor !== 'any') && (
                      <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                        {[imageOrientation, imageSize, imageColor].filter(v => v !== 'any').length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4" align="start">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Image Search Filters</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Orientation</label>
                      <Select value={imageOrientation} onValueChange={setImageOrientation}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Size</label>
                      <Select value={imageSize} onValueChange={setImageSize}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="small">Small</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Color</label>
                      <Select value={imageColor} onValueChange={setImageColor}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Color</SelectItem>
                          <SelectItem value="red">🔴 Red</SelectItem>
                          <SelectItem value="orange">🟠 Orange</SelectItem>
                          <SelectItem value="yellow">🟡 Yellow</SelectItem>
                          <SelectItem value="green">🟢 Green</SelectItem>
                          <SelectItem value="turquoise">🩵 Turquoise</SelectItem>
                          <SelectItem value="blue">🔵 Blue</SelectItem>
                          <SelectItem value="violet">🟣 Violet</SelectItem>
                          <SelectItem value="pink">🩷 Pink</SelectItem>
                          <SelectItem value="brown">🟤 Brown</SelectItem>
                          <SelectItem value="black">⚫ Black</SelectItem>
                          <SelectItem value="gray">⚪ Gray</SelectItem>
                          <SelectItem value="white">🤍 White</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(imageOrientation !== 'any' || imageSize !== 'any' || imageColor !== 'any') && (
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setImageOrientation('any'); setImageSize('any'); setImageColor('any'); }}>
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <span className="text-xs text-muted-foreground">
              {(imageMode === 'ai' || (imageMode === 'off' && isImageRequest(input))) ? (
                <span className="flex items-center gap-1 text-primary">
                  <Sparkles className="h-3 w-3" />AI image generation
                </span>
              ) : (imageMode === 'real' || (imageMode === 'off' && isRealImageSearch(input))) ? (
                <span className="flex items-center gap-1 text-primary">
                  <Search className="h-3 w-3" />Real photo search
                </span>
              ) : null}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Type your message... ("photos of..." for real pics, "generate image of..." for AI)'
              disabled={isLoading}
              className="flex-1 min-h-[56px] max-h-[200px] resize-none text-base transition-all focus:ring-2 focus:ring-primary/20"
              maxLength={1000}
              rows={1}
            />
            <Button type="submit" disabled={!input.trim() || isLoading} className="h-14 px-6 rounded-xl hover:scale-105 transition-transform">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5 mr-2" />Send</>}
            </Button>
          </form>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default TextChat;
