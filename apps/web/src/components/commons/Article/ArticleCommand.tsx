import { BookOpenIcon, Code2Icon } from "lucide-react";
import {
  type ComponentType,
  Fragment,
  type RefObject,
  useEffect,
  useState,
} from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { ArticleMethodBadge } from "./ArticleMethodBadge";
import type { ArticleNavigationItem } from "./ArticleNavigation";

type ArticleIcon = ComponentType<{ className?: string; size?: number }>;

type ArticleCommandItem = {
  id: string;
  title: string;
  description?: string;
  searchText?: string;
  method?: string;
  icon?: ArticleIcon;
};

type ArticleCommandGroup = {
  id: string;
  title: string;
  level: number;
  icon?: ArticleIcon;
  items: ArticleCommandItem[];
  children: ArticleCommandGroup[];
  command?: ArticleNavigationItem["command"];
};

type ArticleCommandProps = {
  items: ArticleNavigationItem[];
  articleRef: RefObject<HTMLElement | null>;
  onSelect: (id: string) => void;
};

const ArticleCommand = ({
  items,
  articleRef,
  onSelect,
}: ArticleCommandProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<ArticleCommandGroup[]>([]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

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

    const sections = Array.from(
      articleRef.current?.querySelectorAll<HTMLElement>(
        "section[id][data-article-level]"
      ) ?? []
    );
    const sectionGroups = new Map<string, ArticleCommandGroup>();
    const rootGroups: ArticleCommandGroup[] = [];

    for (const section of sections) {
      const heading = section.querySelector<HTMLElement>(
        "h1, h2, h3, h4, h5, h6"
      );
      const title = heading?.textContent?.trim();
      if (!title || sectionGroups.has(section.id)) continue;

      const level = Number(section.dataset.articleLevel ?? 0);
      const metadata = navigation.get(section.id);
      const groupTitle = metadata?.title ?? title;
      sectionGroups.set(section.id, {
        id: section.id,
        title: groupTitle,
        level,
        icon: metadata?.icon,
        command: metadata?.command,
        items: [
          {
            id: section.id,
            title: groupTitle,
            icon: metadata?.icon,
          },
        ],
        children: [],
      });
    }

    for (const section of sections) {
      const group = sectionGroups.get(section.id);
      if (!group) continue;
      const parent = section.parentElement?.closest<HTMLElement>(
        "section[id][data-article-level]"
      );
      const parentGroup = parent ? sectionGroups.get(parent.id) : undefined;
      if (parentGroup) parentGroup.children.push(group);
      else rootGroups.push(group);
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
      const group = owner ? sectionGroups.get(owner.id) : undefined;
      if (!group || group.items.some(item => item.id === operationId)) {
        continue;
      }
      group.items.push({
        id: operationId,
        title: operation.textContent?.trim() || operationId,
        description: operation.dataset.articleOperationPath,
        searchText: `${operationId} ${operation.dataset.articleOperationSummary ?? ""}`,
        method: operation.dataset.articleOperationMethod,
        icon: Code2Icon,
      });
    }

    setGroups(rootGroups);
  }, [articleRef, open, items]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const renderItem = (
    group: ArticleCommandGroup,
    item: ArticleCommandItem,
    className?: string
  ) => {
    const ItemIcon = item.icon ?? group.icon ?? BookOpenIcon;
    return (
      <CommandItem
        key={`${group.id}-${item.id}`}
        className={className}
        value={`${group.title} ${item.title} ${item.description ?? ""} ${item.searchText ?? ""}`}
        onSelect={() => handleSelect(item.id)}
      >
        {item.method && <ArticleMethodBadge method={item.method} />}
        <ItemIcon className="size-3.5 shrink-0" size={14} />
        <span className="min-w-0 flex-1 truncate">{item.title}</span>
        {item.description && (
          <span className="max-w-44 truncate text-xs text-muted-foreground">
            {item.description}
          </span>
        )}
      </CommandItem>
    );
  };

  const renderGroup = (group: ArticleCommandGroup, depth = 0) => {
    const hasQuery = Boolean(query.trim());
    const isFlatGroup = group.command?.layout === "flat";
    const childItems = group.children.flatMap(child => {
      const item = child.items[0];
      return item ? [{ ...item, title: child.title }] : [];
    });
    const groupEntries = isFlatGroup ? childItems : group.items;
    const visibleItems = groupEntries.filter(
      (_, itemIndex) => hasQuery || itemIndex < 5
    );
    const children = isFlatGroup ? [] : group.children;
    const visibleChildren = children.map(child => {
      const childIsGroup = child.children.length > 0 || child.items.length > 1;
      return (
        <Fragment key={child.id}>
          {childIsGroup && child.command?.separator && (
            <CommandSeparator className="my-1" />
          )}
          {renderGroup(child, depth + 1)}
        </Fragment>
      );
    });

    if (visibleItems.length === 0 && visibleChildren.length === 0) {
      return null;
    }

    const isStandaloneLeaf =
      group.command?.layout !== "group" &&
      group.children.length === 0 &&
      group.items.length === 1;
    if (isStandaloneLeaf) {
      const item = visibleItems[0];
      return item
        ? depth === 0
          ? renderItem(group, item, "mx-2 my-0.5")
          : renderItem(group, item)
        : null;
    }

    const groupItems =
      group.children.length > 0 && group.level > 0 ? [] : visibleItems;

    // Sibling command groups let a matching child survive an unmatched parent.
    return (
      <Fragment key={group.id}>
        {groupItems.length > 0 && (
          <CommandGroup
            heading={group.title}
            className={depth > 0 ? "mt-1 px-2" : "my-1 px-2"}
          >
            {groupItems.map(item => renderItem(group, item))}
          </CommandGroup>
        )}
        {visibleChildren}
      </Fragment>
    );
  };

  return (
    <>
      <SidebarMenuItem>
        <Command className="h-10 w-full min-w-0 bg-transparent p-0 shadow-none">
          <CommandInput
            readOnly
            placeholder="⌘ + K / Ctrl + K"
            aria-label="Search article"
            onClick={() => setOpen(true)}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen(true);
              }
            }}
          />
        </Command>
      </SidebarMenuItem>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search article"
        description="Jump to a section or API operation in this document."
        className="max-w-xl"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search sections or API operations..."
        />
        <CommandList>
          <CommandEmpty>No matching sections or API operations.</CommandEmpty>
          {groups.map(group => (
            <Fragment key={group.id}>
              {group.command?.separator && (
                <CommandSeparator className="my-1" />
              )}
              {renderGroup(group)}
            </Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default ArticleCommand;
