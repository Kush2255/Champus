import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { useScrollDirection } from '@/hooks/useScrollAnimation';
import { CommandSearch } from '@/components/CommandSearch';
import { 
  Plane, 
  Menu, 
  X, 
  LogOut, 
  MessageSquare, 
  User,
  Sun,
  Moon,
  Keyboard,
  Headphones,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { isScrolled } = useScrollDirection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Analysis', path: '/analysis' },
  ];

  const chatLinks = [
    { name: 'Text Chat', path: '/text-chat', icon: Keyboard },
    { name: 'Voice Chat', path: '/voice-chat', icon: Headphones },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isChatActive = ['/chatbot', '/text-chat', '/voice-chat'].includes(location.pathname);

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-500",
      isScrolled 
        ? "bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50" 
        : "bg-transparent backdrop-blur-none border-b border-transparent"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">IARE Assistant</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={isChatActive ? "default" : "ghost"} 
                    size="sm"
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Choose Chat Mode</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {chatLinks.map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className="flex items-center gap-2">
                        <link.icon className="h-4 w-4" />
                        {link.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <CommandSearch />
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Chat Modes</p>
                    {chatLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-primary ${
                          isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/signin" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
