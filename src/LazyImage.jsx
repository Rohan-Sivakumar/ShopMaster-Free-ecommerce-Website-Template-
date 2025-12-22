import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage Component
 * Loads images only when they're visible in viewport
 * Improves initial page load performance
 */
const LazyImage = ({ src, alt, className, style, height, placeholder = '/placeholder.png' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} style={{ ...style, position: 'relative' }}>
      {!isLoaded && (
        <div
          style={{
            width: '100%',
            height: height || '250px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
          className={className}
        >
          <span style={{ color: '#999' }}>Loading...</span>
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{
            ...style,
            display: isLoaded ? 'block' : 'none',
          }}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
