import React, { useEffect, useRef, useState } from "react";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";

interface LazyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback?: React.ReactNode;
  children?: React.ReactNode;
  imageClassName?: string;
}

export const LazyBackground = React.forwardRef<
  HTMLDivElement,
  LazyBackgroundProps
>(
  (
    {
      className = "",
      fallback = null,
      children,
      imageClassName = "",
      ...props
    },
    ref
  ) => {
    const backgroundImagesManager = useBackgroundImages();
    const [imageURL, setImageURL] = useState<string | null>(null);
    const taskTokenRef = useRef(0);

    useEffect(() => {
      const currentImage = backgroundImagesManager.currentBackgroundImage;
      setImageURL(null);

      if (!currentImage?.file) return;

      const currentToken = taskTokenRef.current + 1;
      taskTokenRef.current = currentToken;

      let objectURL: string | null = null;
      let cancelled = false;
      let preloadImage: HTMLImageElement | null = null;

      const loadImage = () => {
        if (cancelled) return;

        objectURL = URL.createObjectURL(currentImage.file);
        preloadImage = new Image();
        preloadImage.decoding = "async";
        preloadImage.src = objectURL;

        const decodePromise = preloadImage.decode
          ? preloadImage.decode()
          : new Promise<void>((resolve, reject) => {
              if (!preloadImage) {
                reject(new Error("failed to load background image"));
                return;
              }
              preloadImage.onload = () => resolve();
              preloadImage.onerror = () =>
                reject(new Error("failed to load background image"));
            });

        void decodePromise
          .then(() => {
            if (cancelled || taskTokenRef.current !== currentToken) return;
            setImageURL(objectURL);
          })
          .catch(() => {
            if (cancelled || taskTokenRef.current !== currentToken) return;
            if (objectURL) URL.revokeObjectURL(objectURL);
            objectURL = null;
            setImageURL(null);
          });
      };

      const requestIdleCallback =
        "requestIdleCallback" in window
          ? window.requestIdleCallback
          : undefined;
      const cancelIdleCallback =
        "cancelIdleCallback" in window ? window.cancelIdleCallback : undefined;
      const idleHandle =
        requestIdleCallback && cancelIdleCallback
          ? requestIdleCallback(loadImage, { timeout: 3000 })
          : null;
      const timeoutHandle =
        idleHandle === null ? window.setTimeout(loadImage, 100) : null;

      return () => {
        cancelled = true;
        if (idleHandle !== null && cancelIdleCallback) {
          cancelIdleCallback(idleHandle);
        }
        if (timeoutHandle !== null) {
          window.clearTimeout(timeoutHandle);
        }
        if (preloadImage) {
          preloadImage.onload = null;
          preloadImage.onerror = null;
        }
        if (objectURL) URL.revokeObjectURL(objectURL);
      };
    }, [backgroundImagesManager.currentBackgroundImage]);

    return (
      <div
        ref={ref}
        {...props}
        className={`relative w-full h-full overflow-hidden ${className}`}
      >
        {!imageURL && fallback}
        {imageURL && (
          <img
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 size-full object-cover ${imageClassName}`}
            decoding="async"
            loading="lazy"
            src={imageURL}
          />
        )}
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    );
  }
);

LazyBackground.displayName = "LazyBackground";
