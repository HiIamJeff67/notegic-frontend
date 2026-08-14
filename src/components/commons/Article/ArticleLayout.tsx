import { cn } from "@shared/util/utils";
import type { HTMLAttributes, RefObject } from "react";
import { useContext, useRef } from "react";
import { useLocalPreferences } from "@/hooks/localPreferences";
import {
  ArticleDisplayContext,
  ArticleDisplayProvider,
  ArticleScrollContext,
  type ArticleDisplayMode,
  type ArticleHeaderLink,
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
  ...props
}: HTMLAttributes<HTMLElement>) => {
  const { preferences } = useLocalPreferences();

  return (
    <main
      className={cn(
        "mx-auto w-full min-w-0 max-w-none flex-1 px-4 py-2 sm:px-6 lg:px-8 lg:py-5",
        preferences.density === "compact"
          ? "lg:px-4"
          : preferences.density === "comfortable"
            ? "lg:px-8"
            : "lg:px-6",
        className
      )}
      {...props}
    />
  );
};
