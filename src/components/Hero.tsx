'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TarotBookPopup from './TarotBookPopup';
import { cn } from '@/lib/utils';
import LightningText from './LightningText';

interface Props {
  onBegin: () => void;
}

export default function Hero({ onBegin }: Props) {
  const [hovered, setHovered] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const fanCards = [
    { label: 'Quá khứ', rotate: -18, x: -112, y: 18, z: 1, scale: 0.92 },
    { label: 'Hiện tại', rotate: 0, x: 0, y: hovered ? -18 : -6, z: 3, scale: hovered ? 1.09 : 1 },
    { label: 'Tương lai', rotate: 18, x: 112, y: 18, z: 1, scale: 0.92 },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-5 py-8">
      <div className="text-center max-w-3xl">
        {/* Brand emblem */}
        <div className="mb-6 opacity-80">
          <motion.div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <motion.img
              src="/assets/emblem.svg"
              alt="Mystery Tarot"
              className={cn(
                'w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(232,201,122,.22)]'
              )}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </div>

        {/* Title */}
        <LightningText
          text="Mystery Tarot"
          className="mb-1 h-[120px] max-w-[760px] mx-auto"
        />
        <p className="text-[var(--parchment-300)] text-lg mb-10 italic">
          Bí ẩn nằm trong những lá bài — hãy để vũ trụ lên tiếng
        </p>

        {/* Fan Cards */}
        <div
          className="relative w-[360px] h-[290px] mx-auto mb-4 cursor-pointer"
          style={{ perspective: 1200 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setBookOpen(true)}
          aria-label="Mở Sách Phép Tarot"
        >
          {fanCards.map((card, idx) => {
            const isCenter = idx === 1;
            return (
              <div
                key={card.label}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 18,
                  width: 122,
                  height: 202,
                  marginLeft: -61,
                  transformOrigin: '50% 70%',
                  transform: hovered
                    ? `translateX(${card.x}px) translateY(${card.y}px) rotate(${card.rotate}deg) scale(${card.scale})`
                    : `translateX(0px) translateY(${idx * 8}px) rotate(0deg) scale(${1 - idx * 0.05})`,
                  zIndex: isCenter ? 30 : (10 - idx),
                  transitionProperty: 'transform, box-shadow, filter, top',
                  transitionDuration: hovered ? '0.62s' : '0.5s',
                  transitionTimingFunction: 'cubic-bezier(.16, 1, .3, 1)',
                  willChange: 'transform, box-shadow, filter',
                  borderRadius: 20,
                  background: isCenter
                    ? 'linear-gradient(180deg, rgba(47,25,80,0.98), rgba(14,7,28,0.98))'
                    : 'linear-gradient(180deg, rgba(30,14,54,0.95), rgba(10,5,20,0.95))',
                  border: isCenter ? '1px solid rgba(255,224,150,0.38)' : '1px solid rgba(232,201,122,0.22)',
                  boxShadow: isCenter && hovered
                    ? '0 24px 56px rgba(0,0,0,.52), 0 0 42px rgba(232,201,122,.18), 0 0 60px rgba(155,127,212,.24)'
                    : '0 14px 32px rgba(0,0,0,.34), 0 0 24px rgba(155,127,212,.16)',
                  filter: isCenter ? 'none' : hovered ? 'brightness(0.88)' : 'brightness(0.96)',
                }}
              >
                {/* Inner decorative borders */}
                <div style={{ position: 'absolute', inset: 7, borderRadius: 14, border: '1px solid rgba(83,48,14,0.5)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 14, borderRadius: 12, border: '1px solid rgba(255,238,197,0.45)', pointerEvents: 'none' }} />
                {/* Card art */}
                <div style={{ position: 'absolute', inset: 18, borderRadius: 10, overflow: 'hidden', background: '#1a102b' }}>
                  <img
                    src="/assets/card-back.svg"
                    alt={card.label}
                    style={{ width: '84%', height: '84%', objectFit: 'contain', opacity: isCenter ? 1 : 0.96, filter: isCenter ? 'drop-shadow(0 0 10px rgba(255,224,150,.2))' : 'none', transform: isCenter && hovered ? 'translateY(-2px)' : 'translateY(0)' }}
                  />
                </div>
                {/* Glow overlay for center card */}
                {isCenter && hovered && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 18,
                    background: 'linear-gradient(180deg, rgba(232,201,122,0.08), rgba(232,201,122,0.04))',
                    border: '1px solid rgba(232,201,122,0.45)',
                    pointerEvents: 'none'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Hint text */}
        <button
          onClick={() => setBookOpen(true)}
          className="text-[var(--gold-400)] text-sm opacity-70 hover:opacity-100 transition-opacity underline underline-offset-4 mb-8 block mx-auto"
        >
          Rê chuột vào lá bài để xòe ra • Click để mở Sách Phép Tarot
        </button>

        {/* CTA */}
        <button
          onClick={onBegin}
          className="px-10 py-3.5 rounded-full text-base font-display tracking-widest uppercase transition-all duration-300 border border-[#e8c97a]/50 text-[var(--gold-300)] hover:bg-[#e8c97a]/10 hover:border-[#e8c97a]/80 hover:text-glow active:scale-95"
        >
          Bắt đầu hành trình
        </button>

        {/* Tarot Book Popup */}
        <TarotBookPopup open={bookOpen} onClose={() => setBookOpen(false)} />
      </div>
    </div>
  );
}
