import React, { useEffect, useRef, useState } from 'react';
import styles from './Scene3.module.css';

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

    // (…same canvas + particles setup…)

    // Load frames (scene3)
    const frameCount = 200;
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    const currentFrame = (i: number) =>
      isMobile
        ? `./Scene3_MO/${(i + 1).toString()}.webp`
        : `./Scene3_PC/${(i + 1).toString()}.webp`;
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
          gsap.to(loaderRef.current, {
            opacity: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => {
              loaderRef.current!.style.display = "none";
              gsap.fromTo(
                [canvasRef.current, textCanvasRef.current, cursorCanvasRef.current],
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: "power2.out" }
              );
              render();
            }
          });
        }
      };
      images.push(img);
    }

    // GSAP ScrollTrigger
    const ball = { frame: 0 };
    gsap.to(ball, {
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

    // Canvas + particles loop (same as before)
    const animate = () => {
      const cursorCtx = cursorCanvasRef.current!.getContext('2d')!;
      cursorCtx.clearRect(0, 0, cursorCanvasRef.current!.width, cursorCanvasRef.current!.height);
      // updateParticles();
      requestAnimationFrame(animate);
    };
    animate();

    function render() {
      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(images[ball.frame], 0, 0);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [isMobile]);

  return (
    <>
      <div ref={loaderRef} className={styles.loader}>
        <video className={styles['forest-loop-video']} autoPlay muted loop playsInline>
          <source src="./ForestLoop.webm" type="video/webm" />
        </video>
        <h2>Forest Experience</h2>
        <div ref={loadingBarRef} className={styles['loading-bar']}></div>
        <div ref={progressRef} id="progress">0%</div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas}></canvas>
      <canvas ref={textCanvasRef} className={styles['text-canvas']}></canvas>
      <canvas ref={cursorCanvasRef} className={styles['cursor-canvas']}></canvas>

      <div className={styles['breathing-container']}>
        <img src="./Seaweda Flower.svg" className={styles['breathing-background-flower']} alt="" />
        <svg className={styles['meditation-progress-ring']} viewBox="0 0 180 180">
          <defs>/* ...gradient defs... */</defs>
          <circle className={styles['meditation-progress-ring-bg']} r="85" cx="90" cy="90" />
          <circle className={styles['meditation-progress-ring-circle']} r="85" cx="90" cy="90" />
        </svg>
        <div className={styles['breathing-circle']}>
          <div className={styles['breathing-text']}>BREATHE</div>
          <div className={styles['breathing-instruction']}>INHALE</div>
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

export default Scene3;
