import { cn } from "@shared/util/utils";
import {
  BookOpenIcon,
  CircleHelpIcon,
  FileTextIcon,
  MailIcon,
} from "lucide-react";
import type { ComponentType, ReactNode, RefObject } from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import notegicLogo from "@/assets/logo/transparent-background.svg";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { useAppRouterActions } from "@/hooks/useAppRouter";
import ArticleCommand from "./ArticleCommand";
import { ArticleDisplayContext, ArticleScrollContext } from "./ArticleContext";

export type ArticleNavigationItem = {
  id: string;
  title: string;
  description: string;
  weight?: 1 | 2 | 3 | 4 | 5;
  icon?: ComponentType<{ className?: string; size?: number }>;
  children?: ArticleNavigationItem[];
};

type ArticleNavigationProps = {
  items: ArticleNavigationItem[];
  className?: string;
  onNavigate?: (item: ArticleNavigationItem) => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

const hasActiveItem = (
  item: ArticleNavigationItem,
  activeId: string | undefined | null
): boolean =>
  item.id === activeId ||
  Boolean(item.children?.some(child => hasActiveItem(child, activeId)));

const useArticleNavigation = (
  items: ArticleNavigationItem[],
  onNavigate?: (item: ArticleNavigationItem) => void,
  scrollContainerRef?: RefObject<HTMLElement | null>
) => {
  const [activeId, setActiveId] = useState<string | undefined>();
  const display = useContext(ArticleDisplayContext);
  const contextArticleRef = useContext(ArticleScrollContext);
  const articleRef = scrollContainerRef ?? contextArticleRef;
  const selectedId =
    display?.mode === "pagination" ? display.activeItemId : activeId;
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
    if (display?.mode === "pagination") return;
    const articleElement = articleRef?.current;
    if (!articleElement) return;

    let animationFrame: number | undefined;
    const updateActiveItem = () => {
      const articleTop = articleElement.getBoundingClientRect().top;
      const sections = Array.from(
        articleElement.querySelectorAll<HTMLElement>("section[id]")
      ).filter(section => itemIds.includes(section.id));
      const isAtBottom =
        articleElement.scrollTop + articleElement.clientHeight >=
        articleElement.scrollHeight - 2;
      const activeSection =
        (isAtBottom
          ? sections.at(-1)
          : sections
              .filter(
                section =>
                  section.getBoundingClientRect().top <= articleTop + 96
              )
              .at(-1)) ?? sections[0];

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
  }, [articleRef, display?.mode, itemIds]);

  const navigate = useCallback(
    (item: ArticleNavigationItem, pageId = item.id) => {
      setActiveId(item.id);
      onNavigate?.(item);

      if (display?.mode === "pagination") {
        display.setActiveItemId(item.id);
        display.setPageId(pageId);
        articleRef?.current?.scrollTo({ top: 0, behavior: "auto" });
        if (item.id !== pageId) {
          requestAnimationFrame(() => {
            document.getElementById(item.id)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        }
        return;
      }

      document.getElementById(item.id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [articleRef, display, onNavigate]
  );

  return { activeId: selectedId, navigate };
};

export const ArticleNavigationBar = ({
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
    depth: number,
    pageId = item.id
  ): ReactNode => {
    const isRoot = depth === 0;
    const visualHeight = Math.max(
      1,
      Math.round(
        (isRoot ? paragraphBaseHeight : subParagraphBaseHeight) *
          (isRoot
            ? [2 / 3, 1, 1, 4 / 3, 5 / 3][(item.weight ?? 3) - 1]
            : [1 / 6, 2 / 3, 1, 4 / 3, 7 / 3][(item.weight ?? 3) - 1])
      )
    );
    const isActive = hasActiveItem(item, activeId);

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
              onClick={() => navigate(item, pageId)}
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
            {item.children.map(child => renderItem(child, depth + 1, pageId))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 lg:sticky lg:top-1/2 lg:block lg:h-fit lg:-translate-y-1/2",
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

export const ArticleSidebar = ({
  items,
  className,
  onNavigate,
  scrollContainerRef,
}: ArticleNavigationProps) => {
  const { t } = useTranslation();
  const router = useAppRouterActions();
  const display = useContext(ArticleDisplayContext);
  const contextArticleRef = useContext(ArticleScrollContext);
  const articleRef = scrollContainerRef ?? contextArticleRef;
  const { activeId, navigate } = useArticleNavigation(
    items,
    onNavigate,
    scrollContainerRef
  );

  const renderItem = (
    item: ArticleNavigationItem,
    depth: number,
    pageId = item.id
  ): ReactNode => {
    const isActive = hasActiveItem(item, activeId);
    const hasChildren = Boolean(item.children?.length);
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigate(item, pageId);
    };

    if (depth === 0) {
      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            className="h-auto min-h-8 items-center overflow-visible whitespace-normal break-words py-1.5 leading-5 [&>span:last-child]:whitespace-normal [&>span:last-child]:break-words [&>span:last-child]:overflow-visible [&>span:last-child]:text-clip"
            isActive={isActive}
            onClick={() => navigate(item, pageId)}
          >
            {item.icon && <item.icon className="size-3.5 shrink-0" size={14} />}
            <span>{item.title}</span>
          </SidebarMenuButton>
          {hasChildren && (
            <SidebarMenuSub>
              {item.children?.map(child =>
                renderItem(child, depth + 1, pageId)
              )}
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
          className="h-auto min-h-7 items-center overflow-visible whitespace-normal break-words py-1 leading-5 [&>span:last-child]:whitespace-normal [&>span:last-child]:break-words [&>span:last-child]:overflow-visible [&>span:last-child]:text-clip"
          onClick={handleClick}
        >
          {item.icon && <item.icon className="size-3.5 shrink-0" size={14} />}
          <span>{item.title}</span>
        </SidebarMenuSubButton>
        {hasChildren && (
          <SidebarMenuSub>
            {item.children?.map(child => renderItem(child, depth + 1, pageId))}
          </SidebarMenuSub>
        )}
      </SidebarMenuSubItem>
    );
  };

  const handleCommandSelect = (id: string) => {
    const target =
      document.getElementById(id) ??
      articleRef?.current?.querySelector<HTMLElement>(
        `[data-article-operation="${id}"]`
      );
    if (!target) return;
    const root =
      target.closest<HTMLElement>('section[data-article-level="0"]')?.id ?? id;

    if (display?.mode === "pagination") {
      display.setActiveItemId(id);
      display.setPageId(root);
      articleRef?.current?.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
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
        className="flex h-full min-h-0 w-full flex-col"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <a
                href="/"
                aria-label="Home"
                className="flex h-8 w-full cursor-pointer items-center gap-2 px-2 focus:outline-none"
                onClick={event => {
                  event.preventDefault();
                  router.push("/");
                }}
              >
                <img
                  src={notegicLogo}
                  alt=""
                  draggable={false}
                  className="size-4 shrink-0 object-contain"
                />
                <span className="text-sm font-semibold tracking-[0.08em] text-white">
                  Notegic
                </span>
              </a>
            </SidebarMenuItem>
            {(
              display?.headerLinks ?? [
                { label: "Home", href: "/" },
                { label: "Tutorial", href: "/tutorial" },
              ]
            )
              .slice(1)
              .map(link => {
                const LinkIcon =
                  link.label === "Document" ? FileTextIcon : BookOpenIcon;
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild>
                      <a
                        href={link.href}
                        onClick={event => {
                          event.preventDefault();
                          router.push(link.href);
                        }}
                      >
                        <LinkIcon className="size-4 shrink-0" />
                        <span>{link.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            <ArticleCommand
              articleRef={articleRef ?? { current: null }}
              onSelect={handleCommandSelect}
            />
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator className="mx-0 w-full" />
        <SidebarContent className="min-h-0 flex-1">
          <SidebarGroup>
            <SidebarMenu>{items.map(item => renderItem(item, 0))}</SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator className="mx-0 w-full" />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="mailto:your-email@example.com">
                  <MailIcon className="size-4 shrink-0" />
                  <span>Contact us</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a
                  href="/tutorial"
                  onClick={event => {
                    event.preventDefault();
                    router.push("/tutorial");
                  }}
                >
                  <CircleHelpIcon className="size-4 shrink-0" />
                  <span>Help</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarProvider>
    </aside>
  );
};
