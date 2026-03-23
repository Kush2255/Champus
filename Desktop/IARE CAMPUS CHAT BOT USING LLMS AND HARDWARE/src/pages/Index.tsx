import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
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
  BarChart3,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const HERO_IMAGES = [
  '/images/iare-hero-1.jpg',
  '/images/iare-hero-2.jpg',
  '/images/iare-hero-3.jpg',
  '/images/iare-hero-4.jpg',
];

const Index = () => {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ken Burns auto-cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Keyboard, title: 'Text Chat', description: 'Type your questions and get instant AI-powered answers about IARE.', color: 'from-primary to-primary/60' },
    { icon: Headphones, title: 'Voice Chat', description: 'Speak naturally using your microphone for hands-free interaction.', color: 'from-primary/80 to-primary/40' },
    { icon: Shield, title: 'Secure & Private', description: 'Your conversations are encrypted and securely stored.', color: 'from-primary/70 to-primary/30' },
    { icon: Zap, title: 'AI-Powered', description: 'Lightning-fast responses powered by advanced AI technology.', color: 'from-primary/90 to-primary/50' },
  ];

  const topics = [
    { icon: BookOpen, name: 'Admissions', description: 'TS EAMCET, fees & process' },
    { icon: GraduationCap, name: 'Courses', description: 'B.Tech, M.Tech, MBA, MCA' },
    { icon: Users, name: 'Placements', description: '90%+ placement record' },
    { icon: Clock, name: 'Campus Life', description: 'Hostels, labs & facilities' },
  ];

  const stats = [
    { value: '90%+', label: 'Placement Rate' },
    { value: '32', label: 'Acre Campus' },
    { value: '2000', label: 'Established' },
    { value: 'A++', label: 'NAAC Grade' },
  ];

  return (
    <Layout>
      {/* Hero Section - Full Viewport with Sharp Background + Glassmorphism */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Background images - SHARP, no blur, no opacity reduction */}
        {HERO_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: currentHeroIndex === i ? 1 : 0,
              scale: currentHeroIndex === i ? 1.05 : 1,
            }}
            transition={{
              opacity: { duration: 2, ease: 'easeInOut' },
              scale: { duration: 8, ease: 'easeInOut' },
            }}
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
            }}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </motion.div>
        ))}
        {/* Very light overlay for readability - NOT reducing image clarity */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35), rgba(0,0,0,0.5))',
          }}
        />

        {/* Glassmorphism Content Container */}
        <motion.div
          className="relative z-10 mx-auto px-4 flex items-center justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div
            className="w-full max-w-[700px] text-center rounded-[20px] px-8 py-10 md:px-14 md:py-14"
            style={{
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-background/30 border-border/50 text-foreground">
              <Plane className="h-4 w-4 mr-2" />
              Institute of Aeronautical Engineering, Dundigal
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
              IARE Campus
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed drop-shadow">
              Get instant answers to all your IARE-related questions using our AI-powered
              text and voice chatbot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button size="lg" asChild className="text-lg px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-[3px] hover:shadow-primary/30">
                    <Link to="/text-chat"><Keyboard className="mr-2 h-5 w-5" />Text Chat</Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild className="text-lg px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-[3px]">
                    <Link to="/voice-chat"><Headphones className="mr-2 h-5 w-5" />Voice Chat</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild className="text-lg px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-[3px] hover:shadow-primary/30 group">
                    <Link to="/signup">
                      <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild className="text-lg px-8 h-14 rounded-xl transition-all hover:-translate-y-[3px] hover:shadow-lg">
                    <Link to="/signin">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/60" />
        </div>
      </section>

      {/* Stats Section with parallax bg */}
      <section className="relative py-16 border-y border-border overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${HERO_IMAGES[1]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${(scrollY - 600) * 0.15}px)`,
          }}
        />
        <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className="text-center group">
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with parallax bg */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${HERO_IMAGES[2]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${(scrollY - 1200) * 0.1}px)`,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose IARE Assistant?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of campus enquiries with cutting-edge AI technology
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl backdrop-blur-sm bg-card/80">
                  <CardContent className="p-6">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <feature.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section with parallax bg */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${HERO_IMAGES[3]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${(scrollY - 1800) * 0.1}px)`,
          }}
        />
        <div className="absolute inset-0 bg-muted/40" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Knowledge Base</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What Can You Ask?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI is trained on comprehensive IARE information
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {topics.map((topic, index) => (
              <AnimatedSection key={index} animation="scale" delay={index * 100}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer backdrop-blur-sm bg-card/80">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <topic.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{topic.name}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis CTA */}
      <AnimatedSection animation="fade-up" as="section" className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto overflow-hidden hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm bg-card/90">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <Badge variant="secondary" className="mb-4">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Technical Docs
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">System Analysis</h2>
                  <p className="text-muted-foreground mb-6">
                    Explore the technical architecture, security measures, AI processing pipeline,
                    and voice recognition analysis of our campus assistant system.
                  </p>
                  <Button asChild className="group">
                    <Link to="/analysis">
                      View Analysis
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {[
                      { Icon: Shield, label: 'Secure' },
                      { Icon: Zap, label: 'Fast' },
                      { Icon: Mic, label: 'Voice' },
                      { Icon: MessageSquare, label: 'Chat' },
                    ].map(({ Icon, label }) => (
                      <div key={label} className="p-4 rounded-xl bg-background/50 backdrop-blur hover:bg-background/80 transition-colors cursor-pointer group">
                        <Icon className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join IARE students who use our AI assistant for campus enquiries
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 h-14 rounded-xl hover:scale-105 transition-all">
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
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
