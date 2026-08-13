import { cn } from "@shared/util/utils";
import type { HTMLAttributes, ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useLocalPreferences } from "@/hooks/localPreferences";

type ArticleNavigationItem = {
  id: string;
  title: string;
  description: string;
  weight?: 1 | 2 | 3 | 4 | 5;
  children?: ArticleNavigationItem[];
};

const ArticleScrollContext =
  createContext<RefObject<HTMLElement | null> | null>(null);

const Article = ({
  className,
  scrollRef,
  ...props
}: HTMLAttributes<HTMLElement> & {
  scrollRef?: RefObject<HTMLElement | null>;
}) => {
  const { preferences } = useLocalPreferences();
  const internalArticleRef = useRef<HTMLElement>(null);
  const articleRef = scrollRef ?? internalArticleRef;

  return (
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
};

const ArticleContent = ({
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

const articleTone = (level: number) =>
  level <= 0
    ? "text-foreground"
    : level === 1
      ? "text-foreground/90"
      : level === 2
        ? "text-foreground/80"
        : "text-foreground/70";

const ArticleParagraph = ({
  className,
  level = 0,
  ...props
}: HTMLAttributes<HTMLElement> & { level?: number }) => (
  <section
    data-article-level={level}
    className={cn("scroll-mt-8", articleTone(level), className)}
    {...props}
  />
);

const ArticleParagraphHeader = ({
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

const ArticleParagraphContent = ({
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

const ArticleParagraphRight = ({
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

const ArticleParagraphSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="separator"
    className={cn("mt-8 mb-6 w-full border-t-2 border-border/60", className)}
    {...props}
  />
);

const ArticleSubParagraph = ({
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

const ArticleSubParagraphHeader = ({
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

const ArticleSubParagraphContent = ({
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

const ArticleSubParagraphSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="separator"
    className={cn("my-8 h-px bg-border/35", className)}
    {...props}
  />
);

interface ArticleNavigationProps {
  items: ArticleNavigationItem[];
  className?: string;
  onNavigate?: (item: ArticleNavigationItem) => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}

const useArticleNavigation = (
  items: ArticleNavigationItem[],
  onNavigate?: (item: ArticleNavigationItem) => void,
  scrollContainerRef?: RefObject<HTMLElement | null>
) => {
  const [activeId, setActiveId] = useState<string | undefined>();
  const contextArticleRef = useContext(ArticleScrollContext);
  const articleRef = scrollContainerRef ?? contextArticleRef;
  const itemIds = useMemo(() => {
    const ids: string[] = [];
    const addItemIds = (navigationItems: ArticleNavigationItem[]) => {
      for (const item of navigationItems) {
        ids.push(item.id);
        if (item.children) addItemIds(item.children);
      }
    };

    addItemIds(items);
    return ids;
  }, [items]);

  useEffect(() => {
    const articleElement = articleRef?.current;
    if (!articleElement) return;

    let animationFrame: number | undefined;
    const updateActiveItem = () => {
      const articleTop = articleElement.getBoundingClientRect().top;
      const sections = Array.from(
        articleElement.querySelectorAll<HTMLElement>("section[id]")
      ).filter(section => itemIds.includes(section.id));
      const activeSection =
        sections
          .filter(
            section => section.getBoundingClientRect().top <= articleTop + 96
          )
          .at(-1) ?? sections[0];

      setActiveId(activeSection?.id);
    };
    const onScroll = () => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateActiveItem);
    };

    updateActiveItem();
    articleElement.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      articleElement.removeEventListener("scroll", onScroll);
    };
  }, [articleRef, itemIds]);

  const navigate = useCallback(
    (item: ArticleNavigationItem) => {
      setActiveId(item.id);
      onNavigate?.(item);
      document.getElementById(item.id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [onNavigate]
  );

  return { activeId, navigate };
};

const ArticleNavigationBar = ({
  items,
  className,
  paragraphBaseHeight = 24,
  subParagraphBaseHeight = 12,
  onNavigate,
  scrollContainerRef,
}: ArticleNavigationProps & {
  paragraphBaseHeight?: number;
  subParagraphBaseHeight?: number;
}) => {
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const { activeId, navigate } = useArticleNavigation(
    items,
    onNavigate,
    scrollContainerRef
  );

  const renderItem = (
    item: ArticleNavigationItem,
    depth: number
  ): ReactNode => {
    const isRoot = depth === 0;
    const visualHeight = Math.max(
      1,
      Math.round(
        (isRoot ? paragraphBaseHeight : subParagraphBaseHeight) *
          (isRoot
            ? [2 / 3, 1, 1, 4 / 3, 5 / 3]
            : [1 / 6, 2 / 3, 1, 4 / 3, 7 / 3])[(item.weight ?? 3) - 1]
      )
    );
    const isActive = activeId === item.id;

    return (
      <div
        key={item.id}
        className={cn(
          "flex flex-col items-center",
          isRoot ? "space-y-0.5" : "space-y-0"
        )}
      >
        <HoverCard openDelay={150} closeDelay={100}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className={cn(
                "group/article-node flex w-full items-center justify-center outline-none",
                isRoot ? "h-2" : "h-1.5"
              )}
              aria-current={isActive ? "location" : undefined}
              aria-label={item.title}
              onClick={() => navigate(item)}
            >
              <span
                style={{ width: visualHeight }}
                className={cn(
                  "h-px origin-center transition-[transform,background-color] duration-200 group-hover/article-node:scale-x-150 group-focus-visible/article-node:scale-x-150",
                  isActive
                    ? "bg-foreground"
                    : isRoot
                      ? "bg-foreground/35 group-hover/article-node:bg-foreground/70 group-focus-visible/article-node:bg-foreground/70"
                      : "bg-foreground/15 group-hover/article-node:bg-foreground/70 group-focus-visible/article-node:bg-foreground/70"
                )}
              />
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="right" align="center" className="w-60">
            <p className="font-medium">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </HoverCardContent>
        </HoverCard>
        {item.children && item.children.length > 0 && (
          <div className="flex flex-col items-center gap-0">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 lg:sticky lg:block lg:top-1/2 lg:h-fit lg:-translate-y-1/2",
        preferences.density === "compact"
          ? "lg:w-12"
          : preferences.density === "comfortable"
            ? "lg:w-20"
            : "lg:w-16",
        className
      )}
    >
      <nav
        aria-label={t("workspace.accessibility.articleNavigation")}
        className={
          items.some(item => item.children?.length) ? "space-y-7" : "space-y-3"
        }
      >
        {items.map(item => renderItem(item, 0))}
      </nav>
    </aside>
  );
};

const ArticleSidebar = ({
  items,
  className,
  onNavigate,
  scrollContainerRef,
}: ArticleNavigationProps) => {
  const { t } = useTranslation();
  const { activeId, navigate } = useArticleNavigation(
    items,
    onNavigate,
    scrollContainerRef
  );

  const renderItem = (
    item: ArticleNavigationItem,
    depth: number
  ): ReactNode => {
    const isActive = activeId === item.id;
    const hasChildren = Boolean(item.children?.length);
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigate(item);
    };

    if (depth === 0) {
      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            className="h-auto min-h-8 items-start overflow-visible whitespace-normal break-words leading-5 [&>span:last-child]:whitespace-normal [&>span:last-child]:break-words [&>span:last-child]:overflow-visible [&>span:last-child]:text-clip"
            isActive={isActive}
            onClick={() => navigate(item)}
          >
            {item.title}
          </SidebarMenuButton>
          {hasChildren && (
            <SidebarMenuSub>
              {item.children?.map(child => renderItem(child, depth + 1))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuSubItem key={item.id}>
        <SidebarMenuSubButton
          href={`#${item.id}`}
          isActive={isActive}
          className="h-auto min-h-7 items-start overflow-visible whitespace-normal break-words py-1 leading-5 [&>span:last-child]:whitespace-normal [&>span:last-child]:break-words [&>span:last-child]:overflow-visible [&>span:last-child]:text-clip"
          onClick={handleClick}
        >
          {item.title}
        </SidebarMenuSubButton>
        {hasChildren && (
          <SidebarMenuSub>
            {item.children?.map(child => renderItem(child, depth + 1))}
          </SidebarMenuSub>
        )}
      </SidebarMenuSubItem>
    );
  };

  return (
    <aside
      aria-label={t("workspace.accessibility.articleNavigation")}
      className={cn(
        "article-sidebar hidden h-full min-h-0 w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block",
        className
      )}
    >
      <SidebarProvider
        open
        onOpenChange={() => undefined}
        className="h-full min-h-0 w-full"
      >
        <SidebarContent className="h-full">
          <SidebarGroup>
            <SidebarMenu>{items.map(item => renderItem(item, 0))}</SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </SidebarProvider>
    </aside>
  );
};

export type { ArticleNavigationItem };
export {
  Article,
  ArticleContent,
  ArticleNavigationBar,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphRight,
  ArticleParagraphSeparator,
  ArticleSidebar,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
  ArticleSubParagraphSeparator,
};
