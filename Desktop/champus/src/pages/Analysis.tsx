import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  GitBranch
} from 'lucide-react';

/**
 * ANALYSIS MODULE
 * ===============
 * This page provides comprehensive documentation and analysis of the IARE AI Chatbot system.
 * 
 * Sections:
 * - System Architecture and Workflow
 * - AI Processing Pipeline
 * - Voice Recognition Analysis
 * - Performance and Latency Considerations
 * - Security Measures
 * - Scalability and Future Enhancements
 */
const Analysis = () => {
  const architectureSteps = [
    {
      icon: MessageSquare,
      title: 'User Input',
      description: 'Text typed via keyboard or voice captured via USB microphone through browser Web Speech API'
    },
    {
      icon: Server,
      title: 'Frontend Processing',
      description: 'React application validates input, manages state, and sends authenticated requests to backend'
    },
    {
      icon: Shield,
      title: 'Edge Function',
      description: 'Supabase Edge Function receives request, validates JWT token, and forwards to Grok API'
    },
    {
      icon: Cpu,
      title: 'Grok AI Processing',
      description: 'xAI Grok-2 model processes query with IARE-specific context and generates response'
    },
    {
      icon: Database,
      title: 'Data Storage',
      description: 'Conversation saved to PostgreSQL with user_id, query, response, input_type, and timestamp'
    },
    {
      icon: Zap,
      title: 'Response Delivery',
      description: 'AI response displayed in chat UI and optionally converted to speech via SpeechSynthesis API'
    }
  ];

  const securityMeasures = [
    {
      title: 'API Key Protection',
      description: 'Grok API key stored in Supabase secrets, never exposed to frontend code',
      badge: 'Critical'
    },
    {
      title: 'JWT Authentication',
      description: 'All chat requests require valid JWT token verified by backend edge function',
      badge: 'Authentication'
    },
    {
      title: 'Row Level Security',
      description: 'PostgreSQL RLS ensures users can only access their own chat history',
      badge: 'Data Protection'
    },
    {
      title: 'Input Validation',
      description: 'All user inputs validated and sanitized before processing to prevent injection attacks',
      badge: 'Validation'
    },
    {
      title: 'HTTPS Encryption',
      description: 'All data transmitted over encrypted HTTPS connections',
      badge: 'Transport'
    },
    {
      title: 'CORS Protection',
      description: 'Cross-Origin Resource Sharing configured to allow only authorized domains',
      badge: 'Access Control'
    }
  ];

  const performanceMetrics = [
    { metric: 'Voice Recognition Latency', value: '< 500ms', description: 'Real-time speech-to-text conversion' },
    { metric: 'API Response Time', value: '1-3 seconds', description: 'Grok AI model processing time' },
    { metric: 'Text-to-Speech Latency', value: '< 200ms', description: 'Browser native synthesis' },
    { metric: 'Database Query Time', value: '< 100ms', description: 'Indexed PostgreSQL queries' }
  ];

  const futureEnhancements = [
    'Multi-language support for regional language queries',
    'Advanced voice activity detection and noise cancellation',
    'Real-time typing indicators and read receipts',
    'Integration with IARE academic portal for personalized responses',
    'Offline support with cached responses for common queries',
    'Admin dashboard for monitoring and analytics',
    'Export chat history to PDF or email',
    'Integration with calendar for event-based queries'
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Activity className="h-3 w-3 mr-1" />
            System Analysis
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Technical Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive analysis of the IARE AI-Powered Text and Voice Chatbot system architecture, 
            security measures, and performance characteristics.
          </p>
        </div>

        {/* System Architecture */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>System Architecture & Workflow</CardTitle>
                  <CardDescription>End-to-end data flow from user input to AI response</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {architectureSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">{step.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {index < architectureSteps.length - 1 && index % 3 !== 2 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                        <div className="w-6 h-0.5 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* AI Processing Pipeline */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>AI Processing Pipeline</CardTitle>
                  <CardDescription>How Grok xAI processes campus enquiries</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-semibold mb-2">Model Configuration</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>Model:</strong> grok-2-latest (xAI)</li>
                    <li><strong>Max Tokens:</strong> 1024</li>
                    <li><strong>Temperature:</strong> 0.7 (balanced creativity)</li>
                    <li><strong>Context Window:</strong> Last 10 messages</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-semibold mb-2">System Prompt Scope</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>IARE admissions & TS EAMCET information</li>
                    <li>Course details (B.Tech, M.Tech, MBA, MCA)</li>
                    <li>Placement statistics and recruiters</li>
                    <li>Campus facilities and contact info</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Voice Recognition Analysis */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Voice Recognition Analysis</CardTitle>
                  <CardDescription>Hardware integration and speech processing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-4">Hardware Flow</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-border">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold">1</div>
                      <span className="text-sm">USB Microphone captures audio</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-border">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold">2</div>
                      <span className="text-sm">Browser requests microphone permission</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-border">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold">3</div>
                      <span className="text-sm">Web Speech API converts speech to text</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-border">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold">4</div>
                      <span className="text-sm">Text sent to Grok API via backend</span>
                    </div>
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
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Fallback:</strong> Users can switch to Text Chat if voice recognition fails or is unavailable.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Performance Metrics */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Performance & Latency</CardTitle>
                  <CardDescription>System response times and optimization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {performanceMetrics.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">{item.metric}</p>
                    <p className="text-2xl font-bold text-primary mb-1">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security Measures */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Security Measures</CardTitle>
                  <CardDescription>Comprehensive security implementation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {securityMeasures.map((measure, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{measure.title}</h4>
                      <Badge variant="secondary" className="text-xs">{measure.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{measure.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Scalability & Future */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Scalability & Future Enhancements</CardTitle>
                  <CardDescription>Roadmap for system improvements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Current Scalability Features
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Serverless edge functions auto-scale with demand
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      PostgreSQL connection pooling for concurrent users
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      CDN-delivered static assets for fast loading
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Conversation history pagination (50 messages/load)
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Planned Enhancements</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {futureEnhancements.map((enhancement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded bg-accent/50 flex items-center justify-center text-xs mt-0.5">
                          {index + 1}
                        </div>
                        {enhancement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Analysis;
