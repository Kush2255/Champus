import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { 
  Keyboard, 
  Headphones, 
  ArrowRight,
  MessageSquare,
  Mic,
  Shield,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';

/**
 * CHAT SELECTION MODULE
 * =====================
 * This page allows users to choose between Text Chat and Voice Chat modes.
 * 
 * Features:
 * - Clear visual distinction between modes
 * - Feature highlights for each mode
 * - Quick access to either chat interface
 */
const ChatSelection = () => {
  const { user } = useAuth();

  const textFeatures = [
    { icon: Keyboard, text: 'Type your questions naturally' },
    { icon: MessageSquare, text: 'Full chat history with search' },
    { icon: Clock, text: 'Review past conversations anytime' },
    { icon: CheckCircle2, text: 'Best for detailed queries' }
  ];

  const voiceFeatures = [
    { icon: Mic, text: 'Hands-free voice interaction' },
    { icon: Headphones, text: 'AI responses read aloud' },
    { icon: Zap, text: 'Real-time speech recognition' },
    { icon: CheckCircle2, text: 'Best for quick questions' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Chat Mode</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select how you'd like to interact with the IARE Campus Assistant.
            Both modes provide the same intelligent AI responses.
          </p>
        </div>

        {/* Chat Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Text Chat Card */}
          <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            <CardHeader className="pb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Keyboard className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Text Chat</CardTitle>
              <CardDescription className="text-base">
                Type your questions and get instant AI-powered answers about IARE campus, admissions, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {textFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    {feature.text}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="w-full group/btn">
                <Link to="/text-chat">
                  Start Text Chat
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Voice Chat Card */}
          <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            <CardHeader className="pb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Headphones className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Voice Chat</CardTitle>
              <CardDescription className="text-base">
                Speak your questions and hear AI responses. Perfect for hands-free interaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {voiceFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    {feature.text}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" variant="secondary" className="w-full group/btn">
                <Link to="/voice-chat">
                  Start Voice Chat
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>All conversations are encrypted and securely stored</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatSelection;
