import { cn } from "@shared/util/utils";
import type { HTMLAttributes } from "react";
import { useContext } from "react";
import { ArticleDisplayContext } from "./ArticleContext";

const articleTone = (level: number) =>
  level <= 0
    ? "text-foreground"
    : level === 1
      ? "text-foreground/90"
      : level === 2
        ? "text-foreground/80"
        : "text-foreground/70";

export const ArticleParagraph = ({
  className,
  level = 0,
  id,
  ...props
}: HTMLAttributes<HTMLElement> & { level?: number }) => (
  <ArticleParagraphRenderer
    id={id}
    className={className}
    level={level}
    {...props}
  />
);

const ArticleParagraphRenderer = ({
  className,
  level,
  id,
  ...props
}: HTMLAttributes<HTMLElement> & { level: number }) => {
  const display = useContext(ArticleDisplayContext);
  const isHidden =
    display?.mode === "pagination" && level === 0 && id !== display.pageId;

  return (
    <section
      id={id}
      data-article-level={level}
      className={cn(
        "scroll-mt-8",
        articleTone(level),
        isHidden && "hidden",
        className
      )}
      {...props}
    />
  );
};

export const ArticleParagraphHeader = ({
  className,
  level = 0,
  ...props
}: HTMLAttributes<HTMLElement> & { level?: number }) => (
  <header
    className={cn(
      "mx-auto min-w-0 max-w-5xl whitespace-normal break-words",
      articleTone(level),
      className
    )}
    {...props}
  />
);

export const ArticleParagraphContent = ({
  className,
  level = 1,
  ...props
}: HTMLAttributes<HTMLDivElement> & { level?: number }) => (
  <div
    className={cn(
      "mx-auto mt-8 min-w-0 max-w-5xl space-y-8 whitespace-normal break-words text-sm leading-7",
      articleTone(level),
      className
    )}
    {...props}
  />
);

export const ArticleParagraphRight = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-end gap-2 self-start",
      className
    )}
    {...props}
  />
);

export const ArticleParagraphSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const display = useContext(ArticleDisplayContext);
  if (display?.mode === "pagination") return null;

  return (
    <div
      role="separator"
      className={cn(
        "mt-8 mb-6 w-full border-t-2 border-border/60",
        className
      )}
      {...props}
    />
  );
};

export const ArticleSubParagraph = ({
  className,
  level = 1,
  ...props
}: HTMLAttributes<HTMLElement> & { level?: number }) => (
  <section
    data-article-level={level}
    className={cn(
      "scroll-mt-8 before:mx-4 before:my-8 before:block before:h-px before:bg-border/35 [&:first-of-type]:before:hidden",
      articleTone(level),
      className
    )}
    {...props}
  />
);

export const ArticleSubParagraphHeader = ({
  className,
  children,
  level = 1,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { level?: number }) => (
  <h3
    className={cn(
      "min-w-0 whitespace-normal break-words text-xl font-semibold tracking-tight",
      articleTone(level),
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const ArticleSubParagraphContent = ({
  className,
  level = 2,
  ...props
}: HTMLAttributes<HTMLDivElement> & { level?: number }) => (
  <div
    className={cn(
      "mt-3 min-w-0 space-y-6 whitespace-normal break-words",
      articleTone(level),
      className
    )}
    {...props}
  />
);

export const ArticleSubParagraphSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="separator"
    className={cn("my-8 h-px bg-border/35", className)}
    {...props}
  />
);
