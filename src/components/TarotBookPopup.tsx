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
  manu: TarotCard[];
  arsenal: TarotCard[];
  liverpool: TarotCard[];
  chelsea: TarotCard[];
  mancity: TarotCard[];
  tottenham: TarotCard[];
  newcastle: TarotCard[];
  barcelona: TarotCard[];
  realmadrid: TarotCard[];
  inter: TarotCard[];
  acmilan: TarotCard[];
  juventus: TarotCard[];
  bayern: TarotCard[];
  dortmund: TarotCard[];
  astonvilla: TarotCard[];
  valencia: TarotCard[];
  wands: Array<string | TarotCard>;
  cups: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SelectedCardPreview {
  coreName: string;
  cards: TarotCard[];
}

export default function TarotBookPopup({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Ngoại Hạng Anh');
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


  const getCoreName = (name: string) => name.split(' (')[0].trim();

  // Helper to group cards by their core name to avoid duplicates
  const groupCards = (cardArray: TarotCard[] | Array<string | TarotCard>) => {
    if (!cardArray) return [];

    // Type guard and grouping
    const cards = cardArray.filter(c => typeof c !== 'string') as TarotCard[];
    const grouped = new Map<string, TarotCard[]>();

    cards.forEach(card => {
      const coreName = getCoreName(card.name);
      if (!grouped.has(coreName)) {
        grouped.set(coreName, []);
      }
      grouped.get(coreName)!.push(card);
    });

    return Array.from(grouped.entries()).map(([coreName, group]) => ({
      coreName,
      cards: group
    }));
  };

  const handleCardClick = (coreName: string, cards: TarotCard[]) => {
    // Only open preview if there's an image
    if (cards[0]?.image) {
      setSelectedCardPreview({
        coreName,
        cards: cards.filter(c => c.image) // Filter out cards without images just in case
      });
    }
  };

  const renderCardGroupTile = (group: { coreName: string, cards: TarotCard[] }, idx: number, accent: 'gold' | 'blue' = 'gold') => {
    const isGold = accent === 'gold';
    const firstCard = group.cards[0];
    const image = firstCard?.image;
    const numeral = firstCard?.numeral;
    const name = group.coreName;

    return (
      <motion.div
        key={name}
        className="w-[125px] sm:w-[200px] text-center"
        initial="initial"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <motion.div className={`
          relative w-[125px] h-[125px] sm:w-[200px] sm:h-[200px] mx-auto overflow-hidden flex items-center justify-center border rounded-[14px] sm:rounded-[18px]
          ${isGold
            ? 'bg-gradient-to-b from-[#3a1e0e]/95 to-[#160b05]/95 border-[#e8c97a]/30 shadow-[0_10px_26px_rgba(0,0,0,0.34),0_0_18px_rgba(232,201,122,0.14)]'
            : 'bg-gradient-to-b from-[#11203e]/95 to-[#080d1a]/95 border-[#6eb4ff]/36 shadow-[0_10px_26px_rgba(0,0,0,0.34),0_0_18px_rgba(74,160,255,0.14)]'}
        `}>
          <div className={`absolute inset-[6px] sm:inset-[8px] rounded-[10px] sm:rounded-[14px] border ${isGold ? 'border-[#e8c97a]/20' : 'border-[#78beff]/18'}`} />

          <button
            type="button"
            onClick={() => handleCardClick(name, group.cards)}
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
          <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedCardPreview(null)}>
            <div className="relative w-[min(1200px,96vw)] max-h-[90vh] rounded-[28px] border border-[#e8c97a]/25 bg-[rgba(18,9,28,0.98)] shadow-[0_30px_100px_rgba(0,0,0,0.75)] p-6 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedCardPreview(null)}
                className="absolute right-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1 text-2xl leading-none text-white/70 transition-colors hover:text-white"
                aria-label="Đóng xem trước hình"
              >
                ×
              </button>

              <div className="text-2xl font-display text-[var(--gold-300)] mb-6 mt-2 text-center">
                {selectedCardPreview.coreName}
              </div>

              {/* Multiple Cards Side by Side */}
              <div className="w-full flex justify-center items-start gap-4 sm:gap-8 overflow-x-auto pb-4 custom-scrollbar">
                {selectedCardPreview.cards.map((c, i) => (
                  <div key={c.id || i} className="flex flex-col items-center shrink-0 w-[160px] sm:w-[240px]">
                    <div className="relative w-full rounded-[16px] sm:rounded-[20px] border border-[#e8c97a]/25 shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-auto block"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-[#0f0818] flex items-center justify-center text-white/40 italic">
                          Không có ảnh
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-center w-full">
                      <div className="text-sm sm:text-base font-display text-[var(--parchment-200)]">
                        {c.name}
                      </div>
                      {c.meaning && (
                        <p className="mt-1 text-[11px] sm:text-xs text-[var(--parchment-400)] italic leading-relaxed px-1">
                          {c.meaning}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3 px-4 sm:px-6 py-4 border-b border-[#e8c97a]/15">
          <div className="flex items-center gap-3">
             <div className="text-xl sm:text-[28px] tracking-[0.06em] text-[var(--gold-400)] font-display uppercase text-glow">Quyền Năng</div>
             <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
               <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 animate-pulse" />
             </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {['Ngoại Hạng Anh', 'La Liga', 'Serie A', 'Bundesliga'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-all border ${activeTab === t ? 'border-[#e8c97a]/45 bg-[#e8c97a]/15 text-[var(--gold-300)]' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                {t}
              </button>
            ))}
            <button onClick={onClose} className="ml-1 text-2xl sm:text-3xl text-white/60 hover:text-white transition-colors">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 pb-10 custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center italic opacity-40">Đang khai mở thư viện...</div>
          ) : data && activeTab === 'Ngoại Hạng Anh' ? (
             <div className="space-y-12">
               {/* Major Arcana */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Manchester United</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Quỷ đỏ</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.manu ? groupCards(data.manu).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Arsenal</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Pháo thủ</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.arsenal ? groupCards(data.arsenal).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Liverpool</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Lữ đoàn đỏ</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.liverpool ? groupCards(data.liverpool).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Chelsea</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">The Blues</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.chelsea ? groupCards(data.chelsea).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Manchester City</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider font-display">The Citizens</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.mancity ? groupCards(data.mancity).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Tottenham</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider font-display">Spurs</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.tottenham ? groupCards(data.tottenham).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Newcastle</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider font-display">Chích chòe</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.newcastle ? groupCards(data.newcastle).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Aston Villa</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider font-display">The Villans</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.astonvilla ? groupCards(data.astonvilla).map((g, i) => renderCardGroupTile(g, i, "gold")) : null}
                 </div>
               </section>


               {/* Wands */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Ngoại Hạng Anh (Khác)</h3>
                   <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase text-orange-400/70 tracking-wider">Nguyên tố Lửa</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.wands ? groupCards(data.wands).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

             </div>
          ) : data && activeTab === 'La Liga' ? (
             <div className="space-y-12">
                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Barcelona</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Blaugrana</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.barcelona ? groupCards(data.barcelona).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Real Madrid</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Los Blancos</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.realmadrid ? groupCards(data.realmadrid).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>
               <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Valencia</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Los Che</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.valencia ? groupCards(data.valencia).map((g, i) => renderCardGroupTile(g, i, "gold")) : null}
                 </div>
               </section>

             </div>
          ) : data && activeTab === 'Serie A' ? (
             <div className="space-y-12">
                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Inter Milan</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Nerazzurri</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.inter ? groupCards(data.inter).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">AC Milan</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Rossoneri</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.acmilan ? groupCards(data.acmilan).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Juventus</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Bianconeri</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.juventus ? groupCards(data.juventus).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>
             </div>
          ) : data && activeTab === 'Bundesliga' ? (
             <div className="space-y-12">
                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Bayern Munich</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Die Roten</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.bayern ? groupCards(data.bayern).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
                 </div>
               </section>

                <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-display text-[var(--gold-300)]">Borussia Dortmund</h3>
                   <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/50 tracking-wider">Die Borussen</span>
                 </div>
                 <div className="flex flex-wrap gap-4 sm:gap-6">
                   {data.dortmund ? groupCards(data.dortmund).map((g, i) => renderCardGroupTile(g, i, 'gold')) : null}
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
