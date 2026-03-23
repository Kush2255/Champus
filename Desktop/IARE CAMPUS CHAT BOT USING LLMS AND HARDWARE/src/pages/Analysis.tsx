import { Layout } from '@/components/Layout';
import { AnimatedSection } from '@/components/AnimatedSection';
import { NeuralGridBackground } from '@/components/backgrounds/NeuralGridBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { 
  Cpu, 
  Database, 
  Shield, 
  Zap, 
  Mic, 
  MessageSquare,
  Server,
  Lock,
  Activity,
  TrendingUp,
  Layers,
  GitBranch,
  BarChart3,
  FileText,
  ImageIcon,
  Globe,
  Users
} from 'lucide-react';

const Analysis = () => {
  const architectureSteps = [
    { icon: MessageSquare, title: 'User Input', description: 'Text typed via keyboard, voice captured via Web Speech API, or collaborative shared messages' },
    { icon: Server, title: 'Frontend Processing', description: 'React application validates input, manages state, handles image search queries, and sends authenticated requests' },
    { icon: Shield, title: 'Edge Function', description: 'Supabase Edge Function receives request, validates JWT, and forwards to Grok API with image search capabilities' },
    { icon: Cpu, title: 'Grok AI Processing', description: 'xAI Grok-2 processes query with IARE context, returns text responses and relevant image search results' },
    { icon: Database, title: 'Data Storage', description: 'Chat history, images, profiles, and collaborative sessions saved to PostgreSQL with RLS protection' },
    { icon: Zap, title: 'Response Delivery', description: 'AI response displayed with markdown rendering, images in gallery, and optional multi-language TTS output' }
  ];

  const securityMeasures = [
    { title: 'API Key Protection', description: 'Grok API key stored in Supabase secrets, never exposed to frontend code', badge: 'Critical' },
    { title: 'JWT Authentication', description: 'All chat requests require valid JWT token verified by backend edge function', badge: 'Authentication' },
    { title: 'Row Level Security', description: 'PostgreSQL RLS ensures users can only access their own chat history', badge: 'Data Protection' },
    { title: 'Input Validation', description: 'All user inputs validated and sanitized before processing to prevent injection attacks', badge: 'Validation' },
    { title: 'HTTPS Encryption', description: 'All data transmitted over encrypted HTTPS connections', badge: 'Transport' },
    { title: 'CORS Protection', description: 'Cross-Origin Resource Sharing configured to allow only authorized domains', badge: 'Access Control' }
  ];

  const performanceMetrics = [
    { metric: 'Voice Recognition Latency', value: '< 500ms', description: 'Real-time speech-to-text conversion' },
    { metric: 'API Response Time', value: '1-3 seconds', description: 'Grok AI model processing time' },
    { metric: 'Text-to-Speech Latency', value: '< 200ms', description: 'Browser native synthesis' },
    { metric: 'Database Query Time', value: '< 100ms', description: 'Indexed PostgreSQL queries' }
  ];

  const futureEnhancements = [
    'Integration with IARE academic portal for personalized responses',
    'Offline support with cached responses for common queries',
    'Advanced admin dashboard for monitoring and moderation',
    'Integration with calendar for event-based queries',
    'AI-powered smart suggestions based on user behavior',
    'Video content integration for campus virtual tours'
  ];

  const newFeatures = [
    { icon: ImageIcon, title: 'Image Search & Gallery', description: 'AI-powered image search returns real photos for campus queries. Browse all images in the dedicated Gallery tab with search and date filters.' },
    { icon: Globe, title: 'Multi-Language Support', description: 'Voice recognition and text-to-speech in 10+ languages including Hindi, Telugu, Tamil, and more for regional accessibility.' },
    { icon: Users, title: 'Collaborative Sessions', description: 'Real-time shared chat sessions with invite codes, typing presence indicators, and synchronized conversation history.' },
    { icon: Mic, title: 'Voice Activity Detection', description: 'Smart VAD auto-stops recording when silence is detected, with configurable silence threshold and visual feedback via VU meter.' },
  ];

  return (
    <Layout>
      <NeuralGridBackground />

      <div className="container mx-auto px-4 py-16 relative">
        {/* Header */}
        <AnimatedSection animation="fade-up" className="text-center mb-14">
          <Badge variant="secondary" className="mb-4 backdrop-blur-sm">
            <Activity className="h-3 w-3 mr-1" />
            System Analysis
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Analytics & Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            View your chat usage statistics and explore the system architecture, 
            security measures, and performance characteristics.
          </p>
        </AnimatedSection>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 backdrop-blur-sm">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="documentation" className="space-y-10">
            {/* System Architecture */}
            <AnimatedSection animation="fade-up">
              <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">System Architecture & Workflow</h2>
                    <p className="text-sm text-muted-foreground">End-to-end data flow from user input to AI response</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {architectureSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{step.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* AI Processing Pipeline */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">AI Processing Pipeline</h2>
                    <p className="text-sm text-muted-foreground">How Grok xAI processes campus enquiries</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                    <h4 className="font-semibold mb-2">Model Configuration</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><strong>Model:</strong> grok-2-latest (xAI)</li>
                      <li><strong>Max Tokens:</strong> 1024</li>
                      <li><strong>Temperature:</strong> 0.7 (balanced creativity)</li>
                      <li><strong>Context Window:</strong> Last 10 messages</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                    <h4 className="font-semibold mb-2">System Prompt Scope</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>IARE admissions & TS EAMCET information</li>
                      <li>Course details (B.Tech, M.Tech, MBA, MCA)</li>
                      <li>Placement statistics and recruiters</li>
                      <li>Campus facilities and contact info</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Voice Recognition */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Voice Recognition Analysis</h2>
                    <p className="text-sm text-muted-foreground">Hardware integration and speech processing</p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-4">Hardware Flow</h4>
                    <div className="space-y-3">
                      {['USB Microphone captures audio', 'Browser requests microphone permission', 'Web Speech API converts speech to text', 'Text sent to Grok API via backend'].map((text, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                          <span className="text-sm">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Recognition Accuracy Factors</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">High</Badge>
                        <span>Clear speech in quiet environment with good microphone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">Medium</Badge>
                        <span>Accented English or moderate background noise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">Low</Badge>
                        <span>Heavy noise, poor mic quality, or unsupported accents</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 rounded-xl bg-background/50 border border-border/30">
                      <p className="text-sm text-muted-foreground">
                        <strong>Fallback:</strong> Users can switch to Text Chat if voice recognition fails.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* New Features */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Newly Added Features</h2>
                    <p className="text-sm text-muted-foreground">Image generation, multi-language, collaboration & more</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {newFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Performance Metrics */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Performance & Latency</h2>
                    <p className="text-sm text-muted-foreground">System response times and optimization</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {performanceMetrics.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl bg-primary/5 border border-primary/15 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                      <p className="text-sm text-muted-foreground mb-1">{item.metric}</p>
                      <p className="text-2xl font-bold text-primary mb-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Security */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Security Measures</h2>
                    <p className="text-sm text-muted-foreground">Comprehensive security implementation</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {securityMeasures.map((measure, index) => (
                    <div key={index} className="p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{measure.title}</h4>
                        <Badge variant="secondary" className="text-xs">{measure.badge}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{measure.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Future */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="rounded-2xl backdrop-blur-md bg-card/60 border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Scalability & Future Enhancements</h2>
                    <p className="text-sm text-muted-foreground">Roadmap for system improvements</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Current Scalability Features
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {['Serverless edge functions auto-scale with demand', 'PostgreSQL connection pooling for concurrent users', 'CDN-delivered static assets for fast loading', 'Conversation history pagination (50 messages/load)'].map((text, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Planned Enhancements</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {futureEnhancements.map((enhancement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-xs mt-0.5">
                            {index + 1}
                          </div>
                          {enhancement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analysis;
