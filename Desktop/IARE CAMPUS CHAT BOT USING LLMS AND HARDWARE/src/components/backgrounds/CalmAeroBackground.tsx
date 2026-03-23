import { useEffect, useState, useRef } from 'react';

/**
 * Animated aero background with floating orbs, rotating geometry,
 * and ripple effects for the Contact page.
 */
export const CalmAeroBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ripple + floating dots canvas animation
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

    const dots: { x: number; y: number; vx: number; vy: number; r: number; phase: number }[] = [];
    for (let i = 0; i < 40; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      // Ripple rings
      for (let i = 0; i < 3; i++) {
        const cx = canvas.width * (0.3 + i * 0.2);
        const cy = canvas.height * 0.5;
        const radius = 80 + Math.sin(t + i * 2) * 40 + i * 50;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(217, 91%, 50%, ${0.12 + Math.sin(t + i) * 0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Floating dots with glow
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        const pulse = 0.45 + Math.sin(t * 2 + d.phase) * 0.2;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * (1 + Math.sin(t + d.phase) * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217, 91%, 50%, ${pulse})`;
        ctx.fill();
      });

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
      {/* Gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            160deg,
            hsl(var(--background)) 0%,
            hsl(var(--accent)) 40%,
            hsl(var(--primary) / 0.04) 70%,
            hsl(var(--background)) 100%
          )`,
        }}
      />

      {/* Animated shifting gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 60% 50%, hsl(var(--primary) / 0.08), transparent)`,
          animation: 'driftExpand 14s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.03}px)`,
        }}
      />

      {/* Canvas particles + ripples */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Rotating geometric shapes */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15] dark:opacity-[0.08]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{ transform: `translateY(${scrollY * 0.02}px)` }}
      >
        {/* Spinning diamond */}
        <g style={{ transformOrigin: '720px 300px' }}>
          <animateTransform attributeName="transform" type="rotate" from="0 720 300" to="360 720 300" dur="40s" repeatCount="indefinite" />
          <polygon
            points="720,150 780,300 720,450 660,300"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
          />
          <polygon
            points="720,180 760,300 720,420 680,300"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
        </g>
        {/* Pulsing horizontal lines */}
        <line x1="200" y1="300" x2="600" y2="300" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.5">
          <animate attributeName="x1" values="200;250;200" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="6s" repeatCount="indefinite" />
        </line>
        <line x1="840" y1="300" x2="1240" y2="300" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.5">
          <animate attributeName="x2" values="1240;1190;1240" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="6s" repeatCount="indefinite" />
        </line>

        {/* Orbiting circles */}
        <circle r="5" fill="hsl(var(--primary))" opacity="0.3">
          <animateMotion dur="20s" repeatCount="indefinite" path="M720,300 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0" />
          <animate attributeName="opacity" values="0.15;0.4;0.15" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle r="3" fill="hsl(var(--chart-2))" opacity="0.2">
          <animateMotion dur="28s" repeatCount="indefinite" path="M720,300 m-280,0 a280,200 0 1,0 560,0 a280,200 0 1,0 -560,0" />
        </circle>
      </svg>

      {/* Pulsing glow orbs */}
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{
          background: `hsl(var(--primary))`,
          top: '20%',
          right: '15%',
          animation: 'orbPulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-60 h-60 rounded-full blur-3xl"
        style={{
          background: `hsl(var(--chart-2))`,
          bottom: '20%',
          left: '20%',
          animation: 'orbPulse 12s ease-in-out infinite 3s',
        }}
      />

      <style>{`
        @keyframes driftExpand {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          33% { transform: translateX(25px) translateY(-10px) scale(1.08); }
          66% { transform: translateX(-15px) translateY(8px) scale(0.95); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};
