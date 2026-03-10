import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import UploadSection from './UploadSection';
import TiledLayout from './TiledLayout';
import { useAuth } from '../context/AuthContext';

const sectionUrl = (path: string) => `/${path}`;

interface Section {
  id: string;
  name: string;
  path: string;
  parent_id?: string;
  hidden?: boolean;
}

interface MediaItem {
  id: string;
  s3_key: string;
  width: number;
  height: number;
  tags: string[];
  type: 'image' | 'video';
}

const css = `
  .divider {
    width: 32px;
    height: 2px;
    background: #4db0f2;
    margin: 12px 0 0;
  }

  .other-card {
    padding: 16px 24px;
    border: 1px solid #181818;
    border-radius: 3px;
    background: #0d0d0d;
    color: #6a6a6a;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    transition: border-color 0.25s ease, color 0.25s ease;
  }

  .other-card:hover {
    border-color: #4db0f2;
    color: #fff;
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
`;

const SectionPage: React.FC = () => {
  const { '*': rawPath } = useParams();
  const path = rawPath?.replace(/^work\//, '');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [section, setSection]             = useState<Section | null>(null);
  const [media, setMedia]                 = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode]       = useState(false);
  const [bottomSections, setBottomSections] = useState<Section[]>([]);

  const parentPath = path?.includes('/') ? path.split('/').slice(0, -1).join('/') : null;

  const fetchSectionByPath = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/sections/path`,
        { params: { path } }
      );
      const matched: Section = res.data;
      setSection(matched);

      if (matched) {
        const mediaRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/media/section`,
          { params: { sectionPath: path } }
        );
        setMedia(mediaRes.data);
      }
    } catch (err) {
      console.error('Error fetching section or media:', err);
    }
  }, [path]);

  const fetchBottomSections = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/sections`);
      const filtered = (res.data as Section[]).filter((s) => !s.parent_id && !s.hidden);
      setBottomSections(filtered);
    } catch (err) {
      console.error('Error fetching bottom sections:', err);
    }
  };

  useEffect(() => { if (path) fetchSectionByPath(); }, [path, fetchSectionByPath]);
  useEffect(() => { fetchBottomSections(); }, []);

  return (
    <>
      <style>{css}</style>
      <motion.div
        style={{ backgroundColor: '#080808', color: '#fff', minHeight: '100vh', padding: '64px 48px 80px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Back */}
          <button className="back-btn" onClick={() => navigate(parentPath ? sectionUrl(parentPath) : '/work')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          {/* Header */}
          <motion.div
            style={{ marginBottom: '48px' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p style={{ fontFamily: 'Montserrat', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Portfolio
            </p>
            <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '2.2rem', color: '#fff', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {section?.name || 'Section'}
            </h1>
            <div className="divider" />
          </motion.div>

          {/* Admin upload */}
          {user?.role === 'admin' && section && (
            <UploadSection
              section={section.path}
              onUploadComplete={fetchSectionByPath}
              onDelete={() => console.log('Delete triggered')}
              isEditMode={isEditMode}
              toggleSelectionMode={() => setIsEditMode(!isEditMode)}
              clearSelection={() => setSelectedMedia(new Set())}
              selectedMedia={selectedMedia}
            />
          )}

          {/* Media grid */}
          <TiledLayout
            media={media}
            containerWidth={window.innerWidth}
            isEditMode={isEditMode}
            selectedMedia={selectedMedia}
            setSelectedMedia={setSelectedMedia}
          />

          {/* Other sections */}
          {bottomSections.length > 0 && (
            <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #181818' }}>
              <p style={{ fontFamily: 'Montserrat', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.24em', color: '#4a4a4a', textTransform: 'uppercase', margin: '0 0 20px' }}>
                Other Sections
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {bottomSections.map((sec) => (
                  <Link key={sec.id} to={sectionUrl(sec.path)} className="other-card">
                    {sec.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </>
  );
};

export default SectionPage;