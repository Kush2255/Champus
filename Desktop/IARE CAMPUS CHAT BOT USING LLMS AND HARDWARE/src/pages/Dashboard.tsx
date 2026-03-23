import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageSquare,
  Mic,
  BarChart3,
  Bell,
  Calendar,
  GraduationCap,
  Briefcase,
  BookOpen,
  ArrowRight,
  Sparkles,
  Activity,
  TrendingUp,
  Users,
  Clock,
  Keyboard,
  Headphones,
} from 'lucide-react';

/* ───────── Floating particles canvas ───────── */
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;
    let particles: { x: number; y: number; r: number; dx: number; dy: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(258, 89%, 76%, ${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(258, 89%, 76%, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

/* ───────── Animated gradient background ───────── */
const AnimatedGradientBg = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    {/* Base dark gradient */}
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(135deg, hsl(240 20% 6%) 0%, hsl(258 40% 12%) 40%, hsl(270 30% 8%) 70%, hsl(240 25% 5%) 100%)',
      }}
    />
    {/* Animated blobs */}
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full opacity-20"
      style={{
        background: 'radial-gradient(circle, hsl(258 89% 66% / 0.4), transparent 70%)',
        top: '10%',
        left: '20%',
        filter: 'blur(80px)',
      }}
      animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-15"
      style={{
        background: 'radial-gradient(circle, hsl(270 80% 50% / 0.3), transparent 70%)',
        bottom: '15%',
        right: '10%',
        filter: 'blur(80px)',
      }}
      animate={{ x: [0, -50, 30, 0], y: [0, 40, -60, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-10"
      style={{
        background: 'radial-gradient(circle, hsl(220 70% 50% / 0.3), transparent 70%)',
        top: '50%',
        left: '60%',
        filter: 'blur(60px)',
      }}
      animate={{ x: [0, 40, -30, 0], y: [0, -30, 50, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

/* ───────── Glass card wrapper ───────── */
const GlassCard = ({ children, className = '', glowColor = 'hsl(258 89% 66% / 0.15)' }: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) => (
  <div
    className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}
    style={{
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      background: 'hsl(240 10% 12% / 0.6)',
      border: '1px solid hsl(258 30% 40% / 0.2)',
      boxShadow: `0 8px 32px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.05), 0 0 40px ${glowColor}`,
    }}
  >
    {children}
  </div>
);

/* ───────── Main Dashboard ───────── */
const Dashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    { icon: Keyboard, label: 'Text Chat', path: '/text-chat', desc: 'Ask questions via text' },
    { icon: Headphones, label: 'Voice Chat', path: '/voice-chat', desc: 'Speak with AI assistant' },
    { icon: BarChart3, label: 'Analysis', path: '/analysis', desc: 'View system analytics' },
    { icon: BookOpen, label: 'About', path: '/about', desc: 'Learn about IARE AI' },
  ];

  const campusUpdates = [
    { icon: Calendar, title: 'Academic Calendar 2026', desc: 'Updated semester schedule and important dates', tag: 'Calendar', time: 'Just now' },
    { icon: Briefcase, title: 'Placement Drive — TCS', desc: 'TCS campus recruitment drive scheduled for March 2026', tag: 'Placement', time: '2h ago' },
    { icon: Bell, title: 'Mid-Semester Exams', desc: 'Mid-semester examinations begin April 7, 2026', tag: 'Exams', time: '5h ago' },
    { icon: GraduationCap, title: 'Workshop on AI/ML', desc: 'CSE department hosting 3-day AI workshop', tag: 'Event', time: '1d ago' },
  ];

  const stats = [
    { icon: Activity, label: 'Queries Today', value: '1,247', trend: '+12%' },
    { icon: Users, label: 'Active Users', value: '834', trend: '+5%' },
    { icon: TrendingUp, label: 'Accuracy', value: '98.6%', trend: '+0.3%' },
    { icon: Clock, label: 'Avg Response', value: '1.2s', trend: '-0.1s' },
  ];

  return (
    <div className="relative min-h-screen text-foreground dark">
      <AnimatedGradientBg />
      <ParticleCanvas />

      {/* Force dark text colors for this page */}
      <div className="relative z-10">
        <Layout>
          {/* Hero section */}
          <section className="pt-12 pb-16 px-4">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <Badge
                  className="mb-6 px-4 py-2 text-sm"
                  style={{
                    background: 'hsl(258 89% 66% / 0.15)',
                    border: '1px solid hsl(258 89% 66% / 0.3)',
                    color: 'hsl(255 91% 76%)',
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Campus Intelligence Dashboard — 2026
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: 'hsl(0 0% 95%)' }}>
                  IARE{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(270 95% 75%), hsl(255 91% 86%))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    AI Dashboard
                  </span>
                </h1>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: 'hsl(0 0% 70%)' }}>
                  Your futuristic campus command center — powered by AI, built for 2026.
                </p>
              </motion.div>

              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                  >
                    <GlassCard className="text-center">
                      <stat.icon className="h-6 w-6 mx-auto mb-2" style={{ color: 'hsl(255 91% 76%)' }} />
                      <p className="text-2xl md:text-3xl font-bold" style={{ color: 'hsl(0 0% 95%)' }}>
                        {stat.value}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'hsl(0 0% 60%)' }}>{stat.label}</p>
                      <span className="text-xs font-medium" style={{ color: 'hsl(142 70% 55%)' }}>{stat.trend}</span>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              <AnimatedSection animation="fade-up" className="mb-12">
                <h2 className="text-xl font-semibold mb-6" style={{ color: 'hsl(0 0% 90%)' }}>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, i) => (
                    <Link key={action.path} to={action.path}>
                      <GlassCard className="group cursor-pointer hover:shadow-[0_0_50px_hsl(258_89%_66%_/_0.2)]">
                        <div className="flex items-start gap-4">
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{
                              background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(270 80% 50%))',
                            }}
                          >
                            <action.icon className="h-6 w-6" style={{ color: 'hsl(0 0% 98%)' }} />
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: 'hsl(0 0% 95%)' }}>{action.label}</p>
                            <p className="text-sm" style={{ color: 'hsl(0 0% 60%)' }}>{action.desc}</p>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </AnimatedSection>

              {/* Campus Updates + Chatbot Panel */}
              <div className="grid lg:grid-cols-5 gap-6 mb-12">
                {/* Updates */}
                <div className="lg:col-span-3">
                  <AnimatedSection animation="fade-up">
                    <h2 className="text-xl font-semibold mb-6" style={{ color: 'hsl(0 0% 90%)' }}>
                      Campus Updates — 2026
                    </h2>
                    <div className="space-y-4">
                      {campusUpdates.map((update, i) => (
                        <motion.div
                          key={update.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 * i, duration: 0.4 }}
                        >
                          <GlassCard className="flex items-start gap-4">
                            <div
                              className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'hsl(258 89% 66% / 0.15)' }}
                            >
                              <update.icon className="h-5 w-5" style={{ color: 'hsl(255 91% 76%)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate" style={{ color: 'hsl(0 0% 95%)' }}>
                                  {update.title}
                                </p>
                                <Badge
                                  className="text-[10px] px-2 py-0"
                                  style={{
                                    background: 'hsl(258 89% 66% / 0.1)',
                                    border: '1px solid hsl(258 89% 66% / 0.2)',
                                    color: 'hsl(255 91% 76%)',
                                  }}
                                >
                                  {update.tag}
                                </Badge>
                              </div>
                              <p className="text-sm" style={{ color: 'hsl(0 0% 60%)' }}>
                                {update.desc}
                              </p>
                              <p className="text-xs mt-1" style={{ color: 'hsl(0 0% 45%)' }}>
                                {update.time}
                              </p>
                            </div>
                          </GlassCard>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedSection>
                </div>

                {/* Chatbot Panel */}
                <div className="lg:col-span-2">
                  <AnimatedSection animation="fade-up" delay={200}>
                    <h2 className="text-xl font-semibold mb-6" style={{ color: 'hsl(0 0% 90%)' }}>
                      AI Chatbot
                    </h2>
                    <GlassCard
                      className="relative overflow-hidden"
                      glowColor="hsl(258 89% 66% / 0.25)"
                    >
                      {/* Animated glowing border */}
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, hsl(258 89% 66% / 0.1), transparent, hsl(270 80% 50% / 0.1))',
                        }}
                      />
                      <div className="relative z-10 text-center py-8">
                        <motion.div
                          className="h-20 w-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(270 80% 50%))',
                            boxShadow: '0 0 40px hsl(258 89% 66% / 0.4)',
                          }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <MessageSquare className="h-10 w-10" style={{ color: 'hsl(0 0% 98%)' }} />
                        </motion.div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(0 0% 95%)' }}>
                          Ask Anything
                        </h3>
                        <p className="text-sm mb-6" style={{ color: 'hsl(0 0% 60%)' }}>
                          Get instant AI-powered answers about IARE campus, admissions, placements & more.
                        </p>
                        <div className="flex flex-col gap-3">
                          <Button
                            asChild
                            size="lg"
                            className="rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-[2px]"
                            style={{
                              background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(270 80% 50%))',
                              color: 'hsl(0 0% 98%)',
                            }}
                          >
                            <Link to="/text-chat">
                              <Keyboard className="mr-2 h-5 w-5" />
                              Start Text Chat
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="rounded-xl transition-all hover:-translate-y-[2px]"
                            style={{
                              background: 'hsl(240 10% 15% / 0.5)',
                              borderColor: 'hsl(258 30% 40% / 0.3)',
                              color: 'hsl(255 91% 76%)',
                            }}
                          >
                            <Link to="/voice-chat">
                              <Headphones className="mr-2 h-5 w-5" />
                              Start Voice Chat
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  </AnimatedSection>
                </div>
              </div>

              {/* Analysis CTA */}
              <AnimatedSection animation="fade-up">
                <GlassCard
                  className="text-center py-12"
                  glowColor="hsl(258 89% 66% / 0.1)"
                >
                  <BarChart3 className="h-10 w-10 mx-auto mb-4" style={{ color: 'hsl(255 91% 76%)' }} />
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'hsl(0 0% 95%)' }}>
                    System Analysis & Insights
                  </h2>
                  <p className="max-w-xl mx-auto mb-6" style={{ color: 'hsl(0 0% 60%)' }}>
                    Explore the technical architecture, AI processing pipeline, security measures, and performance analytics.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl hover:-translate-y-[2px] transition-all"
                    style={{
                      background: 'linear-gradient(135deg, hsl(258 89% 66%), hsl(270 80% 50%))',
                      color: 'hsl(0 0% 98%)',
                    }}
                  >
                    <Link to="/analysis">
                      View Full Analysis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </GlassCard>
              </AnimatedSection>
            </div>
          </section>
        </Layout>
      </div>
    </div>
  );
};

export default Dashboard;
