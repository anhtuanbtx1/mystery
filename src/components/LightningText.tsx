"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SparkPoint = { x: number; y: number; life: number; vx: number; vy: number };

interface LightningTextProps {
  text?: string;
  className?: string;
}

export default function LightningText({ text = "Mystery Tarot", className }: LightningTextProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const sparksRef = useRef<SparkPoint[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 150;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      const fontSize = Math.min(Math.max(Math.floor(w * 0.08), 42), 84);
      ctx.save();
      ctx.font = `700 ${fontSize}px Georgia`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(255, 239, 190, 0.8)";
      ctx.fillStyle = "rgba(255, 245, 220, 0.96)";
      ctx.fillText(text, w / 2, h / 2);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
      ctx.strokeText(text, w / 2, h / 2);
      ctx.restore();

      if (Math.random() > 0.62) {
        const baseY = h / 2;
        const baseX = w / 2;
        const step = Math.max(20, Math.floor(fontSize * 0.75));
        const half = Math.floor(text.length / 2);
        for (let i = -half; i <= half; i++) {
          const x = baseX + i * step * 0.65 + (Math.random() * 6 - 3);
          const y = baseY + (Math.random() * 12 - 6);
          sparksRef.current.push({
            x,
            y,
            life: 1,
            vx: Math.random() * 1.8 - 0.9,
            vy: Math.random() * -1.8 - 0.3,
          });
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.03;
        if (s.life <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.shadowBlur = 16;
        ctx.shadowColor = "rgba(255, 232, 160, 0.9)";
        ctx.fillStyle = `rgba(255, 244, 210, ${Math.max(0, s.life)})`;
        ctx.arc(s.x, s.y, 1.2 + s.life * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      frameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text]);

  return (
    <div className={cn("relative inline-flex items-center justify-center w-full h-[120px] bg-transparent overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block w-full h-full bg-transparent" />
    </div>
  );
}
