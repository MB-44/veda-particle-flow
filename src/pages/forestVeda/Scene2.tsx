import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Scene2.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Scene2: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const forestLoopRef = useRef<HTMLVideoElement>(null);
  const circularBtnRef = useRef<HTMLButtonElement>(null);
  const secondBtnRef = useRef<HTMLButtonElement>(null);
  const secondContainerRef = useRef<HTMLDivElement>(null);
  const breathingRef = useRef<HTMLDivElement>(null);
  const instructionRef = useRef<HTMLDivElement>(null);
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

    const forestLoop = forestLoopRef.current!;
    let videoReady = false;
    let videoStart = 0;
    forestLoop.addEventListener('loadeddata', () => {
      videoReady = true;
      videoStart = Date.now();
    });

    const frameCount = 200;
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    const currentFrame = (i: number) =>
      `${import.meta.env.BASE_URL}${isMobile ? 'Scene2_MO' : 'Scene2_PC'}/${i + 1}.webp`;
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
        if (loadedImages === frameCount && videoReady) {
          const wait = Math.max(0, 3000 - (Date.now() - videoStart));
          setTimeout(() => {
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
          }, wait);
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

    let pressTimer: ReturnType<typeof setInterval>;
    const CIRCUMFERENCE = 534.07;
    const HOLD_DURATION = 2000;
    const ring = document.querySelector('.progress-ring-circle') as SVGCircleElement;

    const startHold = () => {
      const start = Date.now();
      gsap.set(ring, { strokeDashoffset: CIRCUMFERENCE });
      pressTimer = setInterval(() => {
        const progress = Math.min((Date.now() - start) / HOLD_DURATION, 1);
        gsap.to(ring, { strokeDashoffset: CIRCUMFERENCE * (1 - progress), duration: 0.1 });
        if (progress >= 1) {
          clearInterval(pressTimer);
          beginBreathing();
        }
      }, 16);
    };
    const endHold = () => {
      clearInterval(pressTimer);
      gsap.to(ring, { strokeDashoffset: CIRCUMFERENCE, duration: 0.3 });
    };

    circularBtnRef.current!.addEventListener('mousedown', startHold);
    circularBtnRef.current!.addEventListener('mouseup', endHold);
    circularBtnRef.current!.addEventListener('mouseleave', endHold);
    circularBtnRef.current!.addEventListener('touchstart', startHold, { passive: false });
    circularBtnRef.current!.addEventListener('touchend', endHold, { passive: false });
    circularBtnRef.current!.addEventListener('touchcancel', endHold, { passive: false });

    secondBtnRef.current!.addEventListener('click', () => navigate('/forestVeda/Scene3'));

    const breathingCycle = () => {
      const TOTAL = 36000;
      const CYCLE = 12000;
      const start = Date.now();
      let lastState: 'inhale' | 'hold' | 'exhale' | null = null;
      gsap.set(ring, { strokeDashoffset: CIRCUMFERENCE });
      gsap.to(ring, {
        strokeDashoffset: 0,
        duration: TOTAL / 1000,
        ease: 'none',
        onUpdate: () => {
          const elapsed = (Date.now() - start) % CYCLE;
          const state = elapsed < 4000 ? 'inhale' : elapsed < 8000 ? 'hold' : 'exhale';
          if (state !== lastState) {
            lastState = state;
            gsap.to(instructionRef.current, {
              opacity: 0,
              y: -15,
              duration: 0.3,
              onComplete: () => {
                instructionRef.current!.textContent = state.toUpperCase();
                gsap.to(instructionRef.current, { opacity: 1, y: 0, duration: 0.5 });
              }
            });
          }
        }
      });
      setTimeout(stopBreathing, TOTAL);
    };

    const beginBreathing = () => {
      gsap.to(circularBtnRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        onComplete: () => {
          circularBtnRef.current!.style.display = 'none';
          breathingRef.current!.style.display = 'flex';
          gsap.fromTo(
            breathingRef.current,
            { opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' },
            { opacity: 1, scale: 1, duration: 1, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.3)' }
          );
          breathingCycle();
        }
      });
    };

    const stopBreathing = () => {
      gsap.killTweensOf(ring);
      gsap.set(ring, { strokeDashoffset: 0 });
      gsap.to(breathingRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(0,0,0,0)',
        onComplete: () => {
          breathingRef.current!.style.display = 'none';
        }
      });
    };

    const animate = () => {
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      updateParticles();
      requestAnimationFrame(animate);
    };
    animate();

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(images[controller.frame], 0, 0);
      const f = controller.frame;
      if (f >= 100 && f <= 130) {
        secondContainerRef.current!.style.display = 'none';
        circularBtnRef.current!.style.display = 'block';
        circularBtnRef.current!.style.opacity = '1';
      } else {
        circularBtnRef.current!.style.opacity = '0';
        setTimeout(() => {
          if (controller.frame < 100 || controller.frame > 130) circularBtnRef.current!.style.display = 'none';
        }, 300);
      }
      if (f >= 170 && f <= 200) {
        secondContainerRef.current!.style.display = 'block';
        secondContainerRef.current!.style.opacity = '1';
      } else {
        secondContainerRef.current!.style.opacity = '0';
        setTimeout(() => {
          if (controller.frame < 170 || controller.frame > 200) secondContainerRef.current!.style.display = 'none';
        }, 300);
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
        <video ref={forestLoopRef} className={styles['forest-loop-video']} autoPlay muted loop playsInline>
          <source src={`${import.meta.env.BASE_URL}ForestLoop.webm`} type="video/webm" />
        </video>
        <h2>Forest Experience</h2>
        <div ref={loadingBarRef} className={styles['loading-bar']} />
        <div ref={progressRef}>0%</div>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
      <canvas ref={textCanvasRef} className={styles['text-canvas']} />
      <canvas ref={cursorCanvasRef} className={styles['cursor-canvas']} />
      <div className={styles['circular-button-container']}>
        <button ref={circularBtnRef} className={styles['circular-button']}>
          <span className={styles['button-text']}>HOLD TO BEGIN</span>
          <svg className="progress-ring" viewBox="0 0 180 180">
            <circle className={styles['progress-ring-circle-bg']} r="85" cx="90" cy="90" />
            <circle className="progress-ring-circle" r="85" cx="90" cy="90" />
          </svg>
        </button>
      </div>
      <div ref={secondContainerRef} className={styles['circular-button-container']}>
        <button ref={secondBtnRef} className={styles['circular-button']}>
          <span className={styles['button-text']}>EVERY PRODUCT, A MOMENT OF CALM</span>
        </button>
      </div>
      <div ref={breathingRef} className={styles['breathing-container']}>
        <img src={`${import.meta.env.BASE_URL}Seaweda Flower.svg`} className={styles['breathing-background-flower']} alt="" />
        <svg className={styles['meditation-progress-ring']} viewBox="0 0 180 180">
          <circle className={styles['meditation-progress-ring-bg']} r="85" cx="90" cy="90" />
          <circle className={styles['meditation-progress-ring-circle']} r="85" cx="90" cy="90" />
        </svg>
        <div className={styles['breathing-circle']}>
          <div className={styles['breathing-text']}>BREATHE</div>
          <div ref={instructionRef} className={styles['breathing-instruction']}>INHALE</div>
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

export default Scene2;