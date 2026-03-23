import { Layout } from '@/components/Layout';
import { AnimatedSection } from '@/components/AnimatedSection';
import { SkyGradientBackground } from '@/components/backgrounds/SkyGradientBackground';
import { 
  Plane, 
  Mic, 
  MessageSquare, 
  Database, 
  Shield, 
  Cpu,
  Award,
  Users,
  Building,
  LogIn,
  FileInput,
  Settings,
  BarChart3,
  Download,
  Check
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

const howToSteps = [
  {
    icon: LogIn,
    title: 'Sign Up / Login',
    description: 'Create an account or log in to access the IARE AI Assistant dashboard.',
  },
  {
    icon: FileInput,
    title: 'Choose Chat Mode',
    description: 'Select Text Chat for typing, Voice Chat for hands-free speech, or Collaborative Chat to work with others.',
  },
  {
    icon: Settings,
    title: 'Ask Your Query',
    description: 'Type or speak your question about IARE — admissions, placements, courses, campus, or ask for images.',
  },
  {
    icon: BarChart3,
    title: 'View AI Response',
    description: 'Get instant AI-powered answers with text, images, and speech output. Browse images in the Gallery tab.',
  },
  {
    icon: Download,
    title: 'Export & Analyze',
    description: 'Export chat history, view analytics on the Analysis page, or share collaborative sessions.',
  },
];

const HowToUseSection = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          howToSteps.forEach((_, i) => {
            setTimeout(() => {
              setVisibleSteps(prev => [...prev, i]);
            }, i * 600);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Use This Application</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get started in just a few simple steps — from sign-up to results.
          </p>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto">
          {/* Desktop: horizontal flow */}
          <div className="hidden md:flex items-start justify-between relative">
            <div className="absolute top-10 left-[10%] right-[10%] h-0.5 bg-border z-0">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${(visibleSteps.length / howToSteps.length) * 100}%` }}
              />
            </div>

            {howToSteps.map((step, i) => {
              const isVisible = visibleSteps.includes(i);
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center text-center w-1/5 relative z-10 transition-all',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  )}
                  style={{ transitionDuration: '0.6s' }}
                >
                  <div className="relative mb-4">
                    <div className={cn(
                      'h-20 w-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-110 cursor-default',
                      'backdrop-blur-md bg-card/60',
                      isVisible
                        ? 'border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                        : 'border-border/50'
                    )}>
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className={cn(
                      'absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500',
                      isVisible ? 'bg-primary text-primary-foreground scale-100' : 'bg-muted text-muted-foreground scale-75'
                    )}>
                      {isVisible ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed px-1">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Mobile: vertical flow */}
          <div className="md:hidden space-y-0 relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border">
              <div
                className="w-full bg-primary transition-all duration-1000 ease-out"
                style={{ height: `${(visibleSteps.length / howToSteps.length) * 100}%` }}
              />
            </div>

            {howToSteps.map((step, i) => {
              const isVisible = visibleSteps.includes(i);
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-4 pl-14 py-4 relative transition-all',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  )}
                  style={{ transitionDuration: '0.6s' }}
                >
                  <div className={cn(
                    'absolute left-3 top-6 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-500',
                    isVisible ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {isVisible ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  
                  <div className={cn(
                    'flex-1 p-4 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md',
                    'backdrop-blur-md bg-card/60',
                    isVisible
                      ? 'border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.1)]'
                      : 'border-border/50'
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm">{step.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  const systemComponents = [
    {
      icon: Cpu,
      title: 'Grok AI Engine',
      description: 'Powered by xAI Grok for intelligent, context-aware responses with image search and generation.'
    },
    {
      icon: Mic,
      title: 'Voice & VAD',
      description: 'Multi-language voice recognition with Voice Activity Detection for auto-stop and hands-free use.'
    },
    {
      icon: MessageSquare,
      title: 'Text & Image Chat',
      description: 'Rich text chat with image search results, gallery view, markdown rendering, and export options.'
    },
    {
      icon: Database,
      title: 'Secure Database',
      description: 'PostgreSQL with RLS for chat history, image history, profiles, and collaborative sessions.'
    },
    {
      icon: Shield,
      title: 'Authentication',
      description: 'JWT-based auth with email verification, profile management, and notification preferences.'
    },
    {
      icon: Plane,
      title: 'Collaboration',
      description: 'Real-time collaborative chat sessions with invite codes and shared conversation history.'
    }
  ];

  const iareHighlights = [
    { icon: Award, title: 'NAAC A++ Grade', description: 'Accredited institution' },
    { icon: Users, title: '90%+ Placements', description: 'Top recruiters' },
    { icon: Building, title: '32 Acre Campus', description: 'Modern infrastructure' }
  ];

  return (
    <Layout>
      <SkyGradientBackground />

      {/* Hero Section */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-sm text-primary mb-6">
              AI-Powered Campus Assistant
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              About IARE Assistant
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              An AI-powered campus enquiry system designed specifically for 
              Institute of Aeronautical Engineering (IARE), Dundigal, Hyderabad.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* About IARE */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="fade-up">
              <h2 className="text-3xl font-bold mb-6 text-center">About IARE</h2>
              <div className="max-w-2xl mx-auto text-center mb-10">
                <p className="text-muted-foreground leading-relaxed">
                  Institute of Aeronautical Engineering (IARE) was established in 2000 at Dundigal, 
                  Hyderabad. The college is affiliated to Jawaharlal Nehru Technological University 
                  Hyderabad (JNTUH) and is approved by AICTE. Institute of Aeronautical Engineering 
                  is accredited by NAAC with 'A++' Grade.
                </p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {iareHighlights.map((item, index) => (
                <AnimatedSection key={index} animation="scale" delay={index * 100}>
                  <div className="p-6 rounded-2xl text-center backdrop-blur-md bg-card/60 border border-border/50 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-[0_4px_20px_hsl(var(--primary)/0.05)]">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="fade-up">
              <h2 className="text-3xl font-bold mb-8 text-center">System Purpose</h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedSection animation="fade-right" delay={100}>
                <div className="p-6 rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-semibold mb-4">For Students</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 24/7 access to IARE information</li>
                    <li>• Voice-enabled hands-free interaction</li>
                    <li>• Instant responses to common queries</li>
                    <li>• Chat history for future reference</li>
                    <li>• Admissions & placement guidance</li>
                  </ul>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="fade-left" delay={200}>
                <div className="p-6 rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-semibold mb-4">For Administration</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Reduced workload on staff</li>
                    <li>• Consistent information delivery</li>
                    <li>• Analytics on common questions</li>
                    <li>• Scalable support system</li>
                    <li>• 24/7 availability</li>
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl font-bold mb-12 text-center">System Components</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {systemComponents.map((component, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className="p-6 rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <component.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{component.title}</h3>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use This Application */}
      <HowToUseSection />
    </Layout>
  );
};

export default About;
