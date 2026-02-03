"use client";

import { useState, useEffect, useRef, memo } from "react";
import { fetchAndCacheImage, imageCache } from "@/lib/image-cache";
import { cn } from "@/lib/utils";

interface CachedImageProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
  /** Placeholder color for loading state */
  placeholderColor?: string;
  /** Whether to use lazy loading via intersection observer */
  lazy?: boolean;
}

/**
 * CachedImage Component
 * Automatically caches and compresses images using IndexedDB
 * Shows a shimmer effect while loading
 */
function CachedImageComponent({
  src,
  alt = "",
  className,
  fallback,
  placeholderColor = "bg-surface-200",
  lazy = true,
}: CachedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // Start loading 100px before visible
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Fetch and cache image
  useEffect(() => {
    if (!src || !isVisible) return;

    let isMounted = true;

    async function loadImage() {
      setIsLoading(true);
      setHasError(false);

      try {
        // First check if already cached
        const cached = await imageCache.get(src!);
        if (cached && isMounted) {
          // Store for cleanup
          objectUrlRef.current = cached;
          setImageSrc(cached);
          setIsLoading(false);
          return;
        }

        // Fetch and cache
        const url = await fetchAndCacheImage(src!);
        if (isMounted) {
          objectUrlRef.current = url;
          setImageSrc(url);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          // Fall back to original URL on error
          setImageSrc(src!);
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
      // Revoke object URL to free memory
      if (objectUrlRef.current && objectUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [src, isVisible]);

  // Handle image load error
  const handleError = () => {
    setHasError(true);
    // Try original URL as fallback
    if (src && imageSrc !== src) {
      setImageSrc(src);
    }
  };

  // No src provided or error with fallback
  if (!src || (hasError && fallback)) {
    return <>{fallback}</>;
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {/* Shimmer placeholder */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 animate-shimmer",
            placeholderColor
          )}
          style={{
            backgroundSize: "200% 100%",
            backgroundImage: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.08) 50%,
              transparent 100%
            )`,
          }}
        />
      )}

      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
        />
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const CachedImage = memo(CachedImageComponent);
export default CachedImage;
