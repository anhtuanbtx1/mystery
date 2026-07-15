'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TarotCard {
  id: string;
  name: string;
  numeral?: string;
  image?: string;
  meaning?: string;
}

interface TarotData {
  majorArcana: TarotCard[];
  wands: Array<string | TarotCard>;
  cups: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SelectedCardPreview {
  name: string;
  image: string;
}

export default function TarotBookPopup({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Bộ Ẩn');
  const [data, setData] = useState<TarotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCardPreview, setSelectedCardPreview] = useState<SelectedCardPreview | null>(null);

  useEffect(() => {
    if (open) {
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


  const renderCardTile = (name: string, idx: number, image?: string, numeral?: string, accent: 'gold' | 'blue' = 'gold') => {
    const isGold = accent === 'gold';

    return (
      <motion.div
        key={name}
        className="w-[200px] text-center"
        initial="initial"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <motion.div className={`
          relative w-[200px] h-[200px] mx-auto overflow-hidden flex items-center justify-center border rounded-[18px]
          ${isGold
            ? 'bg-gradient-to-b from-[#3a1e0e]/95 to-[#160b05]/95 border-[#e8c97a]/30 shadow-[0_10px_26px_rgba(0,0,0,0.34),0_0_18px_rgba(232,201,122,0.14)]'
            : 'bg-gradient-to-b from-[#11203e]/95 to-[#080d1a]/95 border-[#6eb4ff]/36 shadow-[0_10px_26px_rgba(0,0,0,0.34),0_0_18px_rgba(74,160,255,0.14)]'}
        `}>
          <div className={`absolute inset-[8px] rounded-[14px] border ${isGold ? 'border-[#e8c97a]/20' : 'border-[#78beff]/18'}`} />

          <button
            type="button"
            onClick={() => image && setSelectedCardPreview({ name, image })}
            className={`absolute inset-0 flex items-center justify-center ${image ? 'cursor-zoom-in' : 'cursor-default'}`}
            aria-label={image ? `Mở lớn hình ${name}` : name}
            disabled={!image}
          >
            {image ? (
              <img
                src={image}
                loading="lazy"
                decoding="async"
                alt={name}
                className="h-full w-full object-cover object-center saturate-[1.08] contrast-[1.08]"
              />
            ) : (
              <img
                src="/assets/card-back.svg"
                loading="lazy"
                decoding="async"
                alt={name}
                style={{ width: '72%', height: '72%', objectFit: 'contain', display: 'block', margin: 'auto' }}
                className={`opacity-95 ${isGold ? 'sepia-[0.45] hue-rotate-[-8deg] saturate-[1.2]' : 'hue-rotate-[190deg] saturate-[1.2]'}`}
              />
            )}
          </button>

          {numeral && (
            <div className="absolute left-1/2 bottom-[10px] -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-b from-[#583010]/95 to-[#2a1306]/98 border border-[#ffe096]/50 text-[#f5dfa2] text-[10px] font-display">
              {numeral}
            </div>
          )}
        </motion.div>
        <div className="mt-2.5 text-[13px] text-[var(--parchment-100)] leading-tight">{name}</div>
        <div className="mt-1 text-[11px] text-white/40">{idx + 1}</div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-5 animate-in fade-in duration-300" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(1400px,96vw)] h-full max-h-[900px] rounded-[26px] bg-gradient-to-b from-[#140920]/98 to-[#080410]/98 border border-[#e8c97a]/20 shadow-[0_40px_120px_rgba(0,0,0,0.65),0_0_80px_rgba(155,127,212,0.12)] overflow-hidden flex flex-col"
      >
        {selectedCardPreview && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedCardPreview(null)}>
            <div className="relative w-[min(420px,88vw)] rounded-[28px] border border-[#e8c97a]/25 bg-[rgba(18,9,28,0.98)] shadow-[0_30px_100px_rgba(0,0,0,0.75)] p-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedCardPreview(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/35 px-3 py-1 text-2xl leading-none text-white/70 transition-colors hover:text-white"
                aria-label="Đóng xem trước hình"
              >
                ×
              </button>
              <div className="overflow-hidden rounded-[20px] border border-[#e8c97a]/20 bg-[#0f0818] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <img
                  src={selectedCardPreview.image}
                  alt={selectedCardPreview.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="text-xl font-display text-[var(--gold-300)]">{selectedCardPreview.name}</div>
              </div>
            </div>
          </div>
        )}
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
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Ngoại Hạng Anh</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Hành trình linh hồn</span>
                 </div>
                 <div className="flex flex-wrap gap-6">
                   {data.majorArcana.map((c, i) => renderCardTile(c.name, i, c.image, c.numeral, 'gold'))}
                 </div>
               </section>

               {/* Wands */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">La Liga</h3>
                   <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase text-orange-400/70 tracking-wider">Nguyên tố Lửa</span>
                 </div>
                 <div className="flex flex-wrap gap-6">
                   {data.wands.map((card, i) => renderCardTile(typeof card === 'string' ? card : card.name, i, typeof card === 'string' ? undefined : card.image, undefined, 'gold'))}
                 </div>
               </section>

               {/* Cups */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Bộ Cốc (Cups)</h3>
                   <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase text-blue-400/70 tracking-wider">Nguyên tố Nước</span>
                 </div>
                 <div className="flex flex-wrap gap-6">
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
