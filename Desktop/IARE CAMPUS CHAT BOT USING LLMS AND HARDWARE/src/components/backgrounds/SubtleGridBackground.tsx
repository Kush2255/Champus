import { useEffect, useRef } from 'react';

/**
 * Lightweight animated background with floating dots and subtle grid,
 * suitable for chat and functional pages without being distracting.
 */
export const SubtleGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    for (let i = 0; i < 25; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;

      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        const alpha = 0.25 + Math.sin(t * 2 + d.phase) * 0.1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217, 91%, 50%, ${alpha})`;
        ctx.fill();
      });

      // Faint connections
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `hsla(217, 91%, 50%, ${0.06 * (1 - dist / 180)})`;
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
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            160deg,
            hsl(var(--background)) 0%,
            hsl(var(--primary) / 0.03) 40%,
            hsl(var(--accent)) 70%,
            hsl(var(--background)) 100%
          )`,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Soft glow */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl"
        style={{
          background: 'hsl(var(--primary))',
          top: '30%',
          right: '20%',
          opacity: 0.06,
          animation: 'subtlePulse 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-48 h-48 rounded-full blur-3xl"
        style={{
          background: 'hsl(var(--chart-2))',
          bottom: '25%',
          left: '15%',
          opacity: 0.05,
          animation: 'subtlePulse 14s ease-in-out infinite 3s',
        }}
      />

      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};
