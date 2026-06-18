'use client';

import React, { useEffect, useRef, useState } from 'react';

type Sparkle = {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
};

type Rune = {
  char: string;
  left: string;
  animationDelay: string;
  animationDuration: string;
};

type ShootingStar = {
  left: string;
  top: string;
  width: string;
  angle: string;
  distX: string;
  distY: string;
  maxOpacity: number;
  delay: string;
  duration: string;
};

const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛏ', 'ᛒ', 'ᛗ', 'ᛚ'];

const CARD_CONFIGS = [
  { top: '10%', left: '-18px', rotA: '-16deg', rotB: '-24deg', dx: '18px', dy: '-18px', dur: '22s', scale: 0.88 },
  { top: '24%', right: '2%', rotA: '18deg', rotB: '28deg', dx: '-18px', dy: '12px', dur: '26s', scale: 0.78 },
  { top: '44%', left: '7%', rotA: '-12deg', rotB: '-6deg', dx: '-14px', dy: '20px', dur: '24s', scale: 0.92 },
  { bottom: '14%', left: '12%', rotA: '32deg', rotB: '42deg', dx: '16px', dy: '-12px', dur: '28s', scale: 0.84 },
  { bottom: '10%', right: '-22px', rotA: '-20deg', rotB: '-10deg', dx: '-20px', dy: '-16px', dur: '25s', scale: 0.9 }
];

export default function CosmicBackground() {
  const nebulaRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const sigilRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Empty on SSR -> matches client first paint -> no hydration mismatch.
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [runes, setRunes] = useState<Rune[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  // Generate randomized particles only on the client after mount.
  useEffect(() => {
    const nextSparkles: Sparkle[] = Array.from({ length: 42 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${4 + Math.random() * 5}s`,
    }));
    setSparkles(nextSparkles);

    const nextRunes: Rune[] = Array.from({ length: 16 }).map(() => ({
      char: RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)],
      left: `${5 + Math.random() * 90}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${8 + Math.random() * 8}s`,
    }));
    setRunes(nextRunes);

    const nextStars: ShootingStar[] = Array.from({ length: 5 }).map(() => {
      const angleVal = 24 + Math.random() * 8;
      const lengthVal = 55 + Math.random() * 95;
      const drift = 120 + Math.random() * 140;
      const rad = (angleVal * Math.PI) / 180;
      const distX = drift * Math.cos(rad);
      const distY = drift * Math.sin(rad);

      return {
        left: `${Math.random() * 75}%`,
        top: `${Math.random() * 55}%`,
        width: `${lengthVal}px`,
        angle: `${angleVal}deg`,
        distX: `${distX}px`,
        distY: `${distY}px`,
        maxOpacity: 0.18 + Math.random() * 0.22,
        delay: `${Math.random() * 10}s`,
        duration: `${9 + Math.random() * 8}s`
      };
    });
    setShootingStars(nextStars);
  }, []);

  // Parallax on mouse move.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;

      if (nebulaRef.current) {
        nebulaRef.current.style.transform = `translate(${x * -30}px, ${y * -24}px) scale(1.02)`;
      }
      if (starsRef.current) {
        starsRef.current.style.transform = `translate(${x * -12}px, ${y * -10}px)`;
      }
      if (sigilRef.current) {
        sigilRef.current.style.transform = `translateX(calc(-50% + ${x * -28}px)) translateY(${y * -22}px)`;
      }
      if (cardsRef.current) {
        const bgCards = cardsRef.current.querySelectorAll('.bg-card');
        bgCards.forEach((card, i) => {
          const k = i % 2 === 0 ? -18 : 14;
          (card as HTMLElement).style.transform = `translate(${x * k}px, ${y * k}px) scale(${CARD_CONFIGS[i].scale})`;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: 1200 }}>
      {/* 1. Nebula */}
      <div
        ref={nebulaRef}
        className="layer nebula bg-[radial-gradient(circle_at_50%_22%,rgba(163,91,255,.18)_0%,transparent_28%),radial-gradient(circle_at_18%_78%,rgba(232,201,122,.06)_0%,transparent_18%),radial-gradient(circle_at_82%_72%,rgba(155,127,212,.08)_0%,transparent_20%)] opacity-95 blur-[18px]"
        style={{ willChange: 'transform' }}
      />

      {/* 2. Stars */}
      <div
        ref={starsRef}
        className="layer stars opacity-[0.62]"
        style={{
          backgroundImage: "url('/assets/starfield.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '820px 620px',
          willChange: 'transform',
        }}
      />

      {/* 3. Sigil */}
      <div
        ref={sigilRef}
        className="layer sigil-wrap top-[4%] left-1/2 w-[300px] h-[300px] opacity-15 text-[#b9a2e8] will-change-transform"
        style={{ filter: 'drop-shadow(0 0 14px rgba(155,127,212,.22))' }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="0.75" className="sigil-outer">
          <circle cx="100" cy="100" r="94" strokeDasharray="7,5"></circle>
          <circle cx="100" cy="100" r="78"></circle>
          <path d="M100 20 L180 140 L20 140 Z" strokeWidth="0.5"></path>
          <path d="M100 180 L180 60 L20 60 Z" strokeWidth="0.5"></path>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" width="74%" height="74%" fill="none" stroke="currentColor" strokeWidth="0.75" className="sigil-inner">
            <circle cx="100" cy="100" r="72"></circle>
            <circle cx="100" cy="100" r="50" strokeDasharray="10,12"></circle>
            <path d="M100 6 L100 194 M6 100 L194 100" strokeWidth="0.4"></path>
          </svg>
        </div>
      </div>

      {/* 4. Sparkles (client-only) */}
      <div className="layer z-[3]" suppressHydrationWarning>
        {sparkles.map((s, i) => (
          <div
            key={`sparkle-${i}`}
            className="sparkle bg-[rgba(255,240,208,.95)] rounded-full absolute w-[2px] h-[2px]"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.animationDelay,
              animationDuration: s.animationDuration,
              boxShadow: '0 0 10px rgba(232,201,122,.9)',
            }}
          />
        ))}
      </div>

      {/* Shooting Stars layer (client-only) */}
      <div className="layer z-[3] overflow-hidden" suppressHydrationWarning>
        {shootingStars.map((s, i) => {
          const inlineStyle = {
            left: s.left,
            top: s.top,
            width: s.width,
            '--angle': s.angle,
            '--dist-x': s.distX,
            '--dist-y': s.distY,
            '--max-opacity': s.maxOpacity,
            '--dur': s.duration,
            animationDelay: s.delay,
          } as React.CSSProperties & Record<string, string | number>;

          return (
            <div
              key={`shooting-star-${i}`}
              className="shooting-star"
              style={inlineStyle}
            />
          );
        })}
      </div>

      {/* 5. Runes (client-only) */}
      <div className="layer z-[4] top-auto bottom-0 h-[36vh] overflow-hidden" suppressHydrationWarning>
        {runes.map((r, i) => (
          <div
            key={`rune-${i}`}
            className="rune absolute font-display text-[16px] text-[rgba(185,162,232,.45)]"
            style={{
              left: r.left,
              animationDelay: r.animationDelay,
              animationDuration: r.animationDuration,
              textShadow: '0 0 8px rgba(185,162,232,.25)',
            }}
          >
            {r.char}
          </div>
        ))}
      </div>

      {/* 6. Floating cards */}
      <div ref={cardsRef} className="layer z-[5] overflow-hidden">
        {CARD_CONFIGS.map((c, i) => {
          const styleProps: any = {
            ...c,
            '--rot-a': c.rotA,
            '--rot-b': c.rotB,
            '--dx': c.dx,
            '--dy': c.dy,
            '--dur': c.dur,
            transform: `scale(${c.scale})`,
            animationDelay: `${-i * 4}s`,
            backgroundImage: "url('/assets/card-back.svg')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            boxShadow: 'var(--shadow-lg), var(--edge-gold)',
          };

          return (
            <div
              key={`bg-card-${i}`}
              className="bg-card absolute w-[128px] h-[218px] rounded-[18px] opacity-55 blur-[1.5px]"
              style={styleProps}
            />
          );
        })}
      </div>
    </div>
  );
}
