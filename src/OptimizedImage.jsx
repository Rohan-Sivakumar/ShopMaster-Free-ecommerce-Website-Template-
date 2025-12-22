import React, { useState, useEffect, useRef } from 'react';

/**
 * OptimizedImage Component
 * Features:
 * - Lazy loading with Intersection Observer
 * - Progressive image loading with blur effect
 * - Skeleton placeholder
 * - Error handling
 */
const OptimizedImage = ({ src, alt, className = '', style = {}, height = '250px' }) => {
  const [imageState, setImageState] = useState('loading'); // loading, loaded, error
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  const observerRef = useRef();

  useEffect(() => {
    // Only load images when they're near the viewport
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before image enters viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setImageState('loaded');
  };

  const handleError = () => {
    setImageState('error');
  };

  return (
    <div
      ref={imgRef}
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        ...style,
      }}
      className={className}
    >
      {/* Skeleton loader */}
      {imageState === 'loading' && (
        <div
          className="image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="spinner"></div>
        </div>
      )}

      {/* Error state */}
      {imageState === 'error' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#999',
          }}
        >
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p className="mt-2">Image unavailable</p>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: imageState === 'loaded' ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
