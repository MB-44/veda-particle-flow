import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Scene1.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Scene1: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const meditationBtnRef = useRef<HTMLButtonElement>(null);
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
    const context = canvas.getContext('2d')!;
    const cursorContext = cursorCanvas.getContext('2d')!;

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
        cursorContext.fillStyle = `rgba(144,238,144,${this.life})`;
        cursorContext.beginPath();
        cursorContext.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        cursorContext.fill();
      }
    }

    const particles: Particle[] = [];
    const createParticles = (x: number, y: number) => {
      for (let i = 0; i < 3; i++) if (particles.length < 80) particles.push(new Particle(x, y));
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
    const images: (HTMLImageElement | undefined)[] = new Array(frameCount);
    let loadedImages = 0;
    const currentFrame = (i: number) =>
      `${import.meta.env.BASE_URL}${isMobile ? 'Scene1_MO' : 'Scene1_PC'}/${i + 1}.webp`;

    const updateLoading = (pct: number) => {
      if (progressRef.current) progressRef.current.textContent = `${pct}%`;
      if (loadingBarRef.current) loadingBarRef.current.style.setProperty('--progress', `${pct}%`);
    };

    const finishLoading = () => {
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 0.5,
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
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);

      const markLoaded = () => {
        loadedImages += 1;
        updateLoading(Math.floor((loadedImages / frameCount) * 100));
        if (loadedImages === frameCount) finishLoading();
      };

      img.onload = markLoaded;
      img.onerror = () => {
        images[i] = undefined;
        markLoaded();
      };

      images[i] = img;
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

    meditationBtnRef.current!.addEventListener('click', () => navigate('/forestVeda/Scene2'));

    const animate = () => {
      cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      updateParticles();
      requestAnimationFrame(animate);
    };
    animate();

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const frameImg = images[controller.frame];
      if (
        frameImg &&
        frameImg.complete &&
        frameImg.naturalWidth > 0 &&
        frameImg.naturalHeight > 0
      )
        context.drawImage(frameImg, 0, 0);

      const btn = meditationBtnRef.current!;
      if (controller.frame >= 160) {
        btn.style.display = 'flex';
        btn.style.opacity = '1';
      } else {
        btn.style.opacity = '0';
        setTimeout(() => {
          if (controller.frame < 160) btn.style.display = 'none';
        }, 500);
      }
    }

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
      ScrollTrigger.getAll().forEach(s => s.kill());
    };
  }, [isMobile, navigate]);

  return (
    <>
      <div ref={loaderRef} className={styles.loader}>
        <div className={styles['loading-ornament']} />
        <div className={styles['loading-spinner']} />
        <h2>Forest Experience</h2>
        <div ref={loadingBarRef} className={styles['loading-bar']} />
        <div ref={progressRef}>0%</div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
      <canvas ref={textCanvasRef} className={styles['text-canvas']} />
      <canvas ref={cursorCanvasRef} className={styles['cursor-canvas']} />
      <button ref={meditationBtnRef} className={styles['meditation-btn']}>
        Next Step
      </button>
    </>
  );
};

export default Scene1;