import { defaultFilter } from "cmdk";
import { BookOpenIcon, Code2Icon, GripHorizontalIcon } from "lucide-react";
import {
  type ComponentType,
  type RefObject,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import AppCommandContent from "@/components/core/AppUtilitiesWrapper/AppCommand/AppCommandContent";
import AppCommandPath from "@/components/core/AppUtilitiesWrapper/AppCommand/AppCommandPath";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useTranslation } from "@/hooks/useTranslation";
import "@/global/styles/app-command.css";
import { ArticleMethodBadge } from "./ArticleMethodBadge";
import type { ArticleNavigationItem } from "./ArticleNavigation";

type ArticleIcon = ComponentType<{ className?: string; size?: number }>;

type ArticleSection = {
  id: string;
  title: string;
  level: number;
  icon?: ArticleIcon;
  children: ArticleSection[];
  operations: ArticleOperation[];
};

type ArticleOperation = {
  id: string;
  title: string;
  method?: string;
};

type ArticleCommandProps = {
  items: ArticleNavigationItem[];
  articleRef: RefObject<HTMLElement | null>;
  onSelect: (id: string) => void;
};

const navigationPageSize = 8;

const ArticleCommand = ({
  items,
  articleRef,
  onSelect,
}: ArticleCommandProps) => {
  const { t } = useTranslation();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [sections, setSections] = useState<ArticleSection[]>([]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(current => !current);
        return;
      }
      if (event.key === "Escape") {
        if (steps.length > 0) {
          setSteps(current => current.slice(0, -1));
          setQuery("");
          return;
        }
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [steps.length]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSteps([]);
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const navigation = new Map<string, ArticleNavigationItem>();
    const pending = [...items];
    while (pending.length > 0) {
      const item = pending.pop();
      if (!item) continue;
      navigation.set(item.id, item);
      if (item.children) pending.push(...item.children);
    }

    const elements = Array.from(
      articleRef.current?.querySelectorAll<HTMLElement>(
        "section[id][data-article-level]"
      ) ?? []
    );
    const sectionById = new Map<string, ArticleSection>();
    const roots: ArticleSection[] = [];

    for (const element of elements) {
      const heading = element.querySelector<HTMLElement>(
        "h1, h2, h3, h4, h5, h6"
      );
      const title = heading?.textContent?.trim();
      if (!title || sectionById.has(element.id)) continue;
      const metadata = navigation.get(element.id);
      sectionById.set(element.id, {
        id: element.id,
        title: metadata?.title ?? title,
        level: Number(element.dataset.articleLevel ?? 0),
        icon: metadata?.icon,
        children: [],
        operations: [],
      });
    }

    for (const element of elements) {
      const section = sectionById.get(element.id);
      if (!section) continue;
      const parent = element.parentElement?.closest<HTMLElement>(
        "section[id][data-article-level]"
      );
      const parentSection = parent ? sectionById.get(parent.id) : undefined;
      if (parentSection) parentSection.children.push(section);
      else roots.push(section);
    }

    const operations = Array.from(
      articleRef.current?.querySelectorAll<HTMLElement>(
        "[data-article-operation]"
      ) ?? []
    );
    for (const operation of operations) {
      const operationId = operation.dataset.articleOperation;
      if (!operationId) continue;
      const owner = operation.closest<HTMLElement>(
        "section[id][data-article-level]"
      );
      const section = owner ? sectionById.get(owner.id) : undefined;
      if (
        !section ||
        section.operations.some(item => item.id === operationId)
      ) {
        continue;
      }
      section.operations.push({
        id: operationId,
        title: operation.textContent?.trim() || operationId,
        method: operation.dataset.articleOperationMethod,
      });
    }

    setSections(roots);
  }, [articleRef, items, open]);

  const sectionById = useMemo(() => {
    const sectionsById = new Map<string, ArticleSection>();
    const visit = (section: ArticleSection) => {
      sectionsById.set(section.id, section);
      for (const child of section.children) visit(child);
    };
    for (const section of sections) visit(section);
    return sectionsById;
  }, [sections]);

  const current = steps.length
    ? sectionById.get(steps[steps.length - 1])
    : undefined;
  const domainRows = (current ? current.children : sections).map(section => ({
    id: section.id,
    title: section.title,
    icon: section.icon,
    group: current ? ("subdomain" as const) : ("domain" as const),
    finish: false,
  }));
  const navigationRows = current
    ? [
        {
          id: current.id,
          title: current.title,
          icon: current.icon,
          group: "navigation" as const,
          finish: true,
        },
        ...current.operations.map(operation => ({
          id: operation.id,
          title: operation.title,
          method: operation.method,
          group: "navigation" as const,
          finish: true,
        })),
      ]
    : [];
  const groups = [
    {
      id: "navigation",
      title: t("common.commandNavigation"),
      rows: navigationRows,
    },
    {
      id: current ? "subdomain" : "domain",
      title: current
        ? t("common.commandSubdomains")
        : t("common.commandDomains"),
      rows: domainRows,
    },
  ].map(group => ({
    ...group,
    rows:
      query.trim() === ""
        ? group.rows.slice(0, navigationPageSize)
        : group.rows,
  }));

  const choose = (id: string, finish: boolean) => {
    if (finish) {
      onSelect(id);
      setOpen(false);
      return;
    }
    setSteps(currentSteps => [...currentSteps, id]);
    setQuery("");
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[60]">
      {!open && (
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <button
            type="button"
            className="app-command-trigger pointer-events-auto rounded-b-sm border-x border-b px-2 pt-px pb-1 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={t("common.commandPaletteHint")}
            title={t("common.commandPaletteHint")}
            aria-expanded={false}
            aria-controls={panelId}
            aria-keyshortcuts="Control+K Meta+K"
            onClick={() => setOpen(true)}
          >
            <GripHorizontalIcon
              aria-hidden
              className="h-2.5 w-5"
              viewBox="0 6 24 12"
            />
          </button>
        </div>
      )}
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("common.commandPalette")}
          className="app-command-panel pointer-events-auto absolute overflow-hidden text-popover-foreground"
        >
          <Command
            className="bg-transparent"
            filter={(_value, search, keywords) =>
              defaultFilter(keywords?.join(" ") ?? "", search)
            }
          >
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder={t("common.searchCommands")}
            />
            <AppCommandPath
              path={steps.map(id => sectionById.get(id)?.title ?? id)}
              prompt={null}
              onVisit={index => {
                setSteps(currentSteps => currentSteps.slice(0, index + 1));
                setQuery("");
              }}
            />
            <AppCommandContent>
              <CommandEmpty>{t("common.commandEmpty")}</CommandEmpty>
              {groups.map(group =>
                group.rows.length === 0 ? null : (
                  <CommandGroup
                    key={group.id}
                    heading={group.title}
                    className="overflow-visible p-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-left [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1"
                  >
                    {group.rows.map(row => {
                      const Icon =
                        row.group === "subdomain"
                          ? row.icon
                          : "icon" in row
                            ? (row.icon ?? BookOpenIcon)
                            : Code2Icon;
                      return (
                        <CommandItem
                          key={row.id}
                          className="px-3 py-2.5 text-base data-[selected=true]:[&_svg]:text-accent-foreground"
                          value={row.id}
                          keywords={[row.title]}
                          onSelect={() => choose(row.id, row.finish)}
                        >
                          {"method" in row && row.method ? (
                            <ArticleMethodBadge method={row.method} />
                          ) : null}
                          {Icon ? (
                            <Icon className="size-5 shrink-0 text-muted-foreground" />
                          ) : null}
                          <span className="min-w-0 truncate">{row.title}</span>
                          <span className="ml-auto shrink-0 pl-4 text-right text-sm text-muted-foreground">
                            {row.finish
                              ? t("common.commandKindOperation")
                              : t("common.commandKindDomain")}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )
              )}
            </AppCommandContent>
          </Command>
        </div>
      )}
    </div>,
    document.body
  );
};

export default ArticleCommand;
