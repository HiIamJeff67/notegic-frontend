import { cn } from "@shared/util/utils";
import type { CSSProperties, HTMLAttributes } from "react";
import { createContext, useContext } from "react";
import { ArticleDisplayContext } from "./ArticleContext";
import { Separator } from "@/components/ui/separator";

// Visual levels control tone and indentation; separator spacing follows actual nesting.
const ArticleSubParagraphDepthContext = createContext(0);
const subParagraphSeparatorSpacing = [
  "1.5rem",
  "1rem",
  "0.75rem",
  "0.5rem",
] as const;

const articleTone = (level: number) =>
  level <= 0
    ? "text-foreground"
    : level === 1
      ? "text-foreground/90"
      : level === 2
        ? "text-foreground/80"
        : "text-foreground/70";

const articleLevelPadding = (level: number, baseLevel = 0) =>
  level > baseLevel ? `${(level - baseLevel) * 1}rem` : undefined;

export const ArticleParagraph = ({
  className,
  level = 0,
  id,
  paddingBlock,
  style,
  ...props
}: HTMLAttributes<HTMLElement> & {
  level?: number;
  paddingBlock?: CSSProperties["paddingBlock"];
}) => {
  const display = useContext(ArticleDisplayContext);
  const isHidden =
    display?.mode === "pagination" && level === 0 && id !== display.pageId;

  return (
    <section
      id={id}
      data-article-level={level}
      className={cn(
        "scroll-mt-8 flex w-full min-w-0 flex-col items-center py-4",
        articleTone(level),
        isHidden && "hidden",
        className
      )}
      style={{ paddingBlock, ...style }}
      {...props}
    />
  );
};

export const ArticleParagraphHeader = ({
  className,
  level = 0,
  style,
  ...props
}: HTMLAttributes<HTMLElement> & { level?: number }) => (
  <header
    className={cn(
      "w-full min-w-0 whitespace-normal break-words",
      articleTone(level),
      className
    )}
    style={{ paddingLeft: articleLevelPadding(level), ...style }}
    {...props}
  />
);

export const ArticleParagraphContent = ({
  className,
  level = 1,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { level?: number }) => (
  <div
    className={cn(
      "mt-8 w-full min-w-0 space-y-8 whitespace-normal break-words text-sm leading-7",
      articleTone(level),
      className
    )}
    style={{ paddingLeft: articleLevelPadding(level, 1), ...style }}
    {...props}
  />
);

export const ArticleParagraphRight = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-end gap-2 self-center",
      className
    )}
    {...props}
  />
);

// Bleed the line's paint, not layout, so nested sections cannot add horizontal scrolling.
export const ArticleParagraphSeparator = ({
  className,
  fullWidth = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { fullWidth?: boolean }) => {
  const display = useContext(ArticleDisplayContext);
  if (display?.mode === "pagination") return null;

  return (
    <Separator
      decorative={false}
      data-article-separator="paragraph"
      className={cn(
        "mx-auto my-8 h-0.5 w-full max-w-[calc(var(--article-reading-width,100%)+2rem)] bg-foreground/20",
        fullWidth &&
          "shadow-[0_0_0_100vmax] shadow-foreground/20 [clip-path:inset(0_-100vmax)]",
        className
      )}
      {...props}
    />
  );
};

export const ArticleSubParagraph = ({
  className,
  level = 1,
  separatorFullWidth = false,
  paddingBlock,
  style,
  ...props
}: HTMLAttributes<HTMLElement> & {
  level?: number;
  separatorFullWidth?: boolean;
  paddingBlock?: CSSProperties["paddingBlock"];
}) => {
  const depth = useContext(ArticleSubParagraphDepthContext);

  return (
    <ArticleSubParagraphDepthContext.Provider value={depth + 1}>
      <section
        data-article-level={level}
        className={cn(
          "scroll-mt-8 flex w-full min-w-0 flex-col items-center py-2 [&:has(+&)]:mb-0 [&:has(+&)]:pb-0 [&+&]:mt-0 [&+&]:pt-0 [&+&]:before:my-(--article-separator-spacing) [&+&]:before:block [&+&]:before:h-px [&+&]:before:w-full [&+&]:before:max-w-(--article-reading-width) [&+&]:before:shrink-0 [&+&]:before:bg-foreground/10",
          separatorFullWidth &&
            "[&+&]:before:shadow-[0_0_0_100vmax] [&+&]:before:shadow-foreground/10 [&+&]:before:[clip-path:inset(0_-100vmax)]",
          articleTone(level),
          className
        )}
        style={
          {
            paddingBlock,
            "--article-separator-spacing":
              subParagraphSeparatorSpacing[
                Math.min(depth, subParagraphSeparatorSpacing.length - 1)
              ],
            ...style,
          } as CSSProperties
        }
        {...props}
      />
    </ArticleSubParagraphDepthContext.Provider>
  );
};

export const ArticleSubParagraphHeader = ({
  className,
  children,
  as: Heading = "h3",
  level = 1,
  style,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  level?: number;
  as?: "h3" | "h4" | "h5" | "h6";
}) => (
  <Heading
    className={cn(
      "w-full min-w-0 whitespace-normal break-words text-xl font-semibold tracking-tight",
      articleTone(level),
      className
    )}
    style={{ paddingLeft: articleLevelPadding(level), ...style }}
    {...props}
  >
    {children}
  </Heading>
);

export const ArticleSubParagraphContent = ({
  className,
  level = 2,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { level?: number }) => (
  <div
    className={cn(
      "mt-3 w-full min-w-0 space-y-6 whitespace-normal break-words",
      articleTone(level),
      className
    )}
    style={{ paddingLeft: articleLevelPadding(level, 1), ...style }}
    {...props}
  />
);

export const ArticleSubParagraphSeparator = ({
  className,
  fullWidth = false,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { fullWidth?: boolean }) => {
  const depth = useContext(ArticleSubParagraphDepthContext);

  return (
    <Separator
      decorative={false}
      data-article-separator="subparagraph"
      className={cn(
        "mx-auto my-(--article-separator-spacing) h-px w-full max-w-(--article-reading-width) shrink-0 bg-foreground/10",
        fullWidth &&
          "shadow-[0_0_0_100vmax] shadow-foreground/10 [clip-path:inset(0_-100vmax)]",
        className
      )}
      style={
        {
          "--article-separator-spacing":
            subParagraphSeparatorSpacing[
              Math.min(depth, subParagraphSeparatorSpacing.length - 1)
            ],
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
};
