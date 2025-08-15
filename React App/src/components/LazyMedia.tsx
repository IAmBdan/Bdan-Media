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
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileUA || (isTouchDevice && isSmallScreen));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Mobile video fallback - ONLY for videos
  useEffect(() => {
    if (mediaSrc && type === 'video' && !isLoaded) {
      // Set a fallback timeout for mobile where video events might not fire
      timeoutRef.current = setTimeout(() => {
        if (!isLoaded) {
          console.log('Video timeout fallback triggered');
          setIsLoaded(true);
        }
      }, 4000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [mediaSrc, type, isLoaded]);

  const handleMediaLoad = () => {
    setIsLoaded(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (onLoad) onLoad();
  };

  const generateThumbnail = async () => {
    if (!isMobile || !videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setThumbnailUrl(url);
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.log('Thumbnail generation failed:', error);
    }
  };

  const handleVideoMetadataLoaded = () => {
    handleMediaLoad();
    
    // Generate thumbnail only on mobile
    if (isMobile && type === 'video') {
      // Small delay to ensure video is ready
      setTimeout(generateThumbnail, 100);
    }
  };

  const handleVideoPlay = () => {
    // Hide thumbnail when video starts playing
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
      setThumbnailUrl('');
    }
  };

  const handleMediaError = () => {
    console.error(`Failed to load ${type}:`, mediaSrc);
    setIsLoaded(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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
      
      {/* Mobile thumbnail overlay */}
      {isMobile && type === 'video' && thumbnailUrl && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: 'none', // Allow clicks to pass through
            zIndex: 0
          }}
        />
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
            <>
              <video
                ref={videoRef}
                src={mediaSrc}
                controls
                preload="metadata"
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                  position: 'relative',
                  zIndex: 1
                }}
                onLoadedMetadata={handleVideoMetadataLoaded}
                onCanPlay={handleMediaLoad}
                onPlay={handleVideoPlay}
                onError={handleMediaError}
              />
              {/* Hidden canvas for thumbnail generation */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LazyMedia;