'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  atletico: TarotCard[];
  inter: TarotCard[];
  acmilan: TarotCard[];
  juventus: TarotCard[];
  bayern: TarotCard[];
  dortmund: TarotCard[];
  astonvilla: TarotCard[];
  valencia: TarotCard[];
  fulham: TarotCard[];
  everton: TarotCard[];
  southampton: TarotCard[];
  sunderland: TarotCard[];
  wolverhampton: TarotCard[];
  brentford: TarotCard[];
  qpr: TarotCard[];
  napoli: TarotCard[];
  sevilla: TarotCard[];
  lazio: TarotCard[];
  benfica: TarotCard[];
  westham: TarotCard[];
  stokecity: TarotCard[];
  roma: TarotCard[];
  psg: TarotCard[];
  wands: Array<string | TarotCard>;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SelectedCardPreview {
  coreName: string;
  cards: TarotCard[];
}

interface ClubConfig {
  key: keyof TarotData;
  name: string;
  badge: string;
  accent?: 'gold' | 'blue';
}

interface LeagueConfig {
  league: string;
  clubs: ClubConfig[];
}

const LEAGUES: LeagueConfig[] = [
  {
    league: 'Ngoại Hạng Anh',
    clubs: [
      { key: 'manu', name: 'Manchester United', badge: 'Quỷ đỏ' },
      { key: 'arsenal', name: 'Arsenal', badge: 'Pháo thủ' },
      { key: 'liverpool', name: 'Liverpool', badge: 'Lữ đoàn đỏ' },
      { key: 'chelsea', name: 'Chelsea', badge: 'The Blues' },
      { key: 'mancity', name: 'Manchester City', badge: 'The Citizens' },
      { key: 'tottenham', name: 'Tottenham', badge: 'Spurs' },
      { key: 'newcastle', name: 'Newcastle', badge: 'Chích chòe' },
      { key: 'astonvilla', name: 'Aston Villa', badge: 'The Villans' },
      { key: 'fulham', name: 'Fulham', badge: 'The Cottagers' },
      { key: 'everton', name: 'Everton', badge: 'The Toffees' },
      { key: 'southampton', name: 'Southampton', badge: 'The Saints' },
      { key: 'sunderland', name: 'Sunderland', badge: 'The Black Cats' },
      { key: 'wolverhampton', name: 'Wolverhampton', badge: 'Wolves' },
      { key: 'brentford', name: 'Brentford', badge: 'The Bees' },
      { key: 'qpr', name: 'QPR', badge: 'The Hoops' },
      { key: 'westham', name: 'West Ham', badge: 'The Hammers' },
      { key: 'stokecity', name: 'Stoke City', badge: 'The Potters' },
      { key: 'wands', name: 'Ngoại Hạng Anh (Khác)', badge: 'Nguyên tố Lửa' },
    ],
  },
  {
    league: 'La Liga',
    clubs: [
      { key: 'barcelona', name: 'Barcelona', badge: 'Blaugrana' },
      { key: 'realmadrid', name: 'Real Madrid', badge: 'Los Blancos' },
      { key: 'atletico', name: 'Atletico Madrid', badge: 'Los Colchoneros' },
      { key: 'valencia', name: 'Valencia', badge: 'Los Che' },
      { key: 'sevilla', name: 'Sevilla', badge: 'Los Nervionenses' },
    ],
  },
  {
    league: 'Serie A',
    clubs: [
      { key: 'inter', name: 'Inter Milan', badge: 'Nerazzurri' },
      { key: 'acmilan', name: 'AC Milan', badge: 'Rossoneri' },
      { key: 'juventus', name: 'Juventus', badge: 'Bianconeri' },
      { key: 'roma', name: 'AS Roma', badge: 'I Giallorossi' },
      { key: 'napoli', name: 'Napoli', badge: 'Partenopei' },
      { key: 'lazio', name: 'Lazio', badge: 'I Biancocelesti' },
    ],
  },
  {
    league: 'Bundesliga',
    clubs: [
      { key: 'bayern', name: 'Bayern Munich', badge: 'Die Roten' },
      { key: 'dortmund', name: 'Borussia Dortmund', badge: 'Die Borussen' },
    ],
  },
  {
    league: 'Ligue 1',
    clubs: [
      { key: 'psg', name: 'Paris Saint-Germain', badge: 'Les Parisiens' },
    ],
  },
  {
    league: 'Giải Khác',
    clubs: [
      { key: 'benfica', name: 'Benfica', badge: 'As Águias' },
    ],
  },
];

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export default function TarotBookPopup({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
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

  const getCoreName = (name: string) => name.split(' (')[0].trim();

  // Helper to group cards by their core name to avoid duplicates
  const groupCards = (cardArray: TarotCard[] | Array<string | TarotCard>, query: string = '') => {
    if (!cardArray) return [];

    const cards = cardArray.filter(c => typeof c !== 'string') as TarotCard[];
    const normQuery = normalizeText(query);

    // Filter by search query if present
    const filteredCards = normQuery
      ? cards.filter(c => {
          const normName = normalizeText(c.name);
          const normCore = normalizeText(getCoreName(c.name));
          return normName.includes(normQuery) || normCore.includes(normQuery);
        })
      : cards;

    const grouped = new Map<string, TarotCard[]>();

    filteredCards.forEach(card => {
      const coreName = getCoreName(card.name);
      if (!grouped.has(coreName)) {
        grouped.set(coreName, []);
      }
      grouped.get(coreName)!.push(card);
    });

    return Array.from(grouped.entries()).map(([coreName, group]) => ({
      coreName,
      cards: group,
    }));
  };

  const handleCardClick = (coreName: string, cards: TarotCard[]) => {
    if (cards[0]?.image) {
      setSelectedCardPreview({
        coreName,
        cards: cards.filter(c => c.image),
      });
    }
  };

  // Compute filtered leagues and sections based on active tab and search query
  const displayedSections = useMemo(() => {
    if (!data) return [];

    const targetLeagues = activeTab === 'Tất cả'
      ? LEAGUES
      : LEAGUES.filter(l => l.league === activeTab);

    const sections: Array<{
      league: string;
      clubName: string;
      badge: string;
      accent: 'gold' | 'blue';
      groups: Array<{ coreName: string; cards: TarotCard[] }>;
    }> = [];

    targetLeagues.forEach(l => {
      l.clubs.forEach(c => {
        const rawClubCards = data[c.key];
        if (rawClubCards) {
          const groups = groupCards(rawClubCards, searchQuery);
          if (groups.length > 0) {
            sections.push({
              league: l.league,
              clubName: c.name,
              badge: c.badge,
              accent: c.accent || 'gold',
              groups,
            });
          }
        }
      });
    });

    return sections;
  }, [data, activeTab, searchQuery]);

  const totalMatchingCards = useMemo(() => {
    return displayedSections.reduce((acc, sec) => acc + sec.groups.length, 0);
  }, [displayedSections]);

  if (!open) return null;

  const renderCardGroupTile = (group: { coreName: string; cards: TarotCard[] }, idx: number, accent: 'gold' | 'blue' = 'gold') => {
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
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      >
        <motion.div className={`
          relative w-[125px] h-[125px] sm:w-[200px] sm:h-[200px] mx-auto overflow-hidden flex items-center justify-center border rounded-[14px] sm:rounded-[18px]
          ${isGold
            ? 'bg-gradient-to-b from-[#123824]/95 to-[#06180f]/95 border-[#e8c97a]/30 shadow-[0_10px_26px_rgba(0,0,0,0.34),0_0_18px_rgba(232,201,122,0.14)]'
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

  const allTabs = ['Tất cả', 'Ngoại Hạng Anh', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Giải Khác'];

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(1400px,96vw)] h-full max-h-[900px] rounded-[26px] bg-gradient-to-b from-[#0a2318]/98 to-[#03100a]/98 border border-[#e8c97a]/25 shadow-[0_40px_120px_rgba(0,0,0,0.75),0_0_80px_rgba(0,230,150,0.12)] overflow-hidden flex flex-col relative"
      >
        {selectedCardPreview && (
          <div
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            onClick={() => setSelectedCardPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-[min(1350px,98vw)] max-h-[94vh] rounded-[28px] border border-[#e8c97a]/35 bg-gradient-to-b from-[#0d2e20]/98 to-[#04140d]/98 shadow-[0_30px_120px_rgba(0,0,0,0.85),0_0_80px_rgba(232,201,122,0.18)] p-5 sm:p-8 flex flex-col items-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCardPreview(null)}
                className="absolute right-4 top-4 z-30 rounded-full bg-black/60 border border-white/20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-2xl text-white/70 transition-all hover:text-white hover:bg-black/80 hover:scale-105 active:scale-95"
                aria-label="Đóng xem trước hình"
              >
                ✕
              </button>

              {/* Header Title */}
              <div className="text-2xl sm:text-4xl font-display text-[var(--gold-300)] text-glow mb-4 sm:mb-6 mt-1 text-center tracking-wider uppercase font-bold">
                {selectedCardPreview.coreName}
              </div>

              {/* Cards Container */}
              <div className="w-full flex-1 flex justify-center items-center gap-6 sm:gap-10 overflow-x-auto overflow-y-auto p-2 sm:p-4 custom-scrollbar">
                {selectedCardPreview.cards.map((c, i) => {
                  const singleCard = selectedCardPreview.cards.length === 1;
                  return (
                    <motion.div
                      key={c.id || i}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex flex-col items-center shrink-0 ${
                        singleCard
                          ? 'w-[min(380px,85vw)] sm:w-[min(480px,85vw)] md:w-[min(540px,80vw)]'
                          : 'w-[min(280px,75vw)] sm:w-[min(360px,75vw)] md:w-[min(420px,70vw)]'
                      }`}
                    >
                      <div className="relative w-full rounded-[20px] sm:rounded-[26px] border-2 border-[#e8c97a]/40 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(232,201,122,0.15)] flex items-center justify-center overflow-hidden group bg-[#061810]">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-full max-h-[68vh] object-contain block transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] max-h-[68vh] bg-[#071d13] flex items-center justify-center text-white/40 italic text-lg">
                            Không có ảnh
                          </div>
                        )}
                      </div>
                      <div className="mt-4 sm:mt-5 text-center w-full">
                        <div className="text-lg sm:text-2xl font-display text-[var(--gold-200)] font-semibold tracking-wide">
                          {c.name}
                        </div>
                        {c.meaning && (
                          <p className="mt-2 text-xs sm:text-base text-[var(--parchment-200)] italic leading-relaxed max-w-md mx-auto">
                            "{c.meaning}"
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#e8c97a]/15 flex flex-col gap-3">
          {/* Row 1: Title, Search Bar & Close Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-lg sm:text-2xl tracking-[0.06em] text-[var(--gold-400)] font-display uppercase text-glow font-bold">
                Bộ sưu tập
              </div>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1 max-w-md mx-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm cầu thủ theo tên..."
                className="w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm bg-[#04140d]/90 border border-[#e8c97a]/30 text-[var(--parchment-100)] placeholder:text-white/40 focus:outline-none focus:border-[#e8c97a]/80 focus:ring-1 focus:ring-[#e8c97a]/40 transition-all shadow-inner"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e8c97a]/70 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-[11px] w-4 h-4 rounded-full bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-2xl sm:text-3xl text-white/60 hover:text-white transition-colors shrink-0 leading-none"
              aria-label="Đóng cửa sổ"
            >
              ×
            </button>
          </div>

          {/* Row 2: League Tabs & Search Result Indicator */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto custom-scrollbar py-0.5">
              {allTabs.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs transition-all border ${
                    activeTab === t
                      ? 'border-[#e8c97a]/60 bg-[#e8c97a]/20 text-[var(--gold-300)] font-medium shadow-[0_0_12px_rgba(232,201,122,0.15)]'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {searchQuery && (
              <div className="text-xs text-[var(--gold-300)] flex items-center gap-1.5 bg-[#e8c97a]/10 px-3 py-1 rounded-full border border-[#e8c97a]/20">
                <span>Kết quả:</span>
                <span className="font-bold text-white">{totalMatchingCards}</span>
                <span>cầu thủ</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 pb-10 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 italic text-white/40">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--gold-400)] border-t-transparent animate-spin" />
              <span>Đang khai mở thư viện...</span>
            </div>
          ) : displayedSections.length > 0 ? (
            <div className="space-y-12">
              {displayedSections.map((sec) => (
                <section key={`${sec.league}-${sec.clubName}`}>
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl sm:text-2xl font-display text-[var(--gold-300)] font-semibold">
                        {sec.clubName}
                      </h3>
                      {activeTab === 'Tất cả' && (
                        <span className="hidden sm:inline-block text-[11px] text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                          {sec.league}
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#e8c97a]/10 border border-[#e8c97a]/20 text-[10px] uppercase text-white/60 tracking-wider">
                      {sec.badge}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    {sec.groups.map((g, i) => renderCardGroupTile(g, i, sec.accent))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 text-[var(--gold-400)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-[var(--parchment-200)] text-base font-display">
                {searchQuery ? `Không tìm thấy cầu thủ phù hợp với "${searchQuery}"` : `Chưa có dữ liệu cho ${activeTab}`}
              </p>
              {searchQuery ? (
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Hãy thử tìm kiếm với tên không dấu hoặc chuyển sang tab <button onClick={() => setActiveTab('Tất cả')} className="text-[var(--gold-300)] underline">Tất cả</button>
                </p>
              ) : null}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-1.5 rounded-full text-xs border border-[#e8c97a]/30 text-[var(--gold-300)] hover:bg-[#e8c97a]/10 transition-colors"
                >
                  Xóa từ khóa
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
