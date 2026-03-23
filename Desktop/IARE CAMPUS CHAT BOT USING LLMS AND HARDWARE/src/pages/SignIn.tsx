import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Plane, Eye, EyeOff, Sparkles } from 'lucide-react';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const FloatingOrb = ({ delay, size, x, y }: { delay: number; size: number; x: string; y: string }) => (
  <motion.div
    className="absolute rounded-full opacity-20 pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: 'radial-gradient(circle, hsl(var(--primary) / 0.6), transparent 70%)',
      filter: 'blur(40px)',
    }}
    animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.9, 1] }}
    transition={{ duration: 12 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user) {
    navigate('/chatbot');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      let message = 'An error occurred during sign in.';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      } else if (error.message) {
        message = error.message;
      }
      toast({ title: 'Sign In Failed', description: message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome Back!', description: 'Successfully signed in to IARE Assistant.' });
      navigate('/chatbot');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <FloatingOrb delay={0} size={400} x="10%" y="20%" />
        <FloatingOrb delay={3} size={300} x="70%" y="60%" />
        <FloatingOrb delay={6} size={250} x="40%" y="10%" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="text-center pb-2">
            <motion.div
              className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Plane className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="mt-1">Sign in to access IARE Campus Assistant</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@iare.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.1)]"
                />
                {errors.email && <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>}
              </motion.div>
              <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive animate-fade-in">{errors.password}</p>}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Sign In</>
                  )}
                </Button>
              </motion.div>
            </form>
            <motion.div
              className="mt-6 text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium transition-colors">
                Sign Up
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignIn;
