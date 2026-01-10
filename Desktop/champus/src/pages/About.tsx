import { Layout } from '@/components/Layout';
import { 
  Plane, 
  Mic, 
  MessageSquare, 
  Database, 
  Shield, 
  Cpu,
  Award,
  Users,
  Building
} from 'lucide-react';

const About = () => {
  const systemComponents = [
    {
      icon: Cpu,
      title: 'Grok AI Engine',
      description: 'Powered by xAI Grok for intelligent, context-aware responses to IARE queries.'
    },
    {
      icon: Mic,
      title: 'Voice Recognition',
      description: 'Hardware microphone integration using Web Speech API for hands-free interaction.'
    },
    {
      icon: MessageSquare,
      title: 'Text-to-Speech',
      description: 'Natural voice synthesis to read AI responses aloud for enhanced accessibility.'
    },
    {
      icon: Database,
      title: 'Secure Database',
      description: 'PostgreSQL database with Row Level Security for safe storage of user data.'
    },
    {
      icon: Shield,
      title: 'Authentication',
      description: 'Secure JWT-based authentication with encrypted password storage.'
    },
    {
      icon: Plane,
      title: 'IARE Knowledge',
      description: 'Trained on comprehensive IARE information including admissions, courses, and placements.'
    }
  ];

  const iareHighlights = [
    { icon: Award, title: 'NAAC A Grade', description: 'Accredited institution' },
    { icon: Users, title: '90%+ Placements', description: 'Top recruiters' },
    { icon: Building, title: '32 Acre Campus', description: 'Modern infrastructure' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-accent to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About IARE Assistant
            </h1>
            <p className="text-lg text-muted-foreground">
              An AI-powered campus enquiry system designed specifically for 
              Institute of Aeronautical Engineering (IARE), Dundigal, Hyderabad.
            </p>
          </div>
        </div>
      </section>

      {/* About IARE */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">About IARE</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground text-center mb-8">
              <p>
                Institute of Aeronautical Engineering (IARE) was established in 2000 at Dundigal, 
                Hyderabad. The college is affiliated to Jawaharlal Nehru Technological University 
                Hyderabad (JNTUH) and is approved by AICTE.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {iareHighlights.map((item, index) => (
                <div key={index} className="p-6 rounded-xl bg-card border border-border text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">System Purpose</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="text-xl font-semibold mb-4">For Students</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 24/7 access to IARE information</li>
                  <li>• Voice-enabled hands-free interaction</li>
                  <li>• Instant responses to common queries</li>
                  <li>• Chat history for future reference</li>
                  <li>• Admissions & placement guidance</li>
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-background border border-border">
                <h3 className="text-xl font-semibold mb-4">For Administration</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Reduced workload on staff</li>
                  <li>• Consistent information delivery</li>
                  <li>• Analytics on common questions</li>
                  <li>• Scalable support system</li>
                  <li>• 24/7 availability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">System Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {systemComponents.map((component, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <component.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{component.title}</h3>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
            <p className="text-muted-foreground mb-8">
              Built with modern, reliable technologies for the best user experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['React', 'TypeScript', 'PostgreSQL', 'Grok (xAI)', 'Web Speech API', 'Tailwind CSS'].map((tech) => (
                <span 
                  key={tech}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
