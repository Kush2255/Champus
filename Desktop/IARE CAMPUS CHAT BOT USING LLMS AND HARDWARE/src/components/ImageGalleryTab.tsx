import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Download, ImageIcon, Search, X, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageEntry {
  id: string;
  query: string;
  url: string;
  alt: string;
  sourceUrl?: string;
  isReal: boolean;
  timestamp: string;
  rawDate: Date;
}

export const ImageGalleryTab = () => {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageEntry | null>(null);
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    const loadImages = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('input_type', 'text')
          .not('images', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        const entries: ImageEntry[] = [];
        data?.forEach((chat) => {
          const imgs = (chat as any).images as Array<{ type: string; image_url: { url: string }; alt?: string; source_url?: string }> | null;
          if (imgs && imgs.length > 0) {
            const rawDate = new Date(chat.created_at);
            imgs.forEach((img, idx) => {
              entries.push({
                id: `${chat.id}-${idx}`,
                query: chat.user_query,
                url: img.image_url.url,
                alt: img.alt || chat.user_query,
                sourceUrl: img.source_url,
                isReal: true,
                timestamp: rawDate.toLocaleDateString(),
                rawDate,
              });
            });
          }
        });
        setImages(entries);
      } catch (err) {
        console.error('Error loading image history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, [user]);

  const filteredImages = useMemo(() => {
    let result = images;

    // Text filter
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(img => img.query.toLowerCase().includes(q) || img.alt.toLowerCase().includes(q));
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoff: Date;
      switch (dateFilter) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      result = result.filter(img => img.rawDate >= cutoff);
    }

    return result;
  }, [images, searchText, dateFilter]);

  const hasActiveFilters = searchText.trim() !== '' || dateFilter !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8">
          <ImageIcon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">No Images Yet</h2>
        <p className="text-muted-foreground max-w-md">
          Switch to Chat and ask for images — they'll appear here for easy browsing.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[95%] xl:max-w-[90%] mx-auto py-6 px-2">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by query..."
            className="pl-9 pr-8"
          />
          {searchText && (
            <button onClick={() => setSearchText('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px]">
            <CalendarDays className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchText(''); setDateFilter('all'); }} className="text-xs">
            Clear filters
          </Button>
        )}
        <Badge variant="secondary" className="ml-auto text-xs">
          {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="rounded-xl border border-border shadow-2xl max-h-[80vh] object-contain"
            />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{selectedImage.query}</p>
                <p className="text-xs text-muted-foreground">{selectedImage.timestamp}</p>
              </div>
              <div className="flex gap-2">
                <a href={selectedImage.url} download target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm"><Download className="h-4 w-4 mr-1" />Download</Button>
                </a>
                <Button variant="outline" size="sm" onClick={() => setSelectedImage(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-card"
              onClick={() => setSelectedImage(img)}
            >
              <div className="aspect-square">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium truncate">{img.query}</p>
                <p className="text-xs text-muted-foreground">{img.timestamp}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={img.url} download target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="icon" className="h-7 w-7 shadow-md">
                    <Download className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
