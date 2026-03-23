import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AnimatedSection } from '@/components/AnimatedSection';
import { SubtleGridBackground } from '@/components/backgrounds/SubtleGridBackground';
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
  CheckCircle2,
  Users
} from 'lucide-react';

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
      <SubtleGridBackground />
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Chat Mode</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select how you'd like to interact with the IARE Campus Assistant.
            Both modes provide the same intelligent AI responses.
          </p>
        </AnimatedSection>

        {/* Chat Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <AnimatedSection animation="fade-right" delay={100}>
            <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
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
          </AnimatedSection>

          <AnimatedSection animation="fade-left" delay={200}>
            <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
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
          </AnimatedSection>
        </div>

        {/* Collaborate Card */}
        <AnimatedSection animation="fade-up" delay={250} className="max-w-5xl mx-auto mt-8">
          <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Collaborative Chat</h3>
                  <p className="text-sm text-muted-foreground">Share sessions with others and chat together in real-time with AI</p>
                </div>
              </div>
              <Button asChild size="lg" variant="outline" className="group/btn">
                <Link to="/collaborate">
                  Start Collaborating
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Security Note */}
        <AnimatedSection animation="fade-up" delay={350} className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>All conversations are encrypted and securely stored</span>
          </div>
        </AnimatedSection>
      </div>
    </Layout>
  );
};

export default ChatSelection;
