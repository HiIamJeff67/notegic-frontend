import { cn } from "@shared/util/utils";
import type { HTMLAttributes, RefObject } from "react";
import { useContext, useEffect, useRef } from "react";
import { useLocalPreferences } from "@/hooks/localPreferences";
import {
  ArticleDisplayContext,
  type ArticleDisplayMode,
  ArticleDisplayProvider,
  type ArticleHeaderLink,
  ArticleScrollContext,
} from "./ArticleContext";

export const Article = ({
  className,
  scrollRef,
  mode = "scroll",
  initialPageId,
  pageIdFromHash,
  headerLinks = [
    { label: "Home", href: "/" },
    { label: "Tutorial", href: "/tutorial" },
  ],
  ...props
}: HTMLAttributes<HTMLElement> & {
  scrollRef?: RefObject<HTMLElement | null>;
  mode?: ArticleDisplayMode;
  initialPageId?: string;
  pageIdFromHash?: (hash: string) => string | undefined;
  headerLinks?: readonly ArticleHeaderLink[];
}) => {
  const { preferences } = useLocalPreferences();
  const existingDisplay = useContext(ArticleDisplayContext);
  const internalArticleRef = useRef<HTMLElement>(null);
  const articleRef = scrollRef ?? internalArticleRef;
  const article = (
    <ArticleScrollContext.Provider value={articleRef}>
      <article
        ref={articleRef}
        className={cn(
          "flex h-full min-h-0 w-full flex-col gap-8 overflow-y-auto lg:flex-row",
          preferences.density === "compact"
            ? "lg:gap-4"
            : preferences.density === "comfortable"
              ? "lg:gap-8"
              : "lg:gap-6",
          className
        )}
        {...props}
      />
    </ArticleScrollContext.Provider>
  );

  if (existingDisplay) return article;
  return (
    <ArticleDisplayProvider
      mode={mode}
      initialPageId={initialPageId}
      pageIdFromHash={pageIdFromHash}
      headerLinks={headerLinks}
    >
      {article}
    </ArticleDisplayProvider>
  );
};

export const ArticleContent = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) => {
  const { preferences } = useLocalPreferences();
  const display = useContext(ArticleDisplayContext);
  const articleRef = useContext(ArticleScrollContext);
  const contentRef = useRef<HTMLElement>(null);
  const trailingSpaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = articleRef?.current;
    const content = contentRef.current;
    const trailingSpace = trailingSpaceRef.current;
    if (!content || !trailingSpace) return;

    if (!article || display?.mode === "pagination") {
      trailingSpace.style.height = "0px";
      return;
    }

    const resizeObserver = new ResizeObserver(() => updateTrailingSpace());

    const observeSections = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(article);
      for (const child of Array.from(content.children)) {
        if (
          child instanceof HTMLElement &&
          child.matches('section[data-article-level="0"]')
        ) {
          resizeObserver.observe(child);
        }
      }
      updateTrailingSpace();
    };

    const updateTrailingSpace = () => {
      const sections = Array.from(content.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          child.matches('section[data-article-level="0"]')
      );
      const lastSection = sections.at(-1);
      if (!lastSection) {
        trailingSpace.style.height = "0px";
        return;
      }

      const bottomPadding = Number.parseFloat(
        getComputedStyle(content).paddingBottom
      );
      const height = Math.max(
        0,
        article.clientHeight -
          lastSection.getBoundingClientRect().height -
          (Number.isNaN(bottomPadding) ? 0 : bottomPadding)
      );
      const nextHeight = `${height}px`;
      if (trailingSpace.style.height !== nextHeight) {
        trailingSpace.style.height = nextHeight;
      }
    };

    const mutationObserver = new MutationObserver(observeSections);
    mutationObserver.observe(content, { childList: true, subtree: true });
    window.addEventListener("resize", updateTrailingSpace);
    observeSections();

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTrailingSpace);
    };
  }, [articleRef, display?.mode]);

  return (
    <main
      ref={contentRef}
      className={cn(
        "article-content mx-auto w-full min-w-0 max-w-none flex-1 px-4 pt-4 pb-2 !pb-16 sm:px-6 lg:px-8 lg:pt-7 lg:pb-5 lg:!pb-20",
        preferences.density === "compact"
          ? "lg:px-4"
          : preferences.density === "comfortable"
            ? "lg:px-8"
            : "lg:px-6",
        className
      )}
      {...props}
    >
      {children}
      <div ref={trailingSpaceRef} aria-hidden="true" className="h-0 shrink-0" />
    </main>
  );
};
