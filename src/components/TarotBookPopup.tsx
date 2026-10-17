'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown,
  ChevronLeft, ChevronRight, Crown, Globe2, Grid2X2, Grid3X3,
  Layers3, Search, Shield, Sparkles, X,
} from 'lucide-react';
import { clubs, leagues, normalize, countCards, groupCards, type CardGroup, type LeagueId, type TarotData } from './collection-data';
import styles from './TarotBookPopup.module.css';

const formatNumber = (value: number) => value.toLocaleString('vi-VN');
const accentStyle = (color: string) => ({ '--club-accent': color }) as CSSProperties;

function CardArt({ src, alt, sizes, eager = false }: { src?: string; alt: string; sizes: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed || !src ? '/assets/card-back.svg' : src}
      alt={alt} fill sizes={sizes} loading={eager ? 'eager' : 'lazy'}
      className={styles.cardImage} onError={() => setFailed(true)}
    />
  );
}

function CardPreview({ group, onClose }: { group: CardGroup; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const card = group.cards[index];
  const changeCard = (direction: number) => setIndex(value => (value + direction + group.cards.length) % group.cards.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef} className={styles.previewDialog} aria-labelledby="card-preview-title"
      onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }}
      onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          changeCard(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className={styles.previewPanel}>
        <button type="button" className={`${styles.iconButton} ${styles.previewClose}`} onClick={onClose} aria-label="Đóng xem trước hình"><X size={20} /></button>
        <div className={styles.previewStage}>
          <span className={styles.eyebrow}><Sparkles size={13} /> THE PLAYER ARCHIVE</span>
          <div className={styles.previewArt}><CardArt key={card.image ?? index} src={card.image} alt={card.name} sizes="(max-width: 700px) 80vw, 560px" eager /></div>
          <div className={styles.previewControls}>
            <button type="button" className={styles.iconButton} onClick={() => changeCard(-1)} disabled={group.cards.length < 2} aria-label="Phiên bản trước"><ChevronLeft size={19} /></button>
            <span aria-live="polite">{String(index + 1).padStart(2, '0')} <span>/ {String(group.cards.length).padStart(2, '0')}</span></span>
            <button type="button" className={styles.iconButton} onClick={() => changeCard(1)} disabled={group.cards.length < 2} aria-label="Phiên bản tiếp theo"><ChevronRight size={19} /></button>
          </div>
        </div>
        <div className={styles.previewDetails}>
          <span className={styles.clubPill} style={accentStyle(group.club.color)}><Shield size={13} />{group.club.name}</span>
          <h2 id="card-preview-title">{group.name}</h2>
          <p className={styles.previewSubtitle}>Mỗi phiên bản, một dấu ấn.</p>
          <div className={styles.previewDivider} />
          <div className={styles.variantHeading}><span>KHÁM PHÁ PHIÊN BẢN</span><span>{group.cards.length.toString().padStart(2, '0')}</span></div>
          <div className={styles.variants}>
            {group.cards.map((variant, variantIndex) => (
              <button type="button" key={`${variant.name}-${variant.image}-${variantIndex}`} className={`${styles.variant} ${index === variantIndex ? styles.variantActive : ''}`} onClick={() => setIndex(variantIndex)} aria-pressed={index === variantIndex}>
                <span className={styles.variantImage}><CardArt src={variant.image} alt="" sizes="48px" /></span>
                <span><strong>{variant.name}</strong><small>Phiên bản {String(variantIndex + 1).padStart(2, '0')}{variant.numeral ? ` · Số ${variant.numeral}` : ''}</small></span>
                {index === variantIndex ? <Check size={16} /> : <ArrowUpRight size={16} />}
              </button>
            ))}
          </div>
          {card.meaning && <blockquote className={styles.meaning}><Sparkles size={16} /><p>{card.meaning}</p></blockquote>}
          <p className={styles.keyboardHint}>← → Chuyển phiên bản <span>·</span> ESC Đóng</p>
        </div>
      </div>
    </dialog>
  );
}

function CollectionDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<TarotData | null>(null);
  const [error, setError] = useState(false);
  const [requestId, setRequestId] = useState(0);
  const [activeLeague, setActiveLeague] = useState<LeagueId>('all');
  const [activeClub, setActiveClub] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('collection');
  const [compact, setCompact] = useState(false);
  const [preview, setPreview] = useState<CardGroup | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/tarot/cards', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Unable to load collection'); return response.json(); })
      .then((value: TarotData) => {
        if (!value || typeof value !== 'object' || !clubs.some(club => Array.isArray(value[club.id]))) throw new Error('Invalid collection');
        setData(value);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [requestId]);

  const collections = useMemo(() => clubs.map(club => ({ club, groups: data ? groupCards(data, club) : [] })), [data]);
  const totalCards = collections.reduce((sum, collection) => sum + countCards(collection.groups), 0);
  const totalClubs = collections.filter(collection => collection.club.id !== 'wands' && collection.groups.length > 0).length;
  const availableClubs = clubs.filter(club => activeLeague === 'all' || club.league === activeLeague);
  const search = normalize(query);
  const filteredCollections = collections
    .filter(({ club }) => (activeLeague === 'all' || club.league === activeLeague) && (activeClub === 'all' || club.id === activeClub))
    .map(collection => ({
      ...collection,
      groups: collection.groups.filter(group => normalize(`${group.name} ${group.club.name} ${group.club.nickname} ${group.cards.map(card => card.name).join(' ')}`).includes(search))
        .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'vi') : sort === 'variants' ? b.cards.length - a.cards.length : 0),
    }))
    .filter(collection => collection.groups.length > 0);
  const resultCount = filteredCollections.reduce((sum, collection) => sum + countCards(collection.groups), 0);
  const selectedLeague = leagues.find(league => league.id === activeLeague);
  const featured = [
    collections.find(collection => collection.club.id === 'barcelona')?.groups.find(group => normalize(group.name).includes('messi')),
    collections.find(collection => collection.club.id === 'manu')?.groups.find(group => group.name === 'Ronaldo'),
    collections.find(collection => collection.club.id === 'arsenal')?.groups.find(group => group.name === 'Henry'),
  ].filter((group): group is CardGroup => Boolean(group));

  const selectLeague = (league: LeagueId) => {
    setActiveLeague(league);
    setActiveClub('all');
    galleryRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  const clearFilters = () => { setQuery(''); setActiveClub('all'); setActiveLeague('all'); };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="collection-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}><span className={styles.brandIcon}><Sparkles size={21} strokeWidth={1.3} /></span><span>MYSTERY<span className={styles.brandSub}>THE FOOTBALL ARCHIVE</span></span></div>
          <div className={styles.breadcrumb}>Khám phá <ChevronRight size={12} /><span>Bộ sưu tập</span></div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng bộ sưu tập"><span>Đóng</span><kbd>ESC</kbd><X size={18} /></button>
        </header>
        <div className={styles.workspace}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarIntro}><span className={styles.eyebrow}>THƯ VIỆN THẺ BÀI</span><h2>Sân cỏ. Bất diệt.</h2></div>
            <nav className={styles.leagueNav} aria-label="Lọc theo giải đấu">
              <button type="button" className={`${styles.leagueButton} ${activeLeague === 'all' ? styles.leagueActive : ''}`} onClick={() => selectLeague('all')} aria-pressed={activeLeague === 'all'}><Grid2X2 size={17} /><span>Tất cả bộ sưu tập</span><span className={styles.navCount}>{data ? totalCards : '—'}</span></button>
              <span className={styles.navLabel}>GIẢI ĐẤU</span>
              {leagues.map(league => {
                const count = collections.filter(collection => collection.club.league === league.id).reduce((sum, collection) => sum + countCards(collection.groups), 0);
                return (
                  <button type="button" key={league.id} className={`${styles.leagueButton} ${activeLeague === league.id ? styles.leagueActive : ''}`} onClick={() => selectLeague(league.id)} aria-pressed={activeLeague === league.id}>
                    <span className={styles.leagueCode} style={accentStyle(league.color)}>{league.code}</span><span>{league.name}</span><span className={styles.navCount}>{data ? count : '—'}</span>
                  </button>
                );
              })}
            </nav>
            <div className={styles.sidebarNote}>
              <div className={styles.noteOrbit}><Crown size={25} strokeWidth={1} /></div>
              <span>MỘT LÁ BÀI.</span><p>Cả một huyền thoại.</p><div className={styles.noteLine} /><small>Những khoảnh khắc đi qua.<br />Những dấu ấn ở lại.</small>
            </div>
            <div className={styles.sidebarFooter}><span /> Dành cho tình yêu bóng đá</div>
          </aside>

          <div className={styles.mainScroll}>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}><span className={styles.goldLine} /> THE LEGENDS COLLECTION</p>
                <h1 id="collection-title">Bộ sưu tập<br /><em>những huyền thoại.</em></h1>
                <p className={styles.heroDescription}>Những cái tên làm nên lịch sử.{' '}<br />Khám phá câu chuyện phía sau từng lá bài.</p>
                <button type="button" className={styles.exploreButton} onClick={() => galleryRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}>Khám phá bộ sưu tập <ArrowDown size={15} /></button>
              </div>
              <div className={styles.heroVisual}>
                <div className={styles.orbitOne} /><div className={styles.orbitTwo} />
                <span className={styles.orbitSpark}>✦</span><span className={styles.orbitSparkSmall}>✧</span>
                <span className={styles.heroWatermark} aria-hidden="true">LEGENDS</span>
                <div className={styles.featuredFan}>
                  {featured.map(group => <button type="button" key={group.name} className={styles.featuredCard} onClick={() => setPreview(group)} aria-label={`Khám phá ${group.name}`}><CardArt src={group.cards[0].image} alt={group.name} sizes="230px" eager /></button>)}
                  {!data && <div className={styles.heroPlaceholder}><Crown size={58} strokeWidth={0.8} /></div>}
                </div>
                <span className={styles.heroCaption}><span /> THE GAME ENDS. THE LEGACY LIVES.</span>
              </div>
            </section>
            <div className={styles.stats}>
              <div><Layers3 size={18} strokeWidth={1.4} /><strong>{data ? formatNumber(totalCards) : '—'}</strong><span>Lá bài</span></div><span className={styles.statDivider} />
              <div><Shield size={18} strokeWidth={1.4} /><strong>{data ? totalClubs : '—'}</strong><span>Câu lạc bộ</span></div><span className={styles.statDivider} />
              <div><Globe2 size={18} strokeWidth={1.4} /><strong>{leagues.length.toString().padStart(2, '0')}</strong><span>Nhóm giải</span></div>
              <p><Sparkles size={13} /> Tinh hoa bóng đá, trong từng lá bài</p>
            </div>

            <div className={styles.gallery} ref={galleryRef}>
              <div className={styles.galleryHeading}>
                <div><span className={styles.eyebrow}>KHÁM PHÁ DI SẢN</span><h2>{selectedLeague?.name ?? 'Tất cả bộ sưu tập'}<span aria-live="polite">{data ? `${formatNumber(resultCount)} lá bài` : 'Đang tải'}</span></h2></div>
                <div className={styles.viewToggle} aria-label="Kích thước thẻ"><button type="button" onClick={() => setCompact(false)} aria-label="Thẻ lớn" aria-pressed={!compact}><Grid2X2 size={17} /></button><button type="button" onClick={() => setCompact(true)} aria-label="Thẻ nhỏ" aria-pressed={compact}><Grid3X3 size={17} /></button></div>
              </div>
              <div className={styles.toolbar}>
                <label className={styles.searchField}><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm cầu thủ, câu lạc bộ..." aria-label="Tìm cầu thủ, câu lạc bộ" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm"><X size={15} /></button>}</label>
                <label className={styles.selectField}><Shield size={15} /><select aria-label="Lọc câu lạc bộ" value={activeClub} onChange={event => setActiveClub(event.target.value)}><option value="all">Tất cả câu lạc bộ</option>{availableClubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}</select><ChevronDown size={14} /></label>
                <label className={`${styles.selectField} ${styles.sortField}`}><select aria-label="Sắp xếp thẻ" value={sort} onChange={event => setSort(event.target.value)}><option value="collection">Thứ tự bộ sưu tập</option><option value="name">Tên cầu thủ A–Z</option><option value="variants">Nhiều phiên bản nhất</option></select><ChevronDown size={14} /></label>
              </div>

              {error ? (
                <div className={styles.emptyState} role="alert"><Layers3 size={34} strokeWidth={1} /><h3>Chưa thể mở bộ sưu tập</h3><p>Kết nối đang gián đoạn. Hãy thử tải lại những lá bài.</p><button type="button" onClick={() => { setError(false); setRequestId(value => value + 1); }}>Thử lại <ArrowRight size={15} /></button></div>
              ) : !data ? (
                <div className={styles.loadingState} role="status"><span className={styles.eyebrow}>Đang mở kho lưu trữ huyền thoại...</span><div className={styles.cardGrid}>{Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeleton} />)}</div></div>
              ) : filteredCollections.length === 0 ? (
                <div className={styles.emptyState}><Search size={34} strokeWidth={1} /><h3>Chưa tìm thấy lá bài phù hợp</h3><p>Thử một tên cầu thủ khác hoặc mở rộng bộ lọc của bạn.</p><button type="button" onClick={clearFilters}>Xóa bộ lọc <ArrowRight size={15} /></button></div>
              ) : (
                <div className={styles.collections}>
                  {filteredCollections.map(({ club, groups }, collectionIndex) => (
                    <section key={club.id} aria-label={club.name} style={accentStyle(club.color)}>
                      <div className={styles.clubHeading}><span className={styles.clubMonogram}>{club.initials}</span><div><h3>{club.name}</h3><p>{club.nickname}</p></div><span className={styles.clubHeadingLine} /><span className={styles.clubTotal}>{groups.length} cầu thủ</span><span className={styles.sectionIndex}>{String(collectionIndex + 1).padStart(2, '0')}</span></div>
                      <div className={`${styles.cardGrid} ${compact ? styles.compactGrid : ''}`}>
                        {groups.map((group, index) => (
                          <button type="button" key={`${club.id}-${group.name}`} className={styles.playerCard} onClick={() => setPreview(group)} aria-label={`Xem thẻ ${group.name}, ${group.cards.length} phiên bản`} style={{ '--reveal-delay': `${Math.min(index, 7) * 35}ms` } as CSSProperties}>
                            <span className={styles.cardTopline}><span>PLAYER ARCHIVE</span><span>#{String(index + 1).padStart(3, '0')}</span></span>
                            <span className={styles.cardArt}><CardArt src={group.cards[0].image} alt={group.name} sizes={compact ? '(max-width: 600px) 42vw, 170px' : '(max-width: 600px) 42vw, (max-width: 1100px) 27vw, 250px'} /><span className={styles.cardShine} /><span className={styles.cardReveal}><ArrowUpRight size={18} /> Khám phá</span></span>
                            <span className={styles.cardInfo}><span><strong>{group.name}</strong><small>{group.cards.length > 1 ? <><Layers3 size={11} />{group.cards.length} phiên bản</> : 'Thẻ cầu thủ'}</small></span><span className={styles.cardArrow}><ArrowUpRight size={17} /></span></span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
              <footer className={styles.galleryFooter}><span>MYSTERY <span> / </span> THE FOOTBALL ARCHIVE</span><span>Được lưu giữ. Để được nhớ mãi. <Sparkles size={12} /></span></footer>
            </div>
          </div>
        </div>
      </div>
      {preview && <CardPreview group={preview} onClose={() => setPreview(null)} />}
    </dialog>
  );
}

export default function TarotBookPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <CollectionDialog onClose={onClose} /> : null;
}
