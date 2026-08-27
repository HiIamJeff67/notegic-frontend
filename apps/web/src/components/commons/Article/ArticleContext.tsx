import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export type ArticleDisplayMode = "scroll" | "pagination";
export type ArticleHeaderLink = { label: string; href: string };

export type ArticleDisplayContextValue = {
  mode: ArticleDisplayMode;
  pageId: string | null;
  activeItemId: string | null;
  setPageId: (id: string) => void;
  setActiveItemId: (id: string) => void;
  headerLinks: readonly ArticleHeaderLink[];
};

export const ArticleScrollContext =
  createContext<RefObject<HTMLElement | null> | null>(null);
export const ArticleDisplayContext =
  createContext<ArticleDisplayContextValue | null>(null);

export type ArticleDisplayProviderProps = {
  children: ReactNode;
  mode?: ArticleDisplayMode;
  initialPageId?: string;
  pageIdFromHash?: (hash: string) => string | undefined;
  headerLinks?: readonly ArticleHeaderLink[];
};

export const ArticleDisplayProvider = ({
  children,
  mode = "scroll",
  initialPageId,
  pageIdFromHash,
  headerLinks = [
    { label: "Home", href: "/" },
    { label: "Tutorial", href: "/tutorial" },
  ],
}: ArticleDisplayProviderProps) => {
  const [pageId, setPageId] = useState<string | null>(initialPageId ?? null);
  const [activeItemId, setActiveItemId] = useState<string | null>(
    initialPageId ?? null
  );

  useEffect(() => {
    if (initialPageId) {
      setPageId(initialPageId);
      setActiveItemId(initialPageId);
    }
  }, [initialPageId]);

  useEffect(() => {
    if (mode !== "pagination" || typeof window === "undefined") return;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    setPageId(pageIdFromHash?.(hash) ?? hash);
    setActiveItemId(hash);
  }, [mode, pageIdFromHash]);

  return (
    <ArticleDisplayContext.Provider
      value={{
        mode,
        pageId,
        activeItemId,
        setPageId,
        setActiveItemId,
        headerLinks,
      }}
    >
      {children}
    </ArticleDisplayContext.Provider>
  );
};

export const useArticleDisplay = () => useContext(ArticleDisplayContext);
