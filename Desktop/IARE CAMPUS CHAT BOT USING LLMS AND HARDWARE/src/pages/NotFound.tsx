import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Plane } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <motion.div
          className="absolute rounded-full opacity-15 pointer-events-none"
          style={{
            width: 500, height: 500, left: '20%', top: '30%',
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 text-center px-4">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
          className="relative mb-8"
        >
          <span className="text-[10rem] md:text-[14rem] font-bold leading-none bg-gradient-to-b from-primary/30 to-primary/5 bg-clip-text text-transparent select-none">
            404
          </span>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/30">
              <Plane className="h-10 w-10 text-primary-foreground" />
            </div>
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-2xl md:text-3xl font-bold mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Page Not Found
        </motion.h1>
        <motion.p
          className="text-muted-foreground mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          The page <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">{location.pathname}</code> doesn't exist.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button asChild size="lg" className="rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all">
            <Link to="/"><Home className="mr-2 h-4 w-4" />Go Home</Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-xl hover:scale-[1.02] transition-all" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />Go Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
