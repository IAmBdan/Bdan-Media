import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const sectionUrl = (path: string) => `/${path}`;

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
  type: "image" | "video";
  uploaded_at?: string;
}

const css = `
  .slp-wrap {
    background-color: #080808;
    min-height: 100vh;
    padding: 64px 48px 80px;
    font-family: 'Montserrat', sans-serif;
  }

  .divider { width: 32px; height: 2px; background: #4db0f2; margin: 12px 0 0; }

  .sibling-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid #181818;
    border-radius: 3px;
    color: #6a6a6a;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.16em;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    padding: 8px 14px;
    transition: border-color 0.2s ease, color 0.2s ease;
    text-decoration: none;
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sibling-btn:hover {
    border-color: #4db0f2;
    color: #fff;
  }

  @media (max-width: 768px) {
    .sibling-btn { max-width: 110px; font-size: 0.55rem; padding: 8px 10px; }
  }

  .tile-label {
    font-family: 'Azonix', sans-serif;
    font-size: 1.8rem;
    color: #fff;
    letter-spacing: 0.06em;
    text-shadow: 0 2px 16px rgba(0,0,0,0.8);
  }

  .tile-grid {
    display: grid;
    gap: 6px;
    width: 100%;
  }

  @media (max-width: 768px) {
    .slp-wrap { padding: 60px 16px 60px !important; }
    .tile-label { font-size: 1.1rem !important; }
  }
`;

const SectionLandingPage: React.FC = () => {
  const { sectionPath } = useParams();
  const navigate = useNavigate();

  const [parentSection, setParentSection]       = useState<Section | null>(null);
  const [childSections, setChildSections]       = useState<Section[]>([]);
  const [subsectionImages, setSubsectionImages] = useState<Record<string, MediaItem | null>>({});
  const [topLevelSections, setTopLevelSections] = useState<Section[]>([]);
  const [hoveredId, setHoveredId]               = useState<string | null>(null);
  const [loadingSections, setLoadingSections]   = useState(false);
  const [loadingMedia, setLoadingMedia]         = useState(false);
  const [error, setError]                       = useState("");
  const [isMobile, setIsMobile]                 = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const fetchSections = async () => {
    if (!sectionPath) return;
    setLoadingSections(true);
    setError("");
    try {
      const parentRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/sections/path`,
        { params: { path: sectionPath } }
      );
      const pSection: Section = parentRes.data;
      setParentSection(pSection);

      const allRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/sections`);
      const all: Section[] = allRes.data || [];

      const children = all.filter((s: Section) => s.parent_id === pSection.id && !s.hidden);
      setChildSections(children);

      // top-level sections for prev/next
      const topLevel = all.filter((s: Section) => !s.parent_id && !s.hidden);
      setTopLevelSections(topLevel);
    } catch (err) {
      console.error("Error fetching sections:", err);
      setError("Could not load sections.");
    } finally {
      setLoadingSections(false);
    }
  };

  const pickOneValidImage = async (
    path: string, wantH: boolean, wantV: boolean, usedKeys: Set<string>
  ): Promise<MediaItem | null> => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/media/section`,
        { params: { sectionPath: path } }
      );
      let media: MediaItem[] = (data || []).filter((m: MediaItem) => m.type === "image");
      if (wantH) media = media.filter((m) => m.width >= m.height);
      if (wantV) media = media.filter((m) => m.height > m.width);
      media = media.filter((m) => !usedKeys.has(m.s3_key));
      return media.length ? media[Math.floor(Math.random() * media.length)] : null;
    } catch { return null; }
  };

  const buildFallbackPath = (p: string) =>
    p.replace(/\/(videos|recaps|multicams)$/i, "/photos");

  const endsWithMedia = (p: string) =>
    /\/(videos|recaps)$/i.test(p);

  const fetchImagesForSubsections = async (children: Section[]) => {
    setLoadingMedia(true);
    const n = children.length;
    const wantH = n === 2 || n === 4;
    const wantV = n === 3;
    const usedKeys = new Set<string>();
    const newImages: Record<string, MediaItem | null> = {};

    for (const child of children) {
      let picked = await pickOneValidImage(child.path, wantH, wantV, usedKeys);
      if (!picked || endsWithMedia(child.path))
        picked = await pickOneValidImage(buildFallbackPath(child.path), wantH, wantV, usedKeys);
      newImages[child.id] = picked ?? null;
      if (picked) usedKeys.add(picked.s3_key);
    }

    setSubsectionImages(newImages);
    setLoadingMedia(false);
  };

  useEffect(() => { fetchSections(); }, [sectionPath]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (childSections.length > 0) fetchImagesForSubsections(childSections); }, [childSections]); // eslint-disable-line react-hooks/exhaustive-deps

  const n = childSections.length;
  const gridCols  = n === 3 ? 3 : 2;
  const gridAspect = n === 3 ? '2/3' : '16/9';

  const topLevelIndex = topLevelSections.findIndex((s) => s.id === parentSection?.id);
  const prevSection   = topLevelIndex > 0 ? topLevelSections[topLevelIndex - 1] : null;
  const nextSection   = topLevelIndex < topLevelSections.length - 1 ? topLevelSections[topLevelIndex + 1] : null;

  if (loadingSections || loadingMedia) {
    return (
      <div style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Montserrat', fontSize: '0.65rem', letterSpacing: '0.22em', color: '#4db0f2', textTransform: 'uppercase' }}>
          Loading...
        </p>
      </div>
    );
  }

  if (error || !parentSection) {
    return (
      <div style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Azonix, sans-serif', fontSize: '1.5rem', color: '#fff' }}>
          {error || `No section found for: ${sectionPath}`}
        </p>
      </div>
    );
  }

  if (n < 2 || n > 4) {
    return (
      <div style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Azonix, sans-serif', fontSize: '1.5rem', color: '#fff' }}>
          Unsupported layout: {n} subsections
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <motion.div
        className="slp-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Back + prev/next */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <motion.button
              onClick={() => navigate('/work')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: '#a6d7f8', fontFamily: 'Montserrat', fontSize: '0.62rem', letterSpacing: '0.2em', fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </motion.button>

            {topLevelSections.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {prevSection ? (
                  <Link to={sectionUrl(prevSection.path)} className="sibling-btn">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {prevSection.name}
                  </Link>
                ) : (
                  <span className="sibling-btn" style={{ opacity: 0.2, cursor: 'not-allowed' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Prev
                  </span>
                )}
                {nextSection ? (
                  <Link to={sectionUrl(nextSection.path)} className="sibling-btn">
                    {nextSection.name}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ) : (
                  <span className="sibling-btn" style={{ opacity: 0.2, cursor: 'not-allowed' }}>
                    Next
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Header */}
          <motion.div
            style={{ marginBottom: '48px' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p style={{ fontFamily: 'Montserrat', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Select a category
            </p>
            <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '2.2rem', color: '#fff', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {parentSection.name}
            </h1>
            <div className="divider" />
          </motion.div>

          {/* Grid */}
          <div
            className="tile-grid"
            style={{ gridTemplateColumns: isMobile ? '1fr' : `repeat(${gridCols}, 1fr)` }}
          >
            {childSections.map((child, idx) => {
              const image = subsectionImages[child.id];
              return (
                <motion.div
                  key={child.id}
                  style={{ position: 'relative', overflow: 'hidden', borderRadius: '3px', aspectRatio: gridAspect, zIndex: hoveredId === child.id ? 10 : 1 }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.06 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(77,176,242,0.15), 0 10px 24px rgba(77,176,242,0.12)' }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredId(child.id)}
                  onHoverEnd={() => setHoveredId(null)}
                >
                  <Link to={sectionUrl(child.path)} style={{ display: 'block', width: '100%', height: '100%' }}>
                    {image ? (
                      <motion.img
                        src={`https://${process.env.REACT_APP_S3_BUCKET}/${image.s3_key}`}
                        alt={child.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.7)' }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#222', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Montserrat' }}>No image</span>
                      </div>
                    )}

                    <motion.div
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)', zIndex: 10, pointerEvents: 'none' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 + idx * 0.06 }}
                    />

                    <motion.div
                      className="tile-label"
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, padding: '16px 20px', textAlign: 'left' }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + idx * 0.08 }}
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
          </div>

        </div>
      </motion.div>
    </>
  );
};

export default SectionLandingPage;