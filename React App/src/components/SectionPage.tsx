import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import UploadSection from './UploadSection';
import TiledLayout from './TiledLayout';
import { useAuth } from '../context/AuthContext';

interface Section {
  id: string;
  name: string;
  path: string;
  parent_id?: string;
}

interface MediaItem {
  id: string;
  s3_key: string;
  width: number;
  height: number;
  tags: string[];
  type: 'image' | 'video';
}

const SectionPage: React.FC = () => {
  const { '*': rawPath } = useParams(); // Match nested paths
  const path = rawPath?.replace(/^work\//, ''); // Strip out "work/" prefix
  const { user } = useAuth();

  const [section, setSection] = useState<Section | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  // New state: the “static” sections we want to list at the bottom
  const [bottomSections, setBottomSections] = useState<Section[]>([]);

  // Debugging Helper
  const logState = useCallback(() => {
    console.log('Current path:', path);
    console.log('Current section:', section);
    console.log('Media items:', media);
  }, [path, section, media]);

  // 1) Fetch the “current” section by path + its media
  const fetchSectionByPath = useCallback(async () => {
    try {
      console.log('Fetching section by path...');
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/sections/path`,
        { params: { path } }
      );
      const matchedSection: Section = response.data;
      console.log('Matched section:', matchedSection);
      setSection(matchedSection);

      if (matchedSection) {
        console.log(`Fetching media for sectionId: ${matchedSection.id}`);

        const mediaResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/media/section`,
          { params: { sectionPath: path } }
        );

        console.log('Fetched media:', mediaResponse.data);
        setMedia(mediaResponse.data);
      } else {
        console.error('No section found for path:', path);
      }
    } catch (error) {
      console.error('Error fetching section or media:', error);
    }
  }, [path]);

  // 2) One-time fetch for the sections we want at the bottom (e.g. top-level only)
  const fetchBottomSections = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api`
      );
      const allSections: Section[] = response.data;

      // Example: Filter out "logos", "headshots", or child sections
      const filtered = allSections.filter((sec) => {
        const nameLower = sec.name.toLowerCase();
        const isTopLevel = !sec.parent_id; // or sec.parent_id === null
        const isNotExcluded = nameLower !== 'logos' && nameLower !== 'headshots';
        return isTopLevel && isNotExcluded;
      });

      setBottomSections(filtered);
    } catch (err) {
      console.error('Error fetching bottom sections:', err);
    }
  };

  // Watch for resizing
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setContainerWidth(window.innerWidth);
        console.log('Container width updated:', window.innerWidth);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On mount or path change => fetch the section + media
  useEffect(() => {
    if (path) fetchSectionByPath();
  }, [path, fetchSectionByPath]);

  // On mount => fetch sections for the bottom
  useEffect(() => {
    fetchBottomSections();
  }, []);

  // Debug
  useEffect(() => {
    logState();
  }, [logState]);

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '15px' }}>
      <h2
        style={{
          textAlign: 'center',
          fontFamily: 'Azonix, sans-serif',
          fontSize: 60,
        }}
      >
        {section?.name?.toUpperCase() || 'SECTION'}
      </h2>

      {user?.role === 'admin' && section && (
        <UploadSection
          section={section?.path}
          onUploadComplete={fetchSectionByPath}
          onDelete={() => {
            console.log('Delete action triggered');
          }}
          isEditMode={isEditMode}
          toggleSelectionMode={() => setIsEditMode(!isEditMode)}
          clearSelection={() => setSelectedMedia(new Set())}
          selectedMedia={selectedMedia}
        />
      )}

      <TiledLayout
        media={media}
        containerWidth={window.innerWidth}
        isEditMode={isEditMode}
        selectedMedia={selectedMedia}
        setSelectedMedia={setSelectedMedia}
      />

      {/* STATIC SECTION LIST AT THE BOTTOM */}
      <div
        style={{
          marginTop: '40px',
          padding: '10px',
          borderTop: '1px solid #444',
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            fontFamily: 'Azonix, sans-serif',
            fontSize: '1.5rem',
            marginBottom: '15px',
          }}
        >
          OTHER SECTIONS
        </h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {bottomSections.map((sec) => (
            <Link
              key={sec.id}
              to={`/work/${sec.path}`}
              style={{
                color: '#a6d7f8',
                textDecoration: 'none',
                fontFamily: 'Azonix, sans-serif',
                fontSize: '1rem',
                padding: '8px 12px',
                border: '1px solid #a6d7f8',
                borderRadius: '8px',
                backgroundColor: '#1a2634',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {sec.name.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionPage;