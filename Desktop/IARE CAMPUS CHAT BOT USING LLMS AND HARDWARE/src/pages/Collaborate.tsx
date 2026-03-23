import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useSharedSession } from '@/hooks/useSharedSession';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedSection } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import {
  Users, Plus, LogIn, Trash2, ArrowRight, Copy, Check, MessageSquare, ArrowLeft, Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const Collaborate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, createSession, joinSession, deleteSession } = useSharedSession();
  const [newName, setNewName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    const session = await createSession(newName.trim());
    if (session) navigate(`/collaborate/${session.id}`);
    setIsCreating(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setIsJoining(true);
    const session = await joinSession(inviteCode.trim());
    if (session) navigate(`/collaborate/${session.id}`);
    setIsJoining(false);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-primary/5" />
        <motion.div
          className="absolute rounded-full opacity-10"
          style={{
            width: 400, height: 400, right: '-5%', top: '20%',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.5), transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ y: [0, -30, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <header className="relative z-10 flex items-center gap-3 px-4 md:px-8 py-4 border-b border-border bg-card/80 backdrop-blur-xl">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chatbot')} className="hover:scale-105 transition-transform">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <motion.div
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        >
          <Users className="h-5 w-5 text-primary-foreground" />
        </motion.div>
        <div>
          <h1 className="text-xl font-semibold">Collaborative Chat</h1>
          <p className="text-sm text-muted-foreground">Share sessions and chat together in real-time</p>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto p-6 space-y-8">
        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Plus, title: 'Create Session', desc: 'Start a new collaborative chat', dialogTitle: 'Create New Session', input: { placeholder: 'Session name...', value: newName, onChange: setNewName }, action: { label: isCreating ? 'Creating...' : 'Create & Join', onClick: handleCreate, disabled: !newName.trim() || isCreating } },
            { icon: LogIn, title: 'Join Session', desc: 'Enter an invite code to join', dialogTitle: 'Join Session', input: { placeholder: 'Enter invite code...', value: inviteCode, onChange: setInviteCode }, action: { label: isJoining ? 'Joining...' : 'Join Session', onClick: handleJoin, disabled: !inviteCode.trim() || isJoining } },
          ].map((item, i) => (
            <AnimatedSection key={item.title} animation="fade-up" delay={i * 100}>
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group backdrop-blur-sm bg-card/80">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{item.dialogTitle}</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <Input
                      placeholder={item.input.placeholder}
                      value={item.input.value}
                      onChange={(e) => item.input.onChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && item.action.onClick()}
                      className="transition-all focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_hsl(var(--primary)/0.1)]"
                    />
                    <Button onClick={item.action.onClick} disabled={item.action.disabled} className="w-full rounded-xl hover:scale-[1.02] transition-transform">
                      {item.action.label}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </AnimatedSection>
          ))}
        </div>

        {/* Sessions List */}
        <AnimatedSection animation="fade-up" delay={200}>
          <h2 className="text-lg font-semibold mb-4">Your Sessions</h2>
          {sessions.length === 0 ? (
            <Card className="backdrop-blur-sm bg-card/80">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                  className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MessageSquare className="h-8 w-8 text-primary/40" />
                </motion.div>
                <p className="text-muted-foreground mb-1">No sessions yet</p>
                <p className="text-sm text-muted-foreground/60">Create one or join with an invite code!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 backdrop-blur-sm bg-card/80 group">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{session.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(session.created_at).toLocaleDateString()}
                            {session.owner_id === user?.id && ' • Owner'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => copyCode(session.invite_code, session.id)} className="text-xs gap-1">
                              {copiedId === session.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {session.invite_code}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy invite code</TooltipContent>
                        </Tooltip>
                        {session.owner_id === user?.id && (
                          <Button variant="ghost" size="icon" onClick={() => deleteSession(session.id)} className="text-destructive hover:text-destructive hover:scale-110 transition-transform">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" onClick={() => navigate(`/collaborate/${session.id}`)} className="gap-1 rounded-lg hover:scale-[1.02] transition-transform">
                          Open <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Collaborate;
