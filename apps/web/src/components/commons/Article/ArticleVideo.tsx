import { useTranslation } from "@shared/i18n/useTranslation";

export const ArticleVideo = ({
  src,
  href,
  title,
  caption,
}: {
  src: string;
  href?: string;
  title: string;
  caption: string;
}) => {
  const { t } = useTranslation();

  let embedURL: URL;
  let watchURL: URL;
  try {
    embedURL = new URL(src);
    watchURL = new URL(href ?? src);
    if (embedURL.protocol !== "https:" || watchURL.protocol !== "https:")
      return null;
  } catch {
    return null;
  }

  return (
    <figure className="min-w-0 space-y-2" data-article-video={src}>
      <div className="flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-sm bg-muted">
        <iframe
          src={embedURL.href}
          title={title}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption className="text-xs leading-5 text-muted-foreground">
        {caption} ·{" "}
        <a
          href={watchURL.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {t("common.openVideo")}
        </a>
      </figcaption>
    </figure>
  );
};
