import React, { useEffect, useRef, useState } from 'react';
import styles from './Scene2.module.css';

const Scene2: React.FC = () => {
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

    // (…same canvas + particles setup as Scene1…)

    // Video logic
    const forestLoop = forestLoopRef.current!;
    let videoStarted = false;
    let videoStartTime = 0;
    const minimumVideoTime = 3000;
    forestLoop.addEventListener('loadeddata', () => {
      videoStarted = true;
      videoStartTime = Date.now();
    });

    // Load frames
    const frameCount = 200;
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    const currentFrame = (i: number) =>
      isMobile
        ? `./Scene2_MO/${(i + 1).toString()}.webp`
        : `./Scene2_PC/${(i + 1).toString()}.webp`;
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
        if (loadedImages === frameCount && videoStarted) {
          const elapsed = Date.now() - videoStartTime;
          const wait = Math.max(0, minimumVideoTime - elapsed);
          setTimeout(() => {
            gsap.to(loaderRef.current, {
              opacity: 0,
              duration: 0.8,
              ease: "power2.inOut",
              onComplete: () => {
                loaderRef.current!.style.display = "none";
                gsap.fromTo(
                  [canvasRef.current, textCanvasRef.current, cursorCanvasRef.current],
                  { opacity: 0 },
                  { opacity: 1, duration: 0.8, ease: "power2.out" }
                );
                render();
              }
            });
          }, wait);
        }
      };
      images.push(img);
    }

    // GSAP scrollTrigger (same as Scene1)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ballRef = useRef<{ frame: number }>({ frame: 0 });
    gsap.to(ballRef.current, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: 0,
        pin: canvasRef.current,
        end: () => `+=${window.innerHeight * 2}`
      },
      onUpdate: render
    });

    // Hold‐to‐begin logic
    let isHolding = false;
    let pressTimer: ReturnType<typeof setInterval>;
    const CIRCUMFERENCE = 534.07;
    const HOLD_DURATION = 2000;
    const progressRing = document.querySelector('.progress-ring-circle')!;
    const startHold = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isHolding = true;
      const startTime = Date.now();
      gsap.set(progressRing, { strokeDashoffset: CIRCUMFERENCE });
      pressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / HOLD_DURATION, 1);
        gsap.to(progressRing, {
          strokeDashoffset: CIRCUMFERENCE * (1 - progress),
          duration: 0.1
        });
        if (progress >= 1) {
          clearInterval(pressTimer);
          startBreathingExercise();
        }
      }, 16);
    };
    const endHold = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (isHolding) {
        clearInterval(pressTimer);
        isHolding = false;
        gsap.to(progressRing, { strokeDashoffset: CIRCUMFERENCE, duration: 0.3 });
      }
    };
    circularBtnRef.current!.addEventListener('mousedown', startHold);
    circularBtnRef.current!.addEventListener('mouseup', endHold);
    circularBtnRef.current!.addEventListener('mouseleave', endHold);
    circularBtnRef.current!.addEventListener('touchstart', startHold, { passive: false });
    circularBtnRef.current!.addEventListener('touchend', endHold, { passive: false });
    circularBtnRef.current!.addEventListener('touchcancel', endHold, { passive: false });

    function startBreathingExercise() {
      gsap.to(circularBtnRef.current, {
        opacity: 0, scale: 0.8, duration: 0.8, onComplete: () => {
          circularBtnRef.current!.style.display = 'none';
          breathingRef.current!.style.display = 'flex';
          gsap.fromTo(
            breathingRef.current,
            { opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' },
            { opacity: 1, scale: 1, duration: 1, ease: "power2.out", backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.3)' }
          );
          startBreathingCycle();
        }
      });
    }

    function startBreathingCycle() {
      const BREATHING_DURATION = 36000;
      const CYCLE_DURATION = 12000;
      const cycleStart = Date.now();
      let lastState: 'inhale'|'hold'|'exhale'|null = null;

      gsap.set(progressRing, { strokeDashoffset: CIRCUMFERENCE });
      gsap.to(progressRing, {
        strokeDashoffset: 0,
        duration: BREATHING_DURATION/1000,
        ease: "none",
        onUpdate: () => {
          const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION;
          const state: 'inhale'|'hold'|'exhale' =
            elapsed < 4000 ? 'inhale' : elapsed < 8000 ? 'hold' : 'exhale';
          if (state !== lastState) {
            lastState = state;
            gsap.to(instructionRef.current, {
              opacity: 0, y: -15, duration: 0.3, onComplete: () => {
                instructionRef.current!.textContent = state.toUpperCase();
                gsap.to(instructionRef.current, { opacity: 1, y: 0, duration: 0.5 });
              }
            });
          }
        }
      });
      setTimeout(() => stopBreathingExercise(), BREATHING_DURATION);
    }

    function stopBreathingExercise() {
      gsap.killTweensOf(progressRing);
      gsap.set(progressRing, { strokeDashoffset: 0 });
      gsap.to(breathingRef.current, {
        opacity: 0, scale: 0.95, duration: 0.8, backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)',
        onComplete: () => { breathingRef.current!.style.display = 'none'; }
      });
    }

    // Second button to go to Scene 3
    secondBtnRef.current!.addEventListener('click', () => {
      gsap.to([canvasRef.current, textCanvasRef.current, cursorCanvasRef.current], {
        opacity: 0, duration: 0.5, onComplete: () => {
          window.location.href = 'index_s3.html';
        }
      });
    });

    // Animation loop + render
    const animate = () => {
      const cursorCtx = cursorCanvasRef.current!.getContext('2d')!;
      cursorCtx.clearRect(0, 0, cursorCanvasRef.current!.width, cursorCanvasRef.current!.height);
      updateParticles();
      requestAnimationFrame(animate);
    };
    animate();

    function render() {
      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(images[ballRef.current.frame], 0, 0);

      // show/hide first circularBtn
      const f = ballRef.current.frame;
      if (f >= 100 && f <= 130) {
        secondContainerRef.current!.style.display = 'none';
        circularBtnRef.current!.style.display = 'block';
        circularBtnRef.current!.style.opacity = '1';
      } else {
        circularBtnRef.current!.style.opacity = '0';
        setTimeout(() => { if (f < 100 || f > 130) circularBtnRef.current!.style.display = 'none'; }, 300);
      }
      // show/hide second button
      if (f >= 170 && f <= 200) {
        secondContainerRef.current!.style.display = 'block';
        secondContainerRef.current!.style.opacity = '1';
      } else {
        secondContainerRef.current!.style.opacity = '0';
        setTimeout(() => { if (f < 170 || f > 200) secondContainerRef.current!.style.display = 'none'; }, 300);
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
        <video ref={forestLoopRef} className={styles['forest-loop-video']} autoPlay muted loop playsInline>
          <source src="./ForestLoop.webm" type="video/webm" />
        </video>
        <h2>Forest Experience</h2>
        <div ref={loadingBarRef} className={styles['loading-bar']}></div>
        <div ref={progressRef} id="progress">0%</div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas}></canvas>
      <canvas ref={textCanvasRef} className={styles['text-canvas']}></canvas>
      <canvas ref={cursorCanvasRef} className={styles['cursor-canvas']}></canvas>

      <div className={styles['circular-button-container']}>
        <button ref={circularBtnRef} className={styles['circular-button']}>
          <span className={styles['button-text']}>HOLD TO BEGIN</span>
          <svg className="progress-ring" viewBox="0 0 180 180">
            <circle className={styles['progress-ring-circle-bg']} r="85" cx="90" cy="90" />
            <circle className={styles['progress-ring-circle']} r="85" cx="90" cy="90" />
          </svg>
        </button>
      </div>

      <div ref={secondContainerRef} className={styles['circular-button-container']}>
        <button ref={secondBtnRef} className={styles['circular-button']}>
          <span className={styles['button-text']}>EVERY PRODUCT, A MOMENT OF CALM</span>
        </button>
      </div>

      <div ref={breathingRef} className={styles['breathing-container']}>
        <img src="./Seaweda Flower.svg" className={styles['breathing-background-flower']} alt="" />
        <svg className={styles['meditation-progress-ring']} viewBox="0 0 180 180">
          <defs>/* ...gradient defs... */</defs>
          <circle className={styles['meditation-progress-ring-bg']} r="85" cx="90" cy="90" />
          <circle className={styles['meditation-progress-ring-circle']} r="85" cx="90" cy="90" />
        </svg>
        <div className={styles['breathing-circle']}>
          <div className={styles['breathing-text']}>BREATHE</div>
          <div ref={instructionRef} className={styles['breathing-instruction']}>INHALE</div>
        </div>
        <div className={styles['breathing-rings']}>
          <div className={styles.ring}></div>
          <div className={styles['ring-2']}></div>
          <div className={styles['ring-3']}></div>
        </div>
      </div>
    </>
  );
};

export default Scene2;

function updateParticles() {
    throw new Error('Function not implemented.');
}
