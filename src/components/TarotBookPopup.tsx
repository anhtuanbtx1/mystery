'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

interface TarotCard {
  id: string;
  name: string;
  numeral?: string;
  image?: string;
  meaning?: string;
}

interface TarotData {
  majorArcana: TarotCard[];
  wands: string[];
  cups: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TarotBookPopup({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Bộ Ẩn');
  const [data, setData] = useState<TarotData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/tarot/cards')
        .then(res => res.json())
        .then(val => {
          setData(val);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open]);

  if (!open) return null;

  const cardVariants: Variants = {
    initial: { rotate: 0, y: 0, scale: 1 },
    hover: { y: -10, scale: 1.04, transition: { type: 'spring', stiffness: 220, damping: 16 } }
  };

  const imageVariants: any = {
    left: { initial: { rotate: 0, x: 0, y: 0 }, hover: { rotate: -8, x: -18, y: 6, transition: { type: 'spring' as const, stiffness: 200, damping: 15 } } },
    middle: { initial: { rotate: 0, x: 0, y: 0 }, hover: { rotate: 0, x: 0, y: -10, transition: { type: 'spring' as const, stiffness: 200, damping: 15 } } },
    right: { initial: { rotate: 0, x: 0, y: 0 }, hover: { rotate: 8, x: 18, y: 8, transition: { type: 'spring' as const, stiffness: 200, damping: 15 } } },
  };

  const renderCardTile = (name: string, idx: number, image?: string, numeral?: string, accent: 'gold' | 'blue' = 'gold') => {
    const isGold = accent === 'gold';
    return (
      <motion.div
        key={name}
        className="w-[116px] text-center"
        initial="initial"
        whileHover="hover"
        variants={cardVariants}
      >
        <motion.div className={`
          relative w-[116px] h-[194px] mx-auto rounded-[18px] overflow-hidden flex items-center justify-center border
          ${isGold 
            ? 'bg-gradient-to-b from-[#3a1e0e]/95 to-[#160b05]/95 border-[#e8c97a]/30 shadow-[0_10px_26px_rgba(0,0,0,0.34),0_0_18px_rgba(232,201,122,0.14)]' 
            : 'bg-gradient-to-b from-[#11203e]/95 to-[#080d1a]/95 border-[#6eb4ff]/36 shadow-[0_10px_26px_rgba(0,0,0,0.34),0_0_18px_rgba(74,160,255,0.14)]'}
        `}>
          <div className={`absolute inset-[6px] rounded-[14px] border ${isGold ? 'border-[#e8c97a]/20' : 'border-[#78beff]/18'}`} />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="absolute inset-0" initial="initial" whileHover="hover">
            {image ? (
              <motion.img
                src={image}
                loading="lazy"
                decoding="async"
                alt={name}
                variants={idx % 3 === 0 ? imageVariants.left : idx % 3 === 1 ? imageVariants.middle : imageVariants.right}
                className="w-full h-full object-cover saturate-[1.05] contrast-[1.05]"
              />
            ) : (
              <motion.img
                src="/assets/card-back.svg"
                loading="lazy"
                decoding="async"
                alt={name}
                variants={idx % 3 === 0 ? imageVariants.left : idx % 3 === 1 ? imageVariants.middle : imageVariants.right}
                className={`w-[78%] h-[78%] object-contain opacity-95 ${isGold ? 'sepia-[0.45] hue-rotate-[-8deg] saturate-[1.2]' : 'hue-rotate-[190deg] saturate-[1.2]'}`}
              />
            )}
            </motion.div>
          </div>

          {numeral && (
            <motion.div className="absolute left-1/2 bottom-[10px] -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-b from-[#583010]/95 to-[#2a1306]/98 border border-[#ffe096]/50 text-[#f5dfa2] text-[10px] font-display"
              whileHover={{ scale: 1.06 }}
            >
              {numeral}
            </motion.div>
          )}
        </motion.div>
        <div className="mt-2.5 text-[13px] text-[var(--parchment-100)] leading-tight">{name}</div>
        <div className="mt-1 text-[11px] text-white/40">{idx + 1}</div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-5 animate-in fade-in duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1200px] h-full max-h-[900px] rounded-[26px] bg-gradient-to-b from-[#140920]/98 to-[#080410]/98 border border-[#e8c97a]/20 shadow-[0_40px_120px_rgba(0,0,0,0.65),0_0_80px_rgba(155,127,212,0.12)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#e8c97a]/15">
          <div className="flex items-center gap-3">
             <div className="text-[28px] tracking-[0.06em] text-[var(--gold-400)] font-display uppercase text-glow">Quyền Năng</div>
             <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
               <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
             </div>
          </div>
          <div className="flex items-center gap-3">
            {['Bộ Ẩn', 'Cộng Hưởng', 'Luận Giải'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${activeTab === t ? 'border-[#e8c97a]/45 bg-[#e8c97a]/15 text-[var(--gold-300)]' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                {t}
              </button>
            ))}
            <button onClick={onClose} className="ml-2 text-3xl text-white/60 hover:text-white transition-colors">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-7 pb-10 custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center italic opacity-40">Đang khai mở thư viện...</div>
          ) : data && activeTab === 'Bộ Ẩn' ? (
             <div className="space-y-12">
               {/* Major Arcana */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Bộ Ẩn Chính</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Hành trình linh hồn</span>
                 </div>
                 <div className="flex flex-wrap gap-4">
                   {data.majorArcana.map((c, i) => renderCardTile(c.name, i, c.image, c.numeral, 'gold'))}
                 </div>
               </section>

               {/* Wands */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Bộ Gậy (Wands)</h3>
                   <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase text-orange-400/70 tracking-wider">Nguyên tố Lửa</span>
                 </div>
                 <div className="flex flex-wrap gap-4">
                   {data.wands.map((name, i) => renderCardTile(name, i, undefined, undefined, 'gold'))}
                 </div>
               </section>

               {/* Cups */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Bộ Cốc (Cups)</h3>
                   <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase text-blue-400/70 tracking-wider">Nguyên tố Nước</span>
                 </div>
                 <div className="flex flex-wrap gap-4">
                   {data.cups.map((name, i) => renderCardTile(name, i, undefined, undefined, 'blue'))}
                 </div>
               </section>
             </div>
          ) : (
             <div className="h-full flex items-center justify-center text-white/40 italic">Nội dung {activeTab} đang được truyền tải...</div>
          )}
        </div>
      </div>
    </div>
  );
}
