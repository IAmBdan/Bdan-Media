import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Section {
  id: number;
  name: string;
  path: string;
  parent_id?: number;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [hierarchicalSections, setHierarchicalSections] = useState<Record<number, Section[]>>({});
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/sections`);
        const allSections: Section[] = response.data;

        const filteredSections = allSections.filter(
          (section) => section.name.toLowerCase() !== 'logos' && section.name.toLowerCase() !== 'headshots'
        );

        const groupedSections = filteredSections.reduce((acc, section) => {
          const parentId = section.parent_id || 0;
          if (!acc[parentId]) acc[parentId] = [];
          acc[parentId].push(section);
          return acc;
        }, {} as Record<number, Section[]>);

        setSections(filteredSections);
        setHierarchicalSections(groupedSections);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();
  }, []);

  const toggleExpandedSection = (sectionId: number) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const handleNavigation = (path: string) => {
    navigate(`/work/${path}`);
  };

  const renderSections = (parentId: number): JSX.Element[] => {
    const childSections = hierarchicalSections[parentId];
    if (!childSections || childSections.length === 0) return [];

    return childSections.map((section, index) => (
      <div
        key={section.id}
        style={{
          width: 'calc(25% - 20px)',
          minWidth: '200px',
          margin: '10px',
          textAlign: 'center',
          animation: `fade-in 0.5s ease-in-out ${index * 0.1}s forwards`,
          opacity: 0,
        }}
      >
        <div
          style={{
            textDecoration: 'none',
            color: '#f1f1f1',
            padding: '20px',
            border: '1px solid #4db0f2',
            borderRadius: '12px',
            backgroundColor: '#1a2634',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '600',
            fontSize: '1.2rem',
            cursor: hierarchicalSections[section.id] ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 10px rgba(0, 0, 0, 0.3)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={() =>
            hierarchicalSections[section.id] ? toggleExpandedSection(section.id) : handleNavigation(section.path)
          }
        >
          {section.name.toUpperCase()}
        </div>
        {expandedSection === section.id && (
          <div
            style={{
              marginTop: '10px',
              padding: '15px',
              borderRadius: '12px',
              backgroundColor: '#2d3b4d',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              animation: 'fade-in 0.5s ease-in-out',
            }}
          >
            {renderSections(section.id)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div
      style={{
        padding: '40px',
        backgroundColor: '#02111b',
        color: '#f1f1f1',
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontFamily: 'Azonix, sans-serif',
          fontSize: '3rem',
          color: '#a6d7f8',
          letterSpacing: '2px',
          animation: 'fade-in 0.5s ease-in-out forwards',
          opacity: 1, // Ensure visible
        }}
      >
        SELECT A SECTION
      </h1>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
          padding: '10px',
        }}
      >
        {renderSections(0)}
      </div>
    </div>
  );
};

export default LandingPage;