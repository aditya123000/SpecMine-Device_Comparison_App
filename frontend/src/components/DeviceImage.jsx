import React, { useState, useEffect, useRef } from "react";

const sizeClasses = {
  card: "h-36",
  details: "h-64 md:h-72",
  compare: "h-28",
};

const FALLBACK_IMAGE = "https://img.icons8.com/fluency/480/iphone-x.png";

const DeviceImage = ({ src, alt, variant = "card", className = "" }) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // If IntersectionObserver is not available in environment, load immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: "200px 0px", // pre-fetch slightly before coming into view
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const imageSrc = hasError || !src ? FALLBACK_IMAGE : src;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden bg-transparent ${sizeClasses[variant] || "h-36"} ${className}`}
    >
      {/* Lightweight skeleton placeholder while waiting for viewport scroll or network */}
      {(!isInView || !isLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-100/60 dark:bg-slate-800/40 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700/60" />
        </div>
      )}

      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError) {
              setHasError(true);
            }
          }}
          className={`w-full ${sizeClasses[variant] || "h-36"} object-contain bg-transparent transition-all duration-300 hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </div>
  );
};

export default DeviceImage;
