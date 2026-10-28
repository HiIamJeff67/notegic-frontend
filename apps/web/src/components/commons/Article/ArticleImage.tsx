import { useTranslation } from "@shared/i18n/useTranslation";
import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocalPreferences } from "@/hooks/useLocalPreferences";
import { ArticleScrollContext } from "./ArticleContext";

export const ArticleImage = ({
  src,
  alt,
  caption,
  width,
  height,
  animated = false,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  animated?: boolean;
}) => {
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const scrollRef = useContext(ArticleScrollContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [playback, setPlayback] = useState<"auto" | "play" | "pause">("auto");
  const [failed, setFailed] = useState(false);
  const playing =
    playback === "play" || (playback === "auto" && !preferences.reduceMotion);
  const showImage = !failed && (!animated || (visible && playing));

  useEffect(() => {
    if (!animated || !containerRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => setVisible(entries.some(entry => entry.isIntersecting)),
      { root: scrollRef?.current ?? null, rootMargin: "300px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [animated, scrollRef]);

  return (
    <figure
      className="min-w-0 space-y-2"
      data-article-image={animated ? "gif" : "image"}
    >
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-sm bg-muted"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            role="img"
            aria-label={alt}
            className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground"
          >
            {failed ? t("common.mediaUnavailable") : alt}
          </div>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-xs leading-5 text-muted-foreground">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {caption}
        </a>
        {animated && !failed && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`${playing ? t("common.pause") : t("common.play")}: ${caption}`}
            onClick={() => setPlayback(playing ? "pause" : "play")}
          >
            {playing ? t("common.pause") : t("common.play")}
          </Button>
        )}
      </figcaption>
    </figure>
  );
};
