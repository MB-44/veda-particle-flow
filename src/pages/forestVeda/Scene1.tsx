import React, { useEffect, useRef, useState } from 'react';
import styles from './Scene1.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Scene1: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const meditationBtnRef = useRef<HTMLButtonElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Handle resize
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);

    // Canvas setup
    const canvas = canvasRef.current!;
    const textCanvas = textCanvasRef.current!;
    const cursorCanvas = cursorCanvasRef.current!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    textCanvas.width = window.innerWidth;
    textCanvas.height = window.innerHeight;
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
    const context = canvas.getContext('2d')!;
    const textContext = textCanvas.getContext('2d')!;
    const cursorContext = cursorCanvas.getContext('2d')!;

    // Particle system
    class Particle {
      x: number; y: number; size: number; speedX: number; speedY: number; life: number; color: string;
      constructor(x: number, y: number) {
        this.x = x; this.y = y;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
        this.life = 1;
        this.color = `rgba(144, 238, 144, ${this.life})`;
      }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        this.life -= 0.015;
        this.color = `rgba(144, 238, 144, ${this.life})`;
      }
      draw() {
        cursorContext.fillStyle = this.color;
        cursorContext.beginPath();
        cursorContext.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        cursorContext.fill();
      }
    }
    const particles: Particle[] = [];
    const maxParticles = 80;
    const createParticles = (x: number, y: number) => {
      for (let i = 0; i < 3; i++) {
        if (particles.length < maxParticles) particles.push(new Particle(x, y));
      }
    };
    const updateParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
      }
    };
    document.addEventListener('mousemove', e => createParticles(e.clientX, e.clientY));
    document.addEventListener('touchstart', e => {
      const t = (e as TouchEvent).touches[0];
      createParticles(t.clientX, t.clientY);
    }, { passive: false });
    document.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = (e as TouchEvent).touches[0];
      createParticles(t.clientX, t.clientY);
    }, { passive: false });

    // Frame loading
    const frameCount = 200;
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    const currentFrame = (i: number) =>
      isMobile
        ? `./Scene1_MO/${(i + 1).toString()}.webp`
        : `./Scene1_PC/${(i + 1).toString()}.webp`;
    const updateLoadingProgress = (pct: number) => {
      if (progressRef.current) progressRef.current.textContent = `${pct}%`;
      if (loadingBarRef.current) loadingBarRef.current.style.setProperty('--progress', `${pct}%`);
    };
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = img.onerror = () => {
        loadedImages++;
        const pct = Math.floor((loadedImages / frameCount) * 100);
        updateLoadingProgress(pct);
        if (loadedImages === frameCount) {
          // Hide loader
          const loader = loaderRef.current!;
          gsap.to(loader, {
            opacity: 0, duration: 0.5, onComplete: () => {
              loader.style.display = 'none';
              gsap.fromTo([canvas, textCanvas, cursorCanvas],
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: "power2.out" }
              );
            }
          });
          render();
        }
      };
      images.push(img);
    }

    const ball = { frame: 0 };
    gsap.to(ball, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: 0,
        pin: canvas,
        end: () => `+=${window.innerHeight * 2}`
      },
      onUpdate: render
    });

    // Meditation button
    meditationBtnRef.current!.addEventListener('click', () => {
      gsap.to([canvas, textCanvas, cursorCanvas], {
        opacity: 0, duration: 0.5, onComplete: () => {
          // navigate to scene2
          window.location.href = 'index_s2.html';
        }
      });
    });

    // Animation loop
    const animate = () => {
      cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      updateParticles();
      requestAnimationFrame(animate);
    };
    animate();

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(images[ball.frame], 0, 0);
      const btn = meditationBtnRef.current!;
      if (ball.frame >= 160) {
        btn.style.display = 'flex';
        btn.style.opacity = '1';
      } else {
        btn.style.opacity = '0';
        setTimeout(() => { if (ball.frame < 160) btn.style.display = 'none'; }, 500);
      }
    }

    return () => {
      window.removeEventListener('resize', onResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [isMobile]);

  return (
    <>
      <div ref={loaderRef} className={styles.loader}>
        <div className={styles['loading-ornament']}></div>
        <div className={styles['loading-spinner']}></div>
        <h2>Forest Experience</h2>
        <div ref={loadingBarRef} className={styles['loading-bar']}></div>
        <div ref={progressRef} id="progress">0%</div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas}></canvas>
      <canvas ref={textCanvasRef} className={styles['text-canvas']}></canvas>
      <canvas ref={cursorCanvasRef} className={styles['cursor-canvas']}></canvas>

      <button
        ref={meditationBtnRef}
        className={styles['meditation-btn']}
      >
        Next Step
      </button>
    </>
  );
};

export default Scene1;