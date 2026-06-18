'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

class TextMask {
  size: number;
  copy: string;
  color: string;
  delay: number;
  basedelay: number;
  bound: { width: number; height: number };
  x: number;
  y: number;
  data: ImageData;
  index: number;

  constructor(options: any = {}, canvasWidth: number, canvasHeight: number) {
    const pool = document.createElement('canvas');
    const buffer = pool.getContext('2d')!;
    pool.width = canvasWidth;
    pool.height = canvasHeight;
    buffer.fillStyle = '#000000';
    buffer.fillRect(0, 0, pool.width, pool.height);

    this.size = options.size || 100;
    this.copy = (options.copy || 'Mystery Tarot') + ' ';
    this.color = options.color || '#f2d58a';
    this.delay = options.delay || 2;
    this.basedelay = this.delay;

    buffer.font = `${this.size}px Georgia`;
    const metrics = buffer.measureText(this.copy);
    this.bound = { width: Math.ceil(metrics.width), height: this.size * 1.5 };

    this.x = canvasWidth * 0.5 - this.bound.width * 0.5;
    this.y = canvasHeight * 0.5 - this.bound.height * 0.5;

    buffer.strokeStyle = this.color;
    buffer.lineWidth = Math.max(1, this.size * 0.02);
    buffer.strokeText(this.copy, 0, this.bound.height * 0.8);
    this.data = buffer.getImageData(0, 0, this.bound.width, this.bound.height);
    this.index = 0;
  }

  update(thunder: Thunder[], particles: Particles[]) {
    if (this.index >= this.bound.width) {
      this.index = 0;
      return;
    }

    const data = this.data.data;
    for (let i = this.index * 4; i < data.length; i += 4 * this.data.width) {
      const bitmap = data[i] + data[i + 1] + data[i + 2] + data[i + 3];
      if (bitmap > 255 && Math.random() > 0.95) {
        const x = this.x + this.index;
        const y = this.y + Math.floor(i / this.data.width / 4);
        thunder.push(new Thunder({ x, y }));
        if (Math.random() > 0.6) particles.push(new Particles({ x, y }));
      }
    }

    if (this.delay-- < 0) {
      this.index += 2;
      this.delay += this.basedelay;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.putImageData(this.data, this.x, this.y, 0, 0, 0, this.bound.height);
  }
}

class Thunder {
  lifespan: number;
  maxlife: number;
  color: string;
  glow: string;
  x: number;
  y: number;
  width: number;
  direct: number;
  segments: { direct: number; length: number; change: number }[];

  constructor(options: any = {}) {
    this.lifespan = options.lifespan || Math.round(Math.random() * 10 + 10);
    this.maxlife = this.lifespan;
    this.color = options.color || '#f8e7b3';
    this.glow = options.glow || '#d39d2a';
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 2;
    this.direct = options.direct || Math.random() * Math.PI * 2;
    const max = options.max || Math.round(Math.random() * 8 + 14);
    this.segments = [...new Array(max)].map(() => ({
      direct: this.direct + (Math.PI * Math.random() * 0.2 - 0.1),
      length: Math.random() * 18 + 50,
      change: Math.random() * 0.04 - 0.02,
    }));
  }

  update(index: number, array: Thunder[]) {
    this.segments.forEach((s) => {
      s.direct += s.change;
      if (Math.random() > 0.96) s.change *= -1;
    });

    if (this.lifespan > 0) this.lifespan--;
    else this.remove(index, array);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.lifespan <= 0) return;

    ctx.beginPath();
    ctx.globalAlpha = this.lifespan / this.maxlife;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.glow;
    ctx.moveTo(this.x, this.y);

    let prev = { x: this.x, y: this.y };
    this.segments.forEach((s) => {
      const x = prev.x + Math.cos(s.direct) * s.length;
      const y = prev.y + Math.sin(s.direct) * s.length;
      prev = { x, y };
      ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.closePath();
    ctx.shadowBlur = 0;

    const strength = Math.random() * 30 + 24;
    const light = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, strength);
    light.addColorStop(0, 'rgba(250, 215, 150, 0.55)');
    light.addColorStop(0.25, 'rgba(250, 215, 150, 0.18)');
    light.addColorStop(1, 'rgba(250, 215, 150, 0)');

    ctx.beginPath();
    ctx.fillStyle = light;
    ctx.arc(this.x, this.y, strength, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  remove(index: number, array: Thunder[]) {
    array.splice(index, 1);
  }
}

class Spark {
  x: number;
  y: number;
  v: { direct: number; weight: number; friction: number };
  a: { change: number; min: number; max: number };
  g: { direct: number; weight: number };
  width: number;
  lifespan: number;
  maxlife: number;
  color: string;
  prev: { x: number; y: number };

  constructor(options: any = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.v = options.v || { direct: Math.random() * Math.PI * 2, weight: Math.random() * 10 + 2, friction: 0.88 };
    this.a = options.a || { change: Math.random() * 0.4 - 0.2, min: this.v.direct - Math.PI * 0.4, max: this.v.direct + Math.PI * 0.4 };
    this.g = options.g || { direct: Math.PI * 0.5 + (Math.random() * 0.4 - 0.2), weight: Math.random() * 0.25 + 0.25 };
    this.width = options.width || Math.random() * 2;
    this.lifespan = options.lifespan || Math.round(Math.random() * 20 + 28);
    this.maxlife = this.lifespan;
    this.color = options.color || '#f8d36d';
    this.prev = { x: this.x, y: this.y };
  }

  update(index: number, array: Spark[]) {
    this.prev = { x: this.x, y: this.y };
    this.x += Math.cos(this.v.direct) * this.v.weight;
    this.x += Math.cos(this.g.direct) * this.g.weight;
    this.y += Math.sin(this.v.direct) * this.v.weight;
    this.y += Math.sin(this.g.direct) * this.g.weight;

    if (this.v.weight > 0.2) this.v.weight *= this.v.friction;
    this.v.direct += this.a.change;
    if (this.v.direct > this.a.max || this.v.direct < this.a.min) this.a.change *= -1;

    if (this.lifespan > 0) this.lifespan--;
    else this.remove(index, array);
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.lifespan <= 0) return;
    ctx.beginPath();
    ctx.globalAlpha = this.lifespan / this.maxlife;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.prev.x, this.prev.y);
    ctx.stroke();
    ctx.closePath();
  }

  remove(index: number, array: Spark[]) {
    array.splice(index, 1);
  }
}

class Particles {
  sparks: Spark[];
  constructor(options: any = {}) {
    const max = options.max || Math.round(Math.random() * 8 + 8);
    this.sparks = [...new Array(max)].map(() => new Spark(options));
  }
  update() { this.sparks.forEach((s, i) => s.update(i, this.sparks)); }
  render(ctx: CanvasRenderingContext2D) { this.sparks.forEach((s) => s.render(ctx)); }
}

interface LightningTextProps {
  text?: string;
  className?: string;
}

export default function LightningText({ text = 'Mystery Tarot', className }: LightningTextProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const thunderRef = useRef<Thunder[]>([]);
  const particlesRef = useRef<Particles[]>([]);
  const textRef = useRef<TextMask | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 180;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      textRef.current = new TextMask({ copy: text, size: Math.max(56, Math.min(92, Math.floor(h * 0.58))) }, w, h);
    };

    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const loop = () => {
      if (!textRef.current) return;

      textRef.current.update(thunderRef.current, particlesRef.current);
      thunderRef.current.forEach((l, i) => l.update(i, thunderRef.current));
      particlesRef.current.forEach((p) => p.update());

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.clientWidth || 0, canvas.clientHeight || 0);

      ctx.globalCompositeOperation = 'screen';
      textRef.current.render(ctx);
      thunderRef.current.forEach((l) => l.render(ctx));
      particlesRef.current.forEach((p) => p.render(ctx));

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [text]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    thunderRef.current.push(new Thunder({ x, y }));
    particlesRef.current.push(new Particles({ x, y }));
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center w-full h-[150px]', className)}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="block w-full h-full cursor-crosshair"
      />
    </div>
  );
}
