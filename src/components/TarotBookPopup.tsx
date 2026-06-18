'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

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

interface ImageItem {
  id: number | string;
  title: string;
  desc: string;
  url: string;
  span: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

const ImageModal = ({ item, onClose }: { item: ImageItem; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="relative w-full max-w-3xl m-4 overflow-hidden rounded-[28px] border border-[#e8c97a]/20 bg-gradient-to-b from-[#140920]/98 to-[#080410]/98 shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center bg-surface overflow-hidden">
        <img src={item.url} alt={item.title} className="w-full h-full object-contain p-6" />
      </div>
      <div className="p-6 border-t border-[#e8c97a]/15 bg-black/30 backdrop-blur-md">
        <h3 className="text-xl font-display text-[#e8c97a] text-glow">{item.title}</h3>
        <p className="mt-3 text-sm text-[var(--parchment-100)] leading-6 opacity-80">{item.desc}</p>
      </div>
    </motion.div>
    <button onClick={onClose} className="absolute right-4 top-4 text-white/80 hover:text-white" aria-label="Close image view"><X size={32} /></button>
  </motion.div>
);

const InteractiveImageBentoGallery: React.FC<{ imageItems: ImageItem[]; title: string; description: string; }> = ({ imageItems, title, description }) => {
  const [selectedItem, setSelectedItem] = useState<ImageItem | null>(null);
  const [dragConstraint, setDragConstraint] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateConstraints = () => {
      if (gridRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const gridWidth = gridRef.current.scrollWidth;
        setDragConstraint(Math.min(0, containerWidth - gridWidth - 32));
      }
    };
    calculateConstraints();
    window.addEventListener('resize', calculateConstraints);
    return () => window.removeEventListener('resize', calculateConstraints);
  }, [imageItems]);

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [30, 0]);

  return (
    <section ref={targetRef} className="relative w-full overflow-hidden py-2">
      <motion.div style={{ opacity, y }} className="px-1 text-center">
        <h2 className="text-2xl font-display tracking-tight text-[#e8c97a] sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/65 sm:text-base">{description}</p>
      </motion.div>

      <div ref={containerRef} className="relative mt-8 w-full cursor-grab active:cursor-grabbing">
        <motion.div className="w-max" drag="x" dragConstraints={{ left: dragConstraint, right: 0 }} dragElastic={0.05}>
          <motion.div ref={gridRef} className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-6 px-1 md:px-2" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {imageItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants} className={cn('group relative flex h-full min-h-[19rem] w-full min-w-[15rem] cursor-pointer items-end overflow-hidden rounded-[22px] border border-white/10 bg-black/40 p-4 shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg', item.span)} whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} onClick={() => setSelectedItem(item)} onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(item)} tabIndex={0} aria-label={'View ' + item.title}>
                <img src={item.url} alt={item.title} className="absolute inset-0 h-full w-full object-cover saturate-[1.05] transition-transform duration-500 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080410]/95 via-[#140920]/40 to-transparent opacity-100" />
                <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-lg font-semibold text-white font-display text-[#e8c97a]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--parchment-100)] line-clamp-3 opacity-90">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>{selectedItem && <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />}</AnimatePresence>
    </section>
  );
};

export default function TarotBookPopup({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Bộ Ẩn');
  const [data, setData] = useState<TarotData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/tarot/cards').then(res => res.json()).then(val => { setData(val); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [open]);

  if (!open) return null;

  const majorArcanaItems: ImageItem[] = data?.majorArcana.map((card, index) => ({
    id: card.id,
    title: `${card.numeral ? `${card.numeral} • ` : ''}${card.name}`,
    desc: card.meaning || 'Thông điệp huyền học đang chờ được khai mở.',
    url: card.image || '/assets/card-back.svg',
    span: index % 5 === 0 ? 'md:min-w-[19rem]' : index % 3 === 0 ? 'md:min-w-[17rem]' : 'md:min-w-[15rem]',
  })) || [];

  const makeMinorItems = (names: string[], accent: 'wands' | 'cups'): ImageItem[] => names.map((name, index) => ({
    id: `${accent}-${index}`,
    title: name,
    desc: accent === 'wands' ? 'Năng lượng lửa, tham vọng, hành động và khởi phát nội tâm.' : 'Năng lượng nước, cảm xúc, trực giác và sự kết nối tâm hồn.',
    url: '/assets/card-back.svg',
    span: index % 4 === 0 ? 'md:min-w-[17rem]' : 'md:min-w-[15rem]',
  }));

  const wandsItems = data ? makeMinorItems(data.wands, 'wands') : [];
  const cupsItems = data ? makeMinorItems(data.cups, 'cups') : [];

  const renderActiveContent = () => {
    if (loading) return <div className="h-full flex items-center justify-center italic opacity-40">Đang khai mở thư viện...</div>;
    if (!data) return <div className="h-full flex items-center justify-center text-white/40 italic">Không thể tải dữ liệu Tarot.</div>;
    if (activeTab === 'Bộ Ẩn') return <InteractiveImageBentoGallery imageItems={majorArcanaItems} title="Bộ Ẩn Chính" description="Kéo ngang để khám phá từng lá bài và nhấn vào ảnh để mở xem chi tiết." />;
    if (activeTab === 'Cộng Hưởng') return <InteractiveImageBentoGallery imageItems={wandsItems} title="Bộ Gậy (Wands)" description="Kéo ngang để khám phá Bộ Gậy. Nhấn vào ảnh để xem chi tiết." />;
    return <InteractiveImageBentoGallery imageItems={cupsItems} title="Bộ Cốc (Cups)" description="Kéo ngang để khám phá Bộ Cốc. Nhấn vào ảnh để xem chi tiết." />;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[4px] flex items-center justify-center p-5 animate-in fade-in duration-300">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[1200px] h-full max-h-[900px] rounded-[26px] bg-gradient-to-b from-[#140920]/98 to-[#080410]/98 border border-[#e8c97a]/20 shadow-[0_40px_120px_rgba(0,0,0,0.65),0_0_80px_rgba(155,127,212,0.12)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#e8c97a]/15">
          <div className="flex items-center gap-3"><div className="text-[28px] tracking-[0.06em] text-[#e8c97a] font-display uppercase text-glow">Quyền Năng</div><div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40"><div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /></div></div>
          <div className="flex items-center gap-3">{['Bộ Ẩn', 'Cộng Hưởng', 'Luận Giải'].map((t) => (<button key={t} onClick={() => setActiveTab(t)} className={'px-4 py-2 rounded-full text-sm transition-all border ' + (activeTab === t ? 'border-[#e8c97a]/45 bg-[#e8c97a]/15 text-[#e8c97a]' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10')}>{t}</button>))}<button onClick={onClose} className="ml-2 text-3xl text-white/60 hover:text-white transition-colors">×</button></div>
        </div>
        <div className="flex-1 overflow-y-auto p-7 pb-10 custom-scrollbar">{renderActiveContent()}</div>
      </div>
    </div>
  );
}
