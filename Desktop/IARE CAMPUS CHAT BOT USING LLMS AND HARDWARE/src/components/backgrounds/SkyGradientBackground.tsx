import { useEffect, useState, useRef } from 'react';

/**
 * Animated sky gradient background with floating particles,
 * aurora waves, and aviation-inspired trails for the About page.
 */
export const SkyGradientBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Floating particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        r: Math.random() * 2.5 + 0.5,
        o: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217, 91%, 50%, ${p.o + 0.2})`;
        ctx.fill();
      });

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(217, 91%, 50%, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base sky gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(
            135deg,
            hsl(var(--background)) 0%,
            hsl(var(--primary) / 0.06) 30%,
            hsl(var(--accent)) 60%,
            hsl(var(--background)) 100%
          )`,
        }}
      />

      {/* Aurora wave overlays */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 30% 40%, hsl(var(--primary) / 0.08), transparent)`,
          transform: `translateY(${scrollY * 0.05}px)`,
          animation: 'auroraShift 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 70% 60%, hsl(var(--primary) / 0.06), transparent)`,
          transform: `translateY(${scrollY * -0.03}px)`,
          animation: 'auroraShift 16s ease-in-out infinite reverse',
        }}
      />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Animated airflow curves */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15] dark:opacity-[0.12]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{ transform: `translateY(${scrollY * 0.02}px)` }}
      >
        <path
          d="M0,300 Q360,200 720,350 T1440,280"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="12 8"
          className="animate-[dash_12s_linear_infinite]"
        />
        <path
          d="M0,500 Q400,400 800,520 T1440,460"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeDasharray="8 12"
          className="animate-[dash_18s_linear_infinite]"
        />
        <path
          d="M0,650 Q300,580 700,680 T1440,620"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeDasharray="6 10"
          className="animate-[dash_22s_linear_infinite]"
        />
        {/* Animated dots traveling along paths */}
        <circle r="4" fill="hsl(var(--primary))" opacity="0.6">
          <animateMotion dur="8s" repeatCount="indefinite" path="M0,300 Q360,200 720,350 T1440,280" />
        </circle>
        <circle r="3" fill="hsl(var(--primary))" opacity="0.4">
          <animateMotion dur="12s" repeatCount="indefinite" path="M0,500 Q400,400 800,520 T1440,460" />
        </circle>
      </svg>

      {/* Floating pulsing blobs */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: `hsl(var(--primary))`,
          top: '10%',
          left: '15%',
          animation: 'floatPulse 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl"
        style={{
          background: `hsl(var(--chart-2))`,
          top: '50%',
          right: '10%',
          animation: 'floatPulse 14s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl"
        style={{
          background: `hsl(var(--chart-3))`,
          bottom: '15%',
          left: '40%',
          animation: 'floatPulse 8s ease-in-out infinite 2s',
        }}
      />

      <style>{`
        @keyframes floatPulse {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.12; }
          25% { transform: translateY(-30px) translateX(15px) scale(1.1); opacity: 0.2; }
          50% { transform: translateY(-15px) translateX(-20px) scale(0.95); opacity: 0.14; }
          75% { transform: translateY(-35px) translateX(8px) scale(1.05); opacity: 0.22; }
        }
        .dark .sky-glow-orb {
          --glow-min: 0.05;
          --glow-max: 0.1;
        }
        @keyframes auroraShift {
          0%, 100% { transform: translateX(0) scale(1); }
          33% { transform: translateX(30px) scale(1.05); }
          66% { transform: translateX(-20px) scale(0.98); }
        }
        @keyframes dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -200; }
        }
      `}</style>
    </div>
  );
};
