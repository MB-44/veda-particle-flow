import React, { useEffect, useRef, useState } from 'react';
import styles from './Scene3.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Scene3: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);

    const canvas = canvasRef.current!;
    const textCanvas = textCanvasRef.current!;
    const cursorCanvas = cursorCanvasRef.current!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    textCanvas.width = window.innerWidth;
    textCanvas.height = window.innerHeight;
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;
    const cursorCtx = cursorCanvas.getContext('2d')!;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      life: number;
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
        this.life = 1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.015;
      }
      draw() {
        cursorCtx.fillStyle = `rgba(144,238,144,${this.life})`;
        cursorCtx.beginPath();
        cursorCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        cursorCtx.fill();
      }
    }
    const particles: Particle[] = [];
    const createParticles = (x: number, y: number) => {
      for (let i = 0; i < 3; i++) {
        if (particles.length < 80) particles.push(new Particle(x, y));
      }
    };
    const updateParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
      }
    };
    const mouseMove = (e: MouseEvent) => createParticles(e.clientX, e.clientY);
    const touchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      createParticles(t.clientX, t.clientY);
    };
    const touchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      createParticles(t.clientX, t.clientY);
    };
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('touchstart', touchStart, { passive: false });
    document.addEventListener('touchmove', touchMove, { passive: false });

    const frameCount = 200;
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    const currentFrame = (i: number) =>
      `${import.meta.env.BASE_URL}${isMobile ? 'Scene3_MO' : 'Scene3_PC'}/${i + 1}.webp`;
    const updateLoading = (pct: number) => {
      if (progressRef.current) progressRef.current.textContent = `${pct}%`;
      if (loadingBarRef.current) loadingBarRef.current.style.setProperty('--progress', `${pct}%`);
    };
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = img.onerror = () => {
        loadedImages += 1;
        updateLoading(Math.floor((loadedImages / frameCount) * 100));
        if (loadedImages === frameCount) {
          gsap.to(loaderRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
              loaderRef.current!.style.display = 'none';
              gsap.fromTo(
                [canvas, textCanvas, cursorCanvas],
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: 'power2.out' }
              );
              render();
            }
          });
        }
      };
      images.push(img);
    }

    const controller = { frame: 0 };
    gsap.to(controller, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        scrub: 0,
        pin: canvas,
        end: () => `+=${window.innerHeight * 2}`
      },
      onUpdate: render
    });

    const animate = () => {
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      updateParticles();
      requestAnimationFrame(animate);
    };
    animate();

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(images[controller.frame], 0, 0);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
      ScrollTrigger.getAll().forEach(s => s.kill());
    };
  }, [isMobile]);

  return (
    <>
      <div ref={loaderRef} className={styles.loader}>
        <video className={styles['forest-loop-video']} autoPlay muted loop playsInline>
          <source src={`${import.meta.env.BASE_URL}ForestLoop.webm`} type="video/webm" />
        </video>
        <h2>Forest Experience</h2>
        <div ref={loadingBarRef} className={styles['loading-bar']} />
        <div ref={progressRef}>0%</div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
      <canvas ref={textCanvasRef} className={styles['text-canvas']} />
      <canvas ref={cursorCanvasRef} className={styles['cursor-canvas']} />
      <div className={styles['breathing-container']}>
        <img src={`${import.meta.env.BASE_URL}Seaweda Flower.svg`} className={styles['breathing-background-flower']} alt="" />
        <svg className={styles['meditation-progress-ring']} viewBox="0 0 180 180">
          <circle className={styles['meditation-progress-ring-bg']} r="85" cx="90" cy="90" />
          <circle className={styles['meditation-progress-ring-circle']} r="85" cx="90" cy="90" />
        </svg>
        <div className={styles['breathing-circle']}>
          <div className={styles['breathing-text']}>BREATHE</div>
          <div className={styles['breathing-instruction']}>INHALE</div>
        </div>
        <div className={styles['breathing-rings']}>
          <div className={styles.ring} />
          <div className={styles['ring-2']} />
          <div className={styles['ring-3']} />
        </div>
      </div>
    </>
  );
};

export default Scene3;