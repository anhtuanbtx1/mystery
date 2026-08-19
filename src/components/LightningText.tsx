"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SparkPoint = { x: number; y: number; life: number; vx: number; vy: number; color: string };
type TextArc = { points: Array<{ x: number; y: number }>; life: number; maxLife: number; color: string };

interface LightningTextProps {
  text?: string;
  className?: string;
}

export default function LightningText({ text = "World Tour", className }: LightningTextProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const sparksRef = useRef<SparkPoint[]>([]);
  const arcsRef = useRef<TextArc[]>([]);
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

    const createTextArc = (w: number, h: number, fontSize: number) => {
      const textLen = (text.length * fontSize * 0.48);
      const startX = w / 2 - textLen / 2 + Math.random() * textLen;
      const endX = startX + (Math.random() * 80 - 40);
      const startY = h / 2 + (Math.random() * fontSize * 0.6 - fontSize * 0.3);
      const endY = startY + (Math.random() * 30 - 15);
      const steps = 4;
      const pts = [{ x: startX, y: startY }];
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        pts.push({
          x: startX + (endX - startX) * t + (Math.random() * 16 - 8),
          y: startY + (endY - startY) * t + (Math.random() * 14 - 7),
        });
      }
      pts.push({ x: endX, y: endY });
      const isGold = Math.random() > 0.45;
      return {
        points: pts,
        life: 1,
        maxLife: Math.floor(Math.random() * 6 + 4),
        color: isGold ? "rgba(255, 235, 170," : "rgba(130, 255, 215,",
      };
    };

    const loop = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      const fontSize = Math.min(Math.max(Math.floor(w * 0.08), 42), 84);
      ctx.save();
      ctx.font = `700 ${fontSize}px Georgia`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const titleGradient = ctx.createLinearGradient(w * 0.18, h / 2, w * 0.82, h / 2);
      titleGradient.addColorStop(0, "#00e5a3");
      titleGradient.addColorStop(0.32, "#10b981");
      titleGradient.addColorStop(0.68, "#ffe096");
      titleGradient.addColorStop(1, "#fff3c4");

      ctx.shadowBlur = 28;
      ctx.shadowColor = "rgba(0, 230, 150, 0.65)";
      ctx.fillStyle = titleGradient;
      ctx.fillText(text, w / 2, h / 2);

      ctx.lineWidth = 2.2;
      ctx.strokeStyle = "rgba(255, 224, 150, 0.85)";
      ctx.strokeText(text, w / 2, h / 2);

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(255, 240, 208, 0.95)";
      ctx.strokeText(text, w / 2, h / 2);
      ctx.restore();

      // Spawn sparks continuously
      if (Math.random() > 0.28) {
        const baseY = h / 2;
        const baseX = w / 2;
        const step = Math.max(18, Math.floor(fontSize * 0.7));
        const half = Math.floor(text.length / 2);
        for (let i = -half; i <= half; i++) {
          if (Math.random() > 0.5) {
            const x = baseX + i * step * 0.65 + (Math.random() * 8 - 4);
            const y = baseY + (Math.random() * 16 - 8);
            const isLeft = x < w / 2;
            sparksRef.current.push({
              x,
              y,
              life: 1,
              vx: Math.random() * 2.2 - 1.1,
              vy: Math.random() * -2.4 - 0.4,
              color: isLeft ? "0, 230, 160" : "255, 232, 160",
            });
          }
        }
      }

      // Spawn text lightning arcs
      if (Math.random() > 0.48 && arcsRef.current.length < 5) {
        arcsRef.current.push(createTextArc(w, h, fontSize));
      }

      // Draw text lightning arcs
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = arcsRef.current.length - 1; i >= 0; i--) {
        const arc = arcsRef.current[i];
        arc.life -= 1 / arc.maxLife;
        if (arc.life <= 0) {
          arcsRef.current.splice(i, 1);
          continue;
        }
        const alpha = Math.max(0, arc.life);
        ctx.beginPath();
        arc.points.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `${arc.color} ${alpha * 0.5})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = arc.color.includes("255, 235") ? "#e8c97a" : "#00e5a3";
        ctx.stroke();

        ctx.beginPath();
        arc.points.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        ctx.stroke();
      }

      // Draw sparks
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.032;
        if (s.life <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.shadowBlur = 14;
        ctx.shadowColor = `rgba(${s.color}, 0.8)`;
        ctx.fillStyle = `rgba(${s.color}, ${Math.max(0, s.life)})`;
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
