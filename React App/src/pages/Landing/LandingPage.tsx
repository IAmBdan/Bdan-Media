import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const sectionUrl = (path: string) => `/${path}`;

// ── PALETTE ───────────────────────────────────────────────────────────────────
// bg:           #080808   near-black
// card:         #0d0d0d   card surface
// border:       #181818   default border
// borderHov:    #4db0f2   accent blue
// textDim:      #6a6a6a   muted label
// textHov:      #ffffff   active/hover text
// accent:       #4db0f2
// accentLight:  #a6d7f8

interface Section {
  id: string;
  name: string;
  path: string;
  parent_id?: string | null;
  hidden?: boolean;
}

interface MediaItem {
  id: string;
  s3_key: string;
  width: number;
  height: number;
  tags: string[] | null;
  type: 'image' | 'video';
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Inter:wght@300;400;500&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card {
    padding: 28px 12px;
    border: 1px solid #181818;
    border-radius: 3px;
    background: #0d0d0d;
    color: #6a6a6a;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    user-select: none;
    will-change: transform;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card:hover {
    border-color: #4db0f2;
    color: #fff;
    background: #0f0f0f;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    color: #a6d7f8;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0;
    margin-bottom: 40px;
    transition: color 0.2s ease;
  }

  .back-btn:hover { color: #fff; }
  .back-btn:hover svg { transform: translateX(-3px); }
  .back-btn svg { transition: transform 0.2s ease; }

  .eyebrow {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.28em;
    color: #4db0f2;
    text-transform: uppercase;
    margin: 0 0 12px;
  }

  .heading {
    font-family: 'Azonix', sans-serif;
    font-size: 2.2rem;
    color: #fff;
    margin: 0;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .divider {
    width: 32px;
    height: 2px;
    background: #4db0f2;
    margin-top: 16px;
  }

  .tile-label {
    font-family: 'Azonix', sans-serif;
    font-size: 1.1rem;
    color: #fff;
    letter-spacing: 0.12em;
    text-shadow: 0 2px 16px rgba(0,0,0,0.8);
  }

  .page-wrap {
    min-height: 100vh;
    background-color: #080808;
    padding: 80px 48px 80px;
    font-family: 'Montserrat', sans-serif;
  }

  @media (max-width: 600px) {
    .page-wrap { padding: 60px 16px 60px; }
  }
`;

// ── layout: best column count with no orphan ──────────────────────────────────
const getColCount = (n: number): number => {
  if (n <= 3) return n;
  if (n === 4) return 2;
  for (let c = 5; c >= 2; c--) {
    if (n % c === 0) return c;
  }
  return 3;
};

// ── media helpers ─────────────────────────────────────────────────────────────
const endsWithMedia = (p: string) => /\/(videos|recaps|multicams)$/i.test(p);
const fallbackPath  = (p: string) => p.replace(/\/(videos|recaps|multicams)$/i, '/photos');

const pickImage = async (
  path: string, wantH: boolean, wantV: boolean, used: Set<string>
): Promise<MediaItem | null> => {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/media/section`,
      { params: { sectionPath: path } }
    );
    let media: MediaItem[] = (data || []).filter((m: MediaItem) => m.type === 'image');
    if (wantH) media = media.filter((m) => m.width >= m.height);
    if (wantV) media = media.filter((m) => m.height > m.width);
    media = media.filter((m) => !used.has(m.s3_key));
    return media.length ? media[Math.floor(Math.random() * media.length)] : null;
  } catch { return null; }
};

const prefetchChildren = async (children: Section[]): Promise<Record<string, MediaItem | null>> => {
  const n = children.length;
  const wantH = n === 2 || n === 4;
  const wantV = n === 3;
  const used = new Set<string>();
  const out: Record<string, MediaItem | null> = {};
  for (const child of children) {
    let img = await pickImage(child.path, wantH, wantV, used);
    if (!img || endsWithMedia(child.path))
      img = await pickImage(fallbackPath(child.path), wantH, wantV, used);
    out[child.id] = img ?? null;
    if (img) used.add(img.s3_key);
  }
  return out;
};

const tileCols = (n: number) => {
  if (n === 2) return { cols: 2 };
  if (n === 3) return { cols: 3 };
  return { cols: 2 };
};

// ── component ─────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [hierarchical, setHierarchical] = useState<Record<string, Section[]>>({});
  const [topLevel, setTopLevel]         = useState<Section[]>([]);
  const [prefetched, setPrefetched]     = useState<Record<string, Record<string, MediaItem | null>>>({});
  const [active, setActive]             = useState<Section | null>(null);
  const [animKey, setAnimKey]           = useState(0);
  const [hoveredId, setHoveredId]       = useState<string | null>(null);
  const [hoveredTileId, setHoveredTileId] = useState<string | null>(null);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/sections`);
        const filtered: Section[] = (data as Section[]).filter((s) => !s.hidden);
        const grouped = filtered.reduce((acc, s) => {
          const k = s.parent_id || '0';
          if (!acc[k]) acc[k] = [];
          acc[k].push(s);
          return acc;
        }, {} as Record<string, Section[]>);

        setHierarchical(grouped);
        setTopLevel(grouped['0'] || []);

        (grouped['0'] || [])
          .filter((s) => grouped[s.id]?.length)
          .forEach(async (parent) => {
            const imgs = await prefetchChildren(grouped[parent.id] || []);
            setPrefetched((prev) => ({ ...prev, [parent.id]: imgs }));
          });
      } catch (e) { console.error(e); }
    })();
  }, []);

  const handleClick = (s: Section) => {
    if (hierarchical[s.id]?.length) {
      setActive(s);
      setAnimKey((k) => k + 1);
    } else {
      navigate(sectionUrl(s.path));
    }
  };

  const goBack = () => { setActive(null); setAnimKey((k) => k + 1); };

  const children    = active ? (hierarchical[active.id] || []) : [];
  const images      = active ? (prefetched[active.id] || {}) : {};
  const imagesReady = active ? !!prefetched[active.id] : false;
  const { cols: tileCo } = tileCols(children.length);

  const colCount  = getColCount(topLevel.length);
  const gap       = 10;
  const cardWidth = `calc((100% - ${(colCount - 1) * gap}px) / ${colCount})`;

  return (
    <>
      <style>{css}</style>
      <div className="page-wrap">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Back */}
          <AnimatePresence>
            {active && (
              <motion.button
                className="back-btn" onClick={goBack}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </motion.button>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            key={`hdr-${animKey}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: '40px' }}
          >
            <p className="eyebrow">{active ? 'Select a category' : 'Select a section'}</p>
            <h1 className="heading">{active ? active.name : 'Work'}</h1>
            <div className="divider" />
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ── Top level: text cards ── */}
            {!active && (
              <motion.div
                key="top"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: `${gap}px`, justifyContent: 'center', overflow: 'visible' }}
              >
                {topLevel.map((s, i) => {
                  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
                  const mobileWidth = `calc(50% - ${gap / 2}px)`;
                  return (
                  <motion.div
                    key={s.id}
                    className="card"
                    style={{ width: isMobile ? mobileWidth : cardWidth, position: 'relative', zIndex: hoveredId === s.id ? 10 : 1 }}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(77,176,242,0.15), 0 10px 24px rgba(77,176,242,0.12)' }}
                    whileTap={{ scale: 0.97 }}
                    onHoverStart={() => setHoveredId(s.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    onClick={() => handleClick(s)}
                  >
                    {s.name}
                  </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ── Second level: image tiles ── */}
            {active && imagesReady && (
              <motion.div
                key={`tiles-${active.id}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${tileCo}, 1fr)`, gap: '6px', width: '100%' }}
              >
                {children.map((child, i) => {
                  const img = images[child.id];
                  return (
                    <motion.div
                      key={child.id}
                      style={{ position: 'relative', overflow: 'hidden', borderRadius: '3px', aspectRatio: tileCo === 3 ? '2/3' : '16/9', zIndex: hoveredTileId === child.id ? 10 : 1 }}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.06 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(77,176,242,0.15), 0 10px 24px rgba(77,176,242,0.12)' }}
                      whileTap={{ scale: 0.97 }}
                      onHoverStart={() => setHoveredTileId(child.id)}
                      onHoverEnd={() => setHoveredTileId(null)}
                    >
                      <Link to={sectionUrl(child.path)} style={{ display: 'block', width: '100%', height: '100%' }}>
                        {img ? (
                          <motion.img
                            src={`https://${process.env.REACT_APP_S3_BUCKET}/${img.s3_key}`}
                            alt={child.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.7)' }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#222', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>No image</span>
                          </div>
                        )}

                        <motion.div
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)', zIndex: 10, pointerEvents: 'none' }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                        />

                        <motion.div
                          className="tile-label"
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, padding: '16px 20px', textAlign: 'left' }}
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                        >
                          {child.name.toUpperCase()}
                        </motion.div>

                        <motion.div
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#4db0f2', zIndex: 30, scaleX: 0, originX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {active && !imagesReady && (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ color: '#4db0f2', fontFamily: 'Montserrat', fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}
              >
                Loading...
              </motion.p>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default LandingPage;