import { cn } from "@shared/lib/className/cn";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import "@/global/styles/image.css";

export type ImageLoadingStatus = "loading" | "loaded" | "error";

interface ImageProps
  extends Omit<ComponentPropsWithoutRef<"img">, "src" | "alt"> {
  src: string;
  alt: string;
  reveal?: boolean;
  blur?: number;
  duration?: number;
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

const Image = ({
  src,
  alt,
  loading = "lazy",
  decoding = "async",
  reveal = true,
  blur = 8,
  duration = 350,
  onLoadingStatusChange,
  onLoad,
  onError,
  className,
  style,
  ...props
}: ImageProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const notifiedRef = useRef<{
    src: string;
    status: ImageLoadingStatus;
  } | null>(null);
  const [result, setResult] = useState<{
    src: string;
    status: ImageLoadingStatus;
  }>({ src, status: "loading" });
  const status = result.src === src ? result.status : "loading";

  // Revisited sources must reset too, even when the intervening request is pending.
  if (result.src !== src) setResult({ src, status: "loading" });

  useEffect(() => {
    // Images can finish or fail before hydration attaches their event handlers.
    const image = imageRef.current;
    if (!image?.complete) return;
    setResult({ src, status: image.naturalWidth > 0 ? "loaded" : "error" });
  }, [src]);

  useEffect(() => {
    if (!onLoadingStatusChange) return;
    if (
      notifiedRef.current?.src === src &&
      notifiedRef.current.status === status
    )
      return;
    notifiedRef.current = { src, status };
    onLoadingStatusChange?.(status);
  }, [src, status, onLoadingStatusChange]);

  return (
    <img
      {...props}
      key={src}
      ref={imageRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={cn("image", className)}
      style={
        {
          "--image-reveal-blur": `${Math.max(0, blur)}px`,
          "--image-reveal-duration": `${Math.max(0, duration)}ms`,
          ...style,
        } as CSSProperties
      }
      data-slot="image"
      data-loading-status={status}
      data-reveal={reveal}
      onLoad={event => {
        if (event.currentTarget !== imageRef.current) return;
        setResult({ src, status: "loaded" });
        onLoad?.(event);
      }}
      onError={event => {
        if (event.currentTarget !== imageRef.current) return;
        setResult({ src, status: "error" });
        onError?.(event);
      }}
    />
  );
};

export default Image;
