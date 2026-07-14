'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛏ', 'ᛒ', 'ᛗ', 'ᛚ'];

const FLOATING_CARDS = [
  { top: '7%', left: '-32px', rot: -18, dx: 28, dy: -18, dur: '18s', scale: 0.72, blur: '1.8px', opacity: 0.38, delay: '-2s' },
  { top: '16%', left: '8%', rot: 14, dx: -18, dy: 24, dur: '23s', scale: 0.55, blur: '2.4px', opacity: 0.2, delay: '-8s' },
  { top: '31%', left: '-18px', rot: -8, dx: 26, dy: 18, dur: '20s', scale: 0.64, blur: '1.6px', opacity: 0.34, delay: '-13s' },
  { top: '55%', left: '6%', rot: 24, dx: -20, dy: -26, dur: '26s', scale: 0.58, blur: '2.2px', opacity: 0.24, delay: '-5s' },
  { bottom: '8%', left: '13%', rot: -28, dx: 18, dy: -30, dur: '24s', scale: 0.7, blur: '1.7px', opacity: 0.32, delay: '-16s' },
  { bottom: '-40px', left: '31%', rot: 10, dx: -16, dy: -22, dur: '21s', scale: 0.5, blur: '2.7px', opacity: 0.16, delay: '-10s' },
  { top: '9%', right: '15%', rot: -12, dx: 20, dy: 18, dur: '22s', scale: 0.52, blur: '2.5px', opacity: 0.18, delay: '-4s' },
  { top: '18%', right: '-28px', rot: 18, dx: -30, dy: 20, dur: '19s', scale: 0.75, blur: '1.7px', opacity: 0.36, delay: '-12s' },
  { top: '37%', right: '7%', rot: -22, dx: 22, dy: -18, dur: '25s', scale: 0.58, blur: '2px', opacity: 0.25, delay: '-7s' },
  { top: '58%', right: '-36px', rot: 16, dx: -24, dy: -24, dur: '23s', scale: 0.68, blur: '1.8px', opacity: 0.33, delay: '-15s' },
  { bottom: '8%', right: '12%', rot: 30, dx: -22, dy: -28, dur: '27s', scale: 0.72, blur: '1.6px', opacity: 0.35, delay: '-3s' },
  { bottom: '-46px', right: '30%', rot: -10, dx: 18, dy: -20, dur: '20s', scale: 0.48, blur: '2.8px', opacity: 0.14, delay: '-11s' },
  { top: '-58px', left: '41%', rot: 6, dx: 20, dy: 24, dur: '28s', scale: 0.46, blur: '3px', opacity: 0.12, delay: '-18s' },
  { bottom: '-54px', left: '52%', rot: -16, dx: -20, dy: -22, dur: '24s', scale: 0.5, blur: '2.7px', opacity: 0.15, delay: '-6s' },
];

type ParticleKind = 'star' | 'dust' | 'wisp' | 'firefly' | 'rune';

type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  char?: string;
};

type Bolt = {
  points: Array<{ x: number; y: number }>;
  branches: Array<Array<{ x: number; y: number }>>;
  born: number;
  duration: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pickRune = () => RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: rect.width, height: rect.height, ctx };
}

function createParticles(width: number, height: number, reduced: boolean) {
  const particles: Particle[] = [];
  const area = Math.max(width * height, 1);
  const starCount = reduced ? 80 : Math.min(180, Math.round(area / 8500));
  const dustCount = reduced ? 0 : Math.min(95, Math.round(area / 14500));
  const wispCount = reduced ? 0 : 16;
  const fireflyCount = reduced ? 0 : 14;
  const runeCount = reduced ? 0 : 10;

  for (let i = 0; i < starCount; i++) {
    particles.push({ kind: 'star', x: rand(0, width), y: rand(0, height), vx: 0, vy: 0, size: rand(0.6, 1.8), alpha: rand(0.22, 0.75), phase: rand(0, Math.PI * 2) });
  }
  for (let i = 0; i < dustCount; i++) {
    particles.push({ kind: 'dust', x: rand(0, width), y: rand(0, height), vx: rand(-0.08, 0.08), vy: rand(-0.05, 0.12), size: rand(1.4, 3.8), alpha: rand(0.08, 0.24), phase: rand(0, Math.PI * 2) });
  }
  for (let i = 0; i < wispCount; i++) {
    particles.push({ kind: 'wisp', x: rand(-width * 0.1, width * 1.1), y: rand(height * 0.2, height * 0.95), vx: rand(-0.12, 0.12), vy: rand(-0.03, 0.04), size: rand(60, 180), alpha: rand(0.025, 0.075), phase: rand(0, Math.PI * 2) });
  }
  for (let i = 0; i < fireflyCount; i++) {
    particles.push({ kind: 'firefly', x: rand(0, width), y: rand(height * 0.18, height * 0.9), vx: rand(-0.22, 0.22), vy: rand(-0.14, 0.14), size: rand(1.5, 2.8), alpha: rand(0.28, 0.58), phase: rand(0, Math.PI * 2) });
  }
  for (let i = 0; i < runeCount; i++) {
    particles.push({ kind: 'rune', x: rand(width * 0.08, width * 0.92), y: rand(height * 0.55, height * 1.05), vx: rand(-0.04, 0.04), vy: rand(-0.18, -0.08), size: rand(14, 22), alpha: rand(0.12, 0.28), phase: rand(0, Math.PI * 2), char: pickRune() });
  }

  return particles;
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], width: number, height: number, frame: number, reduced: boolean) {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';

  for (const p of particles) {
    const pulse = reduced ? 1 : 0.62 + Math.sin(frame * 0.018 + p.phase) * 0.38;

    if (p.kind === 'rune') {
      ctx.save();
      ctx.font = `${p.size}px Georgia, serif`;
      ctx.fillStyle = `rgba(200, 155, 255, ${p.alpha * pulse})`;
      ctx.shadowColor = 'rgba(157, 105, 255, 0.34)';
      ctx.shadowBlur = 12;
      ctx.fillText(p.char || 'ᚠ', p.x, p.y);
      ctx.restore();
    } else {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (p.kind === 'wisp' ? 1.8 : 4));
      const color = p.kind === 'firefly' ? '216,190,255' : p.kind === 'star' ? '245,238,255' : '176,112,255';
      gradient.addColorStop(0, `rgba(${color}, ${p.alpha * pulse})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.kind === 'wisp' ? 1.8 : 4), 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduced && p.kind !== 'star') {
      p.x += p.vx + Math.sin(frame * 0.004 + p.phase) * 0.035;
      p.y += p.vy + Math.cos(frame * 0.003 + p.phase) * 0.018;
      if (p.x < -220) p.x = width + 220;
      if (p.x > width + 220) p.x = -220;
      if (p.y < -80) p.y = height + 80;
      if (p.y > height + 80) p.y = -80;
    }
  }

  ctx.globalCompositeOperation = 'source-over';
}

function createBolt(width: number, height: number): Bolt {
  const fromLeft = Math.random() > 0.5;
  const start = { x: fromLeft ? rand(-20, width * 0.2) : rand(width * 0.8, width + 20), y: rand(0, height * 0.22) };
  const end = { x: rand(width * 0.18, width * 0.82), y: rand(height * 0.3, height * 0.72) };
  const segments = Math.floor(rand(5, 9));
  const points = Array.from({ length: segments + 1 }).map((_, i) => {
    const t = i / segments;
    return {
      x: start.x + (end.x - start.x) * t + rand(-28, 28) * (1 - Math.abs(t - 0.5)),
      y: start.y + (end.y - start.y) * t + rand(-18, 22),
    };
  });
  const branches = points.slice(2, -1).filter(() => Math.random() > 0.55).map((origin) => {
    const len = rand(45, 120);
    const angle = rand(-0.15, 0.9) * (fromLeft ? 1 : -1);
    return [origin, { x: origin.x + Math.cos(angle) * len, y: origin.y + Math.sin(angle) * len }];
  });

  return { points, branches, born: performance.now(), duration: rand(360, 560) };
}

function strokeBolt(ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>, alpha: number, width: number) {
  ctx.beginPath();
  points.forEach((point, index) => {
    index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = `rgba(216,190,255,${alpha})`;
  ctx.lineWidth = width;
  ctx.shadowColor = 'rgba(166, 96, 255, 0.72)';
  ctx.shadowBlur = 16;
  ctx.stroke();
}

export default function CosmicBackground() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const lightningCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    let frame = 0;
    let animationFrame: number | undefined;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let reduced = prefersReducedMotion();

    const setup = () => {
      const next = resizeCanvas(canvas);
      width = next.width;
      height = next.height;
      if (!next.ctx) return;
      particles = createParticles(width, height, reduced);
      drawParticles(next.ctx, particles, width, height, frame, reduced);
    };

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      frame += 1;
      drawParticles(ctx, particles, width, height, frame, reduced);
      if (!reduced) animationFrame = requestAnimationFrame(loop);
    };

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      reduced = media.matches;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      setup();
      if (!reduced) animationFrame = requestAnimationFrame(loop);
    };

    setup();
    if (!reduced) animationFrame = requestAnimationFrame(loop);

    window.addEventListener('resize', setup);
    media.addEventListener('change', handleMotionChange);
    return () => {
      window.removeEventListener('resize', setup);
      media.removeEventListener('change', handleMotionChange);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const wrapper = cardsRef.current;
    if (!wrapper) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      wrapper.querySelectorAll<HTMLElement>('.bg-card').forEach((card, index) => {
        const k = index % 2 === 0 ? -16 : 14;
        card.style.setProperty('--mx', `${x * k}px`);
        card.style.setProperty('--my', `${y * k}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = lightningCanvasRef.current;
    if (!canvas) return;

    let width = 0;
    let height = 0;
    let animationFrame: number | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let bolts: Bolt[] = [];
    let reduced = prefersReducedMotion();

    const setup = () => {
      const next = resizeCanvas(canvas);
      width = next.width;
      height = next.height;
      next.ctx?.clearRect(0, 0, width, height);
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const now = performance.now();
      ctx.clearRect(0, 0, width, height);
      bolts = bolts.filter((bolt) => now - bolt.born < bolt.duration);

      bolts.forEach((bolt) => {
        const age = (now - bolt.born) / bolt.duration;
        const alpha = Math.max(0, Math.sin((1 - age) * Math.PI)) * 0.55;
        strokeBolt(ctx, bolt.points, alpha * 0.32, 5.5);
        strokeBolt(ctx, bolt.points, alpha, 1.2);
        bolt.branches.forEach((branch) => strokeBolt(ctx, branch, alpha * 0.42, 0.8));
      });

      if (bolts.length) animationFrame = requestAnimationFrame(draw);
    };

    const schedule = () => {
      if (reduced) return;
      timeout = setTimeout(() => {
        bolts.push(createBolt(width, height));
        if (!animationFrame) animationFrame = requestAnimationFrame(draw);
        schedule();
      }, rand(3200, 7200));
    };

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      reduced = media.matches;
      if (timeout) clearTimeout(timeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      timeout = undefined;
      animationFrame = undefined;
      bolts = [];
      setup();
      schedule();
    };

    setup();
    schedule();

    window.addEventListener('resize', setup);
    media.addEventListener('change', handleMotionChange);
    return () => {
      window.removeEventListener('resize', setup);
      media.removeEventListener('change', handleMotionChange);
      if (timeout) clearTimeout(timeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ perspective: 1200 }}>
      <div className="bg-nebula layer z-0" />
      <div className="bg-vignette layer z-[1]" />
      <div className="bg-sigil-wrap layer z-[2]">
        <img src="/assets/emblem.svg" alt="" className="bg-sigil" draggable={false} />
      </div>
      <canvas id="particleCanvas" ref={particleCanvasRef} className="absolute inset-0 z-[3] h-full w-full" />
      <canvas id="lightningCanvas" ref={lightningCanvasRef} className="absolute inset-0 z-[4] h-full w-full" />
      <div id="floatingCards" ref={cardsRef} className="layer z-[5] overflow-hidden">
        {FLOATING_CARDS.map((card, index) => {
          const style = {
            '--base-rot': `${card.rot}deg`,
            '--dx': `${card.dx}px`,
            '--dy': `${card.dy}px`,
            '--scale': card.scale,
            '--dur': card.dur,
            '--mx': '0px',
            '--my': '0px',
            animationDelay: card.delay,
            opacity: card.opacity,
            filter: `blur(${card.blur})`,
            backgroundImage: "url('/assets/card-back.svg')",
          } as CSSProperties & Record<string, string | number>;

          if (card.top) style.top = card.top;
          if (card.bottom) style.bottom = card.bottom;
          if (card.left) style.left = card.left;
          if (card.right) style.right = card.right;

          return <div key={`floating-card-${index}`} className="bg-card absolute" style={style} />;
        })}
      </div>
    </div>
  );
}
