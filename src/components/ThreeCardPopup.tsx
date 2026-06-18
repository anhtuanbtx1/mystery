'use client';

import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ThreeCardPopup({ open, onClose }: Props) {
  if (!open) return null;
  const cards = [
    { label: 'Quá khứ', rotate: -14, lift: 14 },
    { label: 'Hiện tại', rotate: 0, lift: 0 },
    { label: 'Tương lai', rotate: 14, lift: 14 },
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-[min(860px,94vw)] rounded-[28px] border border-[#e8c97a]/18 bg-[rgba(20,9,32,0.96)] shadow-[0_30px_100px_rgba(0,0,0,0.6)] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-[28px] text-[var(--gold-300)]">Ba Lá Bài</h3>
          <button onClick={onClose} className="text-3xl text-white/60">×</button>
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {cards.map((card) => (
            <div key={card.label} className="w-[170px] h-[270px] rounded-[20px] border border-[#e8c97a]/25 bg-gradient-to-b from-[#2a153d] to-[#120812] flex items-end justify-center pb-4 text-[var(--gold-300)] font-display shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              {card.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
