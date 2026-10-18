import { useLocation } from "@tanstack/react-router";
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
    { label: "Website", href: "/document#website" },
  ],
}: ArticleDisplayProviderProps) => {
  const locationHash = useLocation({ select: location => location.hash });
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
    if (mode !== "pagination") return;
    let hash = locationHash;
    try {
      hash = decodeURIComponent(hash);
    } catch {
      hash = "";
    }
    const nextId = hash || initialPageId;
    if (!nextId) return;
    setPageId(pageIdFromHash?.(nextId) ?? nextId);
    setActiveItemId(nextId);
  }, [initialPageId, locationHash, mode, pageIdFromHash]);

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
