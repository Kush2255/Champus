import { useEffect, useState, useRef } from 'react';

/**
 * Neural-style animated background with data pulses, scanning lines,
 * radar sweeps, and particle network for the Analysis page.
 */
export const NeuralGridBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Neural network canvas animation
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

    // Neural nodes
    const nodes: { x: number; y: number; vx: number; vy: number; r: number; pulse: number }[] = [];
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Data pulses traveling along connections
    const pulses: { fromIdx: number; toIdx: number; progress: number; speed: number }[] = [];

    let t = 0;
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Draw connections and spawn pulses
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = 0.15 * (1 - dist / 150);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `hsla(217, 91%, 50%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Randomly spawn pulse
            if (Math.random() < 0.0003 && pulses.length < 15) {
              pulses.push({ fromIdx: i, toIdx: j, progress: 0, speed: 0.008 + Math.random() * 0.012 });
            }
          }
        }
      }

      // Draw nodes with pulse glow
      nodes.forEach((n) => {
        const glow = 0.5 + Math.sin(t * 2 + n.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (1 + Math.sin(t + n.pulse) * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217, 91%, 50%, ${glow})`;
        ctx.fill();
      });

      // Animate data pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const from = nodes[p.fromIdx];
        const to = nodes[p.toIdx];
        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217, 91%, 50%, ${0.8 * (1 - Math.abs(p.progress - 0.5) * 2)})`;
        ctx.fill();
      }

      // Scanning horizontal line
      const scanY = (t * 80) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      gradient.addColorStop(0, 'hsla(217, 91%, 60%, 0)');
      gradient.addColorStop(0.5, 'hsla(217, 91%, 60%, 0.08)');
      gradient.addColorStop(1, 'hsla(217, 91%, 60%, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 30, canvas.width, 60);

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
      {/* Dark analytical base */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            hsl(var(--background)) 0%,
            hsl(var(--primary) / 0.04) 50%,
            hsl(var(--background)) 100%
          )`,
        }}
      />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translateY(${scrollY * 0.02}px)`,
          animation: 'gridShift 20s linear infinite',
        }}
      />

      {/* Neural network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Radar sweep */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.15] dark:opacity-[0.1]"
        style={{
          top: '20%',
          left: '50%',
          transform: `translate(-50%, ${scrollY * -0.03}px)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, hsl(var(--primary) / 0.3) 10%, transparent 20%)`,
            animation: 'radarSweep 4s linear infinite',
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)`,
            animation: 'radarPulse 6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Secondary radar */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          bottom: '10%',
          right: '15%',
          transform: `translateY(${scrollY * -0.05}px)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full opacity-[0.12] dark:opacity-[0.08]"
          style={{
            background: `conic-gradient(from 180deg, transparent 0%, hsl(var(--chart-3) / 0.3) 8%, transparent 16%)`,
            animation: 'radarSweep 6s linear infinite reverse',
          }}
        />
      </div>

      {/* Animated flight paths */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15] dark:opacity-[0.1]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{ transform: `translateY(${scrollY * 0.015}px)` }}
      >
        <path
          d="M0,450 C200,350 400,500 600,400 S900,300 1100,420 S1300,380 1440,450"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          className="animate-[navPath_8s_linear_infinite]"
        />
        <path
          d="M0,250 C300,180 500,320 750,250 S1000,200 1200,280 S1400,220 1440,260"
          fill="none"
          stroke="hsl(var(--chart-2))"
          strokeWidth="1"
          strokeDasharray="5 8"
          className="animate-[navPath_12s_linear_infinite]"
        />
        {/* Traveling dots */}
        <circle r="4" fill="hsl(var(--primary))" opacity="0.6">
          <animateMotion dur="6s" repeatCount="indefinite" path="M0,450 C200,350 400,500 600,400 S900,300 1100,420 S1300,380 1440,450" />
        </circle>
        <circle r="3" fill="hsl(var(--chart-2))" opacity="0.4">
          <animateMotion dur="10s" repeatCount="indefinite" path="M0,250 C300,180 500,320 750,250 S1000,200 1200,280 S1400,220 1440,260" />
        </circle>
        {/* Pulsing node dots */}
        <circle cx="600" cy="400" r="4" fill="hsl(var(--primary))">
          <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="1100" cy="420" r="3" fill="hsl(var(--primary))">
          <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Glowing processing lights */}
      <div
        className="absolute w-48 h-48 rounded-full blur-3xl"
        style={{
          background: `hsl(var(--primary))`,
          top: '60%',
          left: '25%',
          animation: 'glow 3s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-32 h-32 rounded-full blur-3xl"
        style={{
          background: `hsl(var(--chart-2))`,
          top: '15%',
          right: '30%',
          animation: 'glow 5s ease-in-out infinite 1.5s',
        }}
      />

      <style>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radarPulse {
          0%, 100% { transform: scale(1); opacity: 0.04; }
          50% { transform: scale(1.08); opacity: 0.08; }
        }
        @keyframes navPath {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -200; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.2); }
        }
        @keyframes gridShift {
          from { background-position: 0 0; }
          to { background-position: 60px 60px; }
        }
      `}</style>
    </div>
  );
};
