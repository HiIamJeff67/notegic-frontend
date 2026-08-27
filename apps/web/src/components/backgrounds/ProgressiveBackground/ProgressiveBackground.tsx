import React, { useEffect, useMemo, useRef, useState } from "react";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";

interface ProgressiveBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export const ProgressiveBackground = React.forwardRef<
  HTMLDivElement,
  ProgressiveBackgroundProps
>(({ className = "", children, ...props }, ref) => {
  const backgroundImagesManager = useBackgroundImages();

  const [highResolutionImageURL, setHeightResolutionImageURL] = useState<
    string | null
  >(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadingTaskTokenRef = useRef(0);

  const thumbnailURL = useMemo(() => {
    const currentId = backgroundImagesManager.currentBackgroundImage?.id;
    if (!currentId || !backgroundImagesManager.thumbnails) return "";
    return (
      backgroundImagesManager.thumbnails.contents.find(t => t.id === currentId)
        ?.thumbnailURL || ""
    );
  }, [
    backgroundImagesManager.thumbnails,
    backgroundImagesManager.currentBackgroundImage?.id,
  ]);

  useEffect(() => {
    if (backgroundImagesManager.currentBackgroundImage === null) {
      setHeightResolutionImageURL(null);
      setIsLoaded(false);
      return;
    }

    const currentToken = loadingTaskTokenRef.current + 1;
    loadingTaskTokenRef.current = currentToken;

    const nextObjectURL = URL.createObjectURL(
      backgroundImagesManager.currentBackgroundImage.file
    );

    setIsLoaded(false);
    const preloadImage = new Image();
    preloadImage.onload = () => {
      if (loadingTaskTokenRef.current !== currentToken) return;
      setHeightResolutionImageURL(nextObjectURL);
      setIsLoaded(true);
    };
    preloadImage.onerror = () => {
      if (loadingTaskTokenRef.current !== currentToken) return;
      setHeightResolutionImageURL(null);
      setIsLoaded(false);
    };
    preloadImage.src = nextObjectURL;

    return () => {
      preloadImage.onload = null;
      preloadImage.onerror = null;
      URL.revokeObjectURL(nextObjectURL);
    };
  }, [backgroundImagesManager.currentBackgroundImage]);

  return (
    <div
      ref={ref}
      {...props}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        ...props.style,
      }}
    >
      {(highResolutionImageURL || thumbnailURL) && (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          fetchPriority="high"
          loading="eager"
          src={highResolutionImageURL || thumbnailURL}
        />
      )}
      {thumbnailURL && (
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full scale-105 object-cover blur-[10px] transition-opacity duration-[1000ms] ease-out"
          decoding="async"
          src={thumbnailURL}
          style={{
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
});

ProgressiveBackground.displayName = "ProgressiveBackground";
