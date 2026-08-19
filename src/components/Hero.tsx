'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TarotBookPopup from './TarotBookPopup';
import { cn } from '@/lib/utils';
import LightningText from './LightningText';

interface Props {
  onBegin?: () => void;
}

export default function Hero({ onBegin }: Props) {
  const [hovered, setHovered] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const fanCards = [
    { label: 'Quá khứ', rotate: -18, x: -64, y: 12, z: 1, scale: 0.92 },
    { label: 'Hiện tại', rotate: 0, x: 0, y: hovered ? -12 : -4, z: 3, scale: hovered ? 1.09 : 1 },
    { label: 'Tương lai', rotate: 18, x: 64, y: 12, z: 1, scale: 0.92 },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-5 py-8">
      <div className="text-center w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* Brand emblem */}
        <div className="mb-4 sm:mb-6 opacity-80">
          <motion.div
            className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <motion.img
              src="/assets/emblem.svg"
              alt="Mystery Football"
              className={cn(
                'w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_12px_rgba(232,201,122,.22)]'
              )}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </div>

        {/* Title */}
        <LightningText
          text="World Tour"
          className="mb-4 sm:mb-6 h-[80px] sm:h-[120px] w-full max-w-[820px] mx-auto"
        />

        {/* Fan Cards */}
        <div
          className="relative w-full max-w-[420px] h-[260px] sm:h-[340px] mx-auto mb-6 sm:mb-4 cursor-pointer"
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
                className="absolute left-1/2 top-2 sm:top-[18px] w-[110px] h-[180px] sm:w-[150px] sm:h-[250px] -ml-[55px] sm:-ml-[75px]"
                style={{
                  transformOrigin: '50% 70%',
                  transform: hovered
                    ? `translateX(${card.x}px) translateY(${card.y}px) rotate(${card.rotate}deg) scale(${card.scale})`
                    : 'translateX(0px) translateY(0px) rotate(0deg) scale(1)',
                  zIndex: isCenter ? 30 : (10 - idx),
                  transitionProperty: 'transform, box-shadow, filter, top',
                  transitionDuration: hovered ? '0.3s' : '0.25s',
                  transitionTimingFunction: 'cubic-bezier(.16, 1, .3, 1)',
                  willChange: 'transform, box-shadow, filter',
                  borderRadius: 20,
                  background: isCenter
                    ? 'linear-gradient(180deg, rgba(14,54,36,0.98), rgba(4,20,13,0.98))'
                    : 'linear-gradient(180deg, rgba(8,38,25,0.95), rgba(3,14,9,0.95))',
                  border: isCenter ? '1px solid rgba(255,224,150,0.45)' : '1px solid rgba(232,201,122,0.25)',
                  boxShadow: isCenter && hovered
                    ? '0 24px 54px -24px rgba(0,30,18,.82), 0 0 42px rgba(232,201,122,.24), 0 0 60px rgba(0,230,150,.28)'
                    : '0 14px 30px -18px rgba(0,20,12,.72), 0 0 24px rgba(0,230,150,.18)',
                  filter: isCenter ? 'none' : hovered ? 'brightness(0.88)' : 'brightness(0.96)',
                }}
              >
                {/* Inner decorative borders */}
                <div style={{ position: 'absolute', inset: 7, borderRadius: 14, border: '1px solid rgba(83,48,14,0.5)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 14, borderRadius: 12, border: '1px solid rgba(255,238,197,0.45)', pointerEvents: 'none' }} />
                {/* Card art */}
                <div style={{ position: 'absolute', inset: 10, borderRadius: 14, overflow: 'hidden', background: '#081d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/assets/card-back.svg"
                    alt={card.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isCenter ? 1 : 0.96, filter: isCenter ? 'drop-shadow(0 0 10px rgba(255,224,150,.2))' : 'none', transform: isCenter && hovered ? 'translateY(-2px)' : 'translateY(0)' }}
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

        {/* Tarot Book Popup */}
        <TarotBookPopup open={bookOpen} onClose={() => setBookOpen(false)} />
      </div>
    </div>
  );
}
