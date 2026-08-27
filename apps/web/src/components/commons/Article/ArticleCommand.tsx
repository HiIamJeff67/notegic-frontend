import { BlocksIcon, Code2Icon, FileTextIcon } from "lucide-react";
import {
  type ComponentType,
  Fragment,
  type RefObject,
  useEffect,
  useState,
} from "react";
import {
  BlockPackIcon,
  MaterialIcon,
  RootShelfIcon,
  RoutineIcon,
  RoutineTagIcon,
  RoutineTaskIcon,
  StationIcon,
  SubShelfIcon,
} from "@/components/icons/WorkspaceEntityIcons";
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
};

type ArticleCommandProps = {
  articleRef: RefObject<HTMLElement | null>;
  onSelect: (id: string) => void;
};

const domainIcons: Record<string, ArticleIcon> = {
  "gateway-root-shelves": RootShelfIcon,
  "gateway-sub-shelves": SubShelfIcon,
  "gateway-materials": MaterialIcon,
  "gateway-block-packs": BlockPackIcon,
  "gateway-blocks": BlocksIcon,
  "gateway-stations": StationIcon,
  "gateway-routines": RoutineIcon,
  "gateway-routine-tasks": RoutineTaskIcon,
  "gateway-routine-tags": RoutineTagIcon,
};

const separatorGroupIds = new Set(Object.keys(domainIcons));

const methodClassName: Record<string, string> = {
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-300",
  GET: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  PATCH: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  POST: "bg-yellow-500/20 text-yellow-800 dark:text-yellow-300",
  PUT: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
};

const MethodBadge = ({ method }: { method: string }) => (
  <span
    className={`inline-flex min-w-10 justify-center rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold ${methodClassName[method] ?? "bg-muted text-muted-foreground"}`}
  >
    {method}
  </span>
);

const ArticleCommand = ({ articleRef, onSelect }: ArticleCommandProps) => {
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

    const sections = Array.from(
      articleRef.current?.querySelectorAll<HTMLElement>(
        "section[id][data-article-level]"
      ) ?? []
    );
    const sectionGroups = new Map<string, ArticleCommandGroup>();
    const rootGroups: ArticleCommandGroup[] = [];

    for (const section of sections) {
      const heading = section.querySelector<HTMLElement>("h1, h2, h3");
      const title = heading?.textContent?.trim();
      if (!title || sectionGroups.has(section.id)) continue;

      const isDocumentOverview = section.id === "overview";
      const level = Number(section.dataset.articleLevel ?? 0);
      const groupTitle =
        isDocumentOverview && level === 0 ? `${title} Overview` : title;
      sectionGroups.set(section.id, {
        id: section.id,
        title: groupTitle,
        level,
        icon: domainIcons[section.id],
        items: [
          {
            id: section.id,
            title:
              section.id === "gateway-contract"
                ? "Contract"
                : level === 0
                  ? groupTitle
                  : `${title} Overview`,
            icon: domainIcons[section.id],
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
        searchText: operation.dataset.articleOperationSummary,
        method: operation.dataset.articleOperationMethod,
        icon: Code2Icon,
      });
    }

    setGroups(rootGroups);
  }, [articleRef, open]);

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
    const ItemIcon = item.icon ?? group.icon ?? FileTextIcon;
    return (
      <CommandItem
        key={`${group.id}-${item.id}`}
        className={className}
        value={`${group.title} ${item.title} ${item.description ?? ""} ${item.searchText ?? ""}`}
        onSelect={() => handleSelect(item.id)}
      >
        {item.method && <MethodBadge method={item.method} />}
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

  const renderStandaloneItem = (
    group: ArticleCommandGroup,
    item: ArticleCommandItem
  ) => renderItem(group, item, "mx-2 my-0.5");

  const renderGroup = (group: ArticleCommandGroup, depth = 0) => {
    const hasQuery = Boolean(query.trim());
    const isPrivacyGroup = group.id === "privacy-policy";
    const privacyItems = group.children.flatMap(child => {
      const item = child.items[0];
      return item ? [{ ...item, title: child.title }] : [];
    });
    const items = isPrivacyGroup ? privacyItems : group.items;
    const visibleItems = items.filter(
      (_, itemIndex) => hasQuery || itemIndex < 5
    );
    const children = isPrivacyGroup ? [] : group.children;
    const visibleChildren = children
      .map(child => {
        const childIsGroup =
          child.children.length > 0 || child.items.length > 1;
        return (
          <Fragment key={child.id}>
            {childIsGroup && separatorGroupIds.has(child.id) && (
              <CommandSeparator className="my-1" />
            )}
            {renderGroup(child, depth + 1)}
          </Fragment>
        );
      })
      .filter(Boolean);

    if (visibleItems.length === 0 && visibleChildren.length === 0) {
      return null;
    }

    const isRuleGroup = group.id.startsWith("gateway-rule-");
    const isStandaloneLeaf =
      !isRuleGroup && group.children.length === 0 && group.items.length === 1;
    if (isStandaloneLeaf) {
      const item = visibleItems[0];
      return item
        ? depth === 0
          ? renderStandaloneItem(group, item)
          : renderItem(group, item)
        : null;
    }

    const groupItems =
      group.children.length > 0 && group.level > 0 ? [] : visibleItems;

    return (
      <CommandGroup
        key={group.id}
        heading={group.title}
        className={depth > 0 ? "mt-1 px-2" : "my-1 px-2"}
      >
        {groupItems.map(item => renderItem(group, item))}
        {visibleChildren}
      </CommandGroup>
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
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
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
              {separatorGroupIds.has(group.id) && (
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
