
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface ParticleButtonProps {
  children: React.ReactNode;
  particleColor: string;
  className?: string;
  onClick?: () => void;
}

const ParticleButton: React.FC<ParticleButtonProps> = ({ 
  children, 
  particleColor, 
  className = "",
  onClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const createParticle = (): Particle => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 80 + 20;
      
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 0,
        maxLife: Math.random() * 60 + 60
      };
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particlesRef.current.length < 20 && Math.random() < 0.3) {
        particlesRef.current.push(createParticle());
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        const alpha = 1 - (particle.life / particle.maxLife);
        const size = Math.max(1, 4 * alpha);

        if (alpha > 0) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particleColor;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleColor]);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`relative z-10 w-48 h-48 rounded-full border-4 border-white/30 backdrop-blur-sm font-bold text-xl text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl ${className}`}
      >
        {children}
      </button>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ borderRadius: '50%' }}
      />
    </div>
  );
};

export default ParticleButton;
