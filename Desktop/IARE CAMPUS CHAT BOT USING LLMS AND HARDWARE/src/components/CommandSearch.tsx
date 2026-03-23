import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Search,
  Keyboard,
  Headphones,
  Home,
  FileText,
  Mail,
  User,
  GraduationCap,
  BookOpen,
  Building,
  DollarSign,
  Users,
  Clock,
  HelpCircle,
} from 'lucide-react';

/**
 * COMMAND SEARCH COMPONENT
 * ========================
 * Global search bar with keyboard shortcuts (Ctrl+K or Cmd+K).
 * Provides quick navigation, FAQ suggestions, and search history.
 */

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const FAQ_SUGGESTIONS = [
  { query: 'Admission requirements', icon: GraduationCap, category: 'Admissions' },
  { query: 'Fee structure', icon: DollarSign, category: 'Admissions' },
  { query: 'Available courses', icon: BookOpen, category: 'Courses' },
  { query: 'B.Tech programs', icon: BookOpen, category: 'Courses' },
  { query: 'Placement statistics', icon: Users, category: 'Placements' },
  { query: 'Top recruiters', icon: Building, category: 'Placements' },
  { query: 'Hostel facilities', icon: Building, category: 'Campus' },
  { query: 'Campus timings', icon: Clock, category: 'Campus' },
  { query: 'Contact information', icon: Mail, category: 'Contact' },
  { query: 'Application deadline', icon: Clock, category: 'Admissions' },
];

const NAVIGATION_ITEMS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Text Chat', path: '/text-chat', icon: Keyboard, requiresAuth: true },
  { name: 'Voice Chat', path: '/voice-chat', icon: Headphones, requiresAuth: true },
  { name: 'Analysis', path: '/analysis', icon: FileText },
  { name: 'About', path: '/about', icon: HelpCircle },
  { name: 'Contact', path: '/contact', icon: Mail },
];

export const CommandSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('iare-search-history');
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSearch = (query: string) => {
    // Save to history
    const newHistory = [
      { query, timestamp: Date.now() },
      ...searchHistory.filter((h) => h.query !== query).slice(0, 9),
    ];
    setSearchHistory(newHistory);
    localStorage.setItem('iare-search-history', JSON.stringify(newHistory));

    // Navigate to text chat with pre-filled query
    setOpen(false);
    if (user) {
      navigate('/text-chat', { state: { prefillQuery: query } });
    } else {
      navigate('/signin');
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('iare-search-history');
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search IARE...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search IARE campus information..." />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center">
              <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No results found.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for admissions, courses, or placements.
              </p>
            </div>
          </CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            {NAVIGATION_ITEMS.filter((item) => !item.requiresAuth || user).map((item) => (
              <CommandItem
                key={item.path}
                value={item.name}
                onSelect={() => handleNavigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Search History */}
          {searchHistory.length > 0 && (
            <>
              <CommandGroup heading="Recent Searches">
                {searchHistory.slice(0, 5).map((item) => (
                  <CommandItem
                    key={item.timestamp}
                    value={`recent-${item.query}`}
                    onSelect={() => handleSearch(item.query)}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {item.query}
                  </CommandItem>
                ))}
                <CommandItem onSelect={clearHistory} className="text-muted-foreground">
                  <span className="text-xs">Clear history</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* FAQ Suggestions */}
          <CommandGroup heading="Common Questions">
            {FAQ_SUGGESTIONS.map((faq) => (
              <CommandItem
                key={faq.query}
                value={faq.query}
                onSelect={() => handleSearch(faq.query)}
              >
                <faq.icon className="mr-2 h-4 w-4" />
                <span>{faq.query}</span>
                <span className="ml-auto text-xs text-muted-foreground">{faq.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
