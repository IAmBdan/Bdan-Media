import React, { useState, useEffect, useRef } from 'react';

interface LazyMediaProps {
  src: string;
  alt: string;
  type: 'image' | 'video';
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  onLoad?: () => void;
  placeholderColor?: string;
}

const LazyMedia: React.FC<LazyMediaProps> = ({
  src,
  alt,
  type,
  style,
  className,
  onClick,
  onLoad,
  placeholderColor = '#2a2a2a'
}) => {
  const [mediaSrc, setMediaSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (mediaRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isInView) {
              setIsInView(true);
              setMediaSrc(src);
            }
          });
        },
        {
          // Start loading when media is 100px away from viewport
          rootMargin: '100px',
          threshold: 0.01
        }
      );
      
      observer.observe(mediaRef.current);
    }

    return () => {
      if (observer && mediaRef.current) {
        observer.unobserve(mediaRef.current);
      }
    };
  }, [src, isInView]);

  const handleMediaLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleMediaError = () => {
    console.error(`Failed to load ${type}:`, mediaSrc);
    setIsLoaded(true); // Show placeholder instead of infinite loading
  };

  return (
    <div
      ref={mediaRef}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: placeholderColor,
      }}
      className={className}
      onClick={onClick}
    >
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: placeholderColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          {isInView && (
            <>
              <div>Loading {type}...</div>
              {type === 'video' && (
                <div style={{ fontSize: '10px', opacity: 0.7 }}>
                  This may take a moment
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Actual media */}
      {mediaSrc && (
        <>
          {type === 'image' ? (
            <img
              src={mediaSrc}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onLoad={handleMediaLoad}
              onError={handleMediaError}
            />
          ) : (
            <video
              src={mediaSrc}
              controls
              preload="metadata" // Only load metadata initially, not the full video
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onLoadedData={handleMediaLoad} // For videos, use loadeddata event
              onError={handleMediaError}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LazyMedia;