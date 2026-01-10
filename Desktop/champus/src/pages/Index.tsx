import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageSquare, 
  Mic, 
  Shield, 
  Zap, 
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Plane,
  Keyboard,
  Headphones,
  ArrowRight,
  BarChart3
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Keyboard,
      title: 'Text Chat',
      description: 'Type your questions and get instant AI-powered answers about IARE.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Headphones,
      title: 'Voice Chat',
      description: 'Speak naturally using your microphone for hands-free interaction.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your conversations are encrypted and securely stored.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Lightning-fast responses powered by Grok (xAI) technology.',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const topics = [
    { icon: BookOpen, name: 'Admissions', description: 'TS EAMCET, fees & process' },
    { icon: GraduationCap, name: 'Courses', description: 'B.Tech, M.Tech, MBA, MCA' },
    { icon: Users, name: 'Placements', description: '90%+ placement record' },
    { icon: Clock, name: 'Campus Life', description: 'Hostels, labs & facilities' }
  ];

  const stats = [
    { value: '90%+', label: 'Placement Rate' },
    { value: '32', label: 'Acre Campus' },
    { value: '2000', label: 'Established' },
    { value: 'A', label: 'NAAC Grade' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/30 to-background" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Plane className="h-4 w-4 mr-2" />
              Institute of Aeronautical Engineering, Dundigal
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              IARE Campus
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Get instant answers to all your IARE-related questions using our AI-powered 
              text and voice chatbot. Simply speak or type to get started.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button size="lg" asChild className="text-lg px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Link to="/text-chat">
                      <Keyboard className="mr-2 h-5 w-5" />
                      Text Chat
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild className="text-lg px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Link to="/voice-chat">
                      <Headphones className="mr-2 h-5 w-5" />
                      Voice Chat
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild className="text-lg px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg px-8 h-14 rounded-xl">
                    <Link to="/signin">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose IARE Assistant?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of campus enquiries with cutting-edge AI technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Knowledge Base</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Can You Ask?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI is trained on comprehensive IARE information
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {topics.map((topic, index) => (
              <Card 
                key={index}
                className="group hover:border-primary/50 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <topic.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{topic.name}</h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <Badge variant="secondary" className="mb-4">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Technical Docs
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    System Analysis
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Explore the technical architecture, security measures, AI processing pipeline, 
                    and voice recognition analysis of our campus assistant system.
                  </p>
                  <Button asChild>
                    <Link to="/analysis">
                      View Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                      <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Secure</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                      <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Fast</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                      <Mic className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Voice</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                      <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Chat</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join IARE students who use our AI assistant for campus enquiries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 h-14 rounded-xl">
              <Link to={user ? '/chatbot' : '/signup'}>
                {user ? 'Open Chatbot' : 'Sign Up Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="outline" asChild className="text-lg px-8 h-14 rounded-xl bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/analysis">Learn More</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
