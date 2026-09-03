import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  SearchRootShelfSortBy,
  SearchSortOrder,
  SearchStationSortBy,
  SearchSubShelfSortBy,
} from "@shared/api/graphql/generated/graphql";
import { cn } from "@shared/util/utils";
import type { UUID } from "crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchRootShelvesLazyQuery } from "@/api/graphql/hooks/useSearchShelves";
import { useSearchStationsLazyQuery } from "@/api/graphql/hooks/useSearchStations";
import { useSearchSubShelvesLazyQuery } from "@/api/graphql/hooks/useSearchSubShelves";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchOptionDetail {
  label: string;
  value: string | number | boolean | null | undefined;
}

interface SearchOption {
  id: string;
  label: string;
  description?: string;
  details?: SearchOptionDetail[];
}

interface LoadSearchOptionsResult {
  options: SearchOption[];
  cursor: string | null;
  hasMore: boolean;
}

interface SearchPickerProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  value: string;
  onValueChange: (id: string) => void;
  loadOptions: (input: {
    query: string;
    after?: string;
    first: number;
  }) => Promise<LoadSearchOptionsResult>;
}

const SearchOptionButton = ({
  option,
  isSelected,
  onSelect,
}: {
  option: SearchOption;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <HoverCard openDelay={250}>
      <HoverCardTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-auto min-h-9 w-full justify-start rounded-sm px-2 py-1.5 text-left",
            isSelected && "bg-accent text-accent-foreground"
          )}
          onClick={onSelect}
        >
          <span className="min-w-0">
            <span className="block truncate text-sm">{option.label}</span>
            {option.description && (
              <span className="block truncate text-muted-foreground text-xs">
                {option.description}
              </span>
            )}
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="z-[240] w-80 rounded-sm p-0"
      >
        <div className="border-b px-3 py-2">
          <p className="truncate text-sm font-medium">{option.label}</p>
          <p className="truncate font-mono text-muted-foreground text-xs">
            {option.id}
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto px-3 py-2">
          {(option.details ?? []).length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {t("workspace.payloadEditor.noExtraMetadata")}
            </p>
          ) : (
            <dl className="grid grid-cols-[112px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
              {option.details?.map(detail => {
                const value =
                  detail.value === undefined
                    ? null
                    : detail.value === null || detail.value === ""
                      ? t("workspace.period.none")
                      : String(detail.value);
                if (value === null) return null;
                return (
                  <div key={detail.label} className="contents">
                    <dt className="text-muted-foreground">{detail.label}</dt>
                    <dd className="min-w-0 truncate font-mono" title={value}>
                      {value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const SearchPicker = ({
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  value,
  onValueChange,
  loadOptions,
}: SearchPickerProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchOption | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const isLoadingRef = useRef(false);
  const lastRequestKeyRef = useRef<string | null>(null);

  const load = useCallback(
    async (reset: boolean) => {
      if (isLoadingRef.current) return;
      if (!reset && (!hasMore || !cursor)) return;

      const requestKey = `${reset ? "reset" : "page"}:${query.trim()}:${
        reset ? "" : cursor
      }`;
      if (lastRequestKeyRef.current === requestKey) return;
      lastRequestKeyRef.current = requestKey;

      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const result = await loadOptions({
          query: query.trim(),
          after: reset ? undefined : (cursor ?? undefined),
          first: reset ? 20 : 10,
        });

        setOptions(previousOptions => {
          if (reset) return result.options;
          const nextIds = new Set(result.options.map(option => option.id));
          return [
            ...previousOptions.filter(option => !nextIds.has(option.id)),
            ...result.options,
          ];
        });
        setCursor(result.cursor);
        setHasMore(result.hasMore);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [cursor, hasMore, loadOptions, query]
  );

  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(() => {
      void load(true);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [isOpen, query]);

  useEffect(() => {
    if (!value || selectedOption?.id === value) return;
    setSelectedOption(null);
  }, [selectedOption?.id, value]);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={open => {
          if (open) {
            setPortalContainer(
              (triggerRef.current?.closest(
                '[data-slot="dialog-content"], [data-slot="sheet-content"]'
              ) ?? null) as HTMLElement | null
            );
          }
          setIsOpen(open);
          if (!open) return;
          setQuery("");
          setOptions([]);
          setCursor(null);
          setHasMore(true);
          lastRequestKeyRef.current = null;
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            className="w-full justify-start rounded-sm"
          >
            <span className="truncate">
              {selectedOption?.id === value ? (
                selectedOption.label
              ) : value ? (
                value.length > 8 ? (
                  value.slice(0, 8)
                ) : (
                  value
                )
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-[220] flex h-80 w-[420px] origin-[--radix-popover-content-transform-origin] flex-col overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <div className="shrink-0 border-b p-2">
              <Input
                value={query}
                onChange={event => setQuery(event.currentTarget.value)}
                placeholder={searchPlaceholder}
                className="h-8"
              />
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto p-2"
              onScroll={event => {
                const element = event.currentTarget;
                if (
                  element.scrollTop + element.clientHeight <
                  element.scrollHeight - 24
                ) {
                  return;
                }
                void load(false);
              }}
            >
              {options.length === 0 ? (
                <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                  {isLoading
                    ? t("workspace.payloadEditor.searching")
                    : emptyLabel}
                </div>
              ) : (
                <div className="space-y-1">
                  {options.map(option => (
                    <SearchOptionButton
                      key={option.id}
                      option={option}
                      isSelected={value === option.id}
                      onSelect={() => {
                        setSelectedOption(option);
                        onValueChange(option.id);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {hasMore && (
              <div className="shrink-0 border-t px-3 py-2 text-center text-muted-foreground text-xs">
                {isLoading
                  ? t("workspace.payloadEditor.loadingMore")
                  : t("workspace.payloadEditor.scrollToLoadMore")}
              </div>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
};

export const RootShelfPicker = ({
  value,
  onValueChange,
  label,
}: {
  value: string;
  onValueChange: (id: string) => void;
  label?: string;
}) => {
  const { i18n, t } = useTranslation();
  const [executeSearchRootShelves] = useSearchRootShelvesLazyQuery();
  const loadOptions = useCallback(
    async ({
      query,
      after,
      first,
    }: {
      query: string;
      after?: string;
      first: number;
    }) => {
      const result = await executeSearchRootShelves({
        variables: {
          input: {
            query,
            after,
            first,
            sortBy: SearchRootShelfSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();

      return {
        options:
          result.data?.searchRootShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              permission: string;
              subShelfCount: number;
              itemCount: number;
              lastAnalyzedAt: Date | string | number;
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              ownerId: string;
              sharerIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              description: node.id,
              details: [
                {
                  label: t("workspace.payloadEditor.permission"),
                  value: node.permission,
                },
                {
                  label: t("workspace.payloadEditor.subShelves"),
                  value: node.subShelfCount,
                },
                {
                  label: t("workspace.payloadEditor.items"),
                  value: node.itemCount,
                },
                {
                  label: t("workspace.payloadEditor.ownerId"),
                  value: node.ownerId,
                },
                {
                  label: t("workspace.payloadEditor.sharers"),
                  value: node.sharerIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.itemIds"),
                  value: node.itemIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.lastAnalyzed"),
                  value: Number.isNaN(new Date(node.lastAnalyzedAt).getTime())
                    ? String(node.lastAnalyzedAt)
                    : new Date(node.lastAnalyzedAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.updated"),
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.created"),
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.deleted"),
                  value:
                    node.deletedAt === null
                      ? t("workspace.payloadEditor.no")
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(
                            i18n.resolvedLanguage
                          ),
                },
              ],
            };
          }) ?? [],
        cursor:
          result.data?.searchRootShelves.searchPageInfo
            .endEncodedSearchCursor ?? null,
        hasMore:
          result.data?.searchRootShelves.searchPageInfo.hasNextPage ?? false,
      };
    },
    [executeSearchRootShelves, i18n.resolvedLanguage, t]
  );

  return (
    <SearchPicker
      label={label ?? t("workspace.payloadEditor.rootShelfId")}
      placeholder={t("workspace.payloadEditor.selectRootShelf")}
      searchPlaceholder={t("workspace.payloadEditor.searchRootShelves")}
      emptyLabel={t("workspace.payloadEditor.noRootShelves")}
      value={value}
      onValueChange={onValueChange}
      loadOptions={loadOptions}
    />
  );
};

export const StationPicker = ({
  value,
  onValueChange,
  label,
}: {
  value: string;
  onValueChange: (id: string) => void;
  label?: string;
}) => {
  const { i18n, t } = useTranslation();
  const [executeSearchStations] = useSearchStationsLazyQuery();
  const loadOptions = useCallback(
    async ({
      query,
      after,
      first,
    }: {
      query: string;
      after?: string;
      first: number;
    }) => {
      const result = await executeSearchStations({
        variables: {
          input: {
            query,
            after,
            first,
            sortBy: SearchStationSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();

      return {
        options:
          result.data?.searchStations.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              permission: string;
              icon: string | null;
              headerBackgroundURL: string | null;
              routineCount: number;
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
            };
            return {
              id: node.id,
              label: node.name,
              description: node.id,
              details: [
                {
                  label: t("workspace.payloadEditor.permission"),
                  value: node.permission,
                },
                {
                  label: t("workspace.payloadEditor.routines"),
                  value: node.routineCount,
                },
                {
                  label: t("workspace.fields.icon"),
                  value: node.icon,
                },
                {
                  label: t("workspace.payloadEditor.header"),
                  value: node.headerBackgroundURL,
                },
                {
                  label: t("workspace.payloadEditor.updated"),
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.created"),
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.deleted"),
                  value:
                    node.deletedAt === null
                      ? t("workspace.payloadEditor.no")
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(
                            i18n.resolvedLanguage
                          ),
                },
              ],
            };
          }) ?? [],
        cursor:
          result.data?.searchStations.searchPageInfo.endEncodedSearchCursor ??
          null,
        hasMore:
          result.data?.searchStations.searchPageInfo.hasNextPage ?? false,
      };
    },
    [executeSearchStations, i18n.resolvedLanguage, t]
  );

  return (
    <SearchPicker
      label={label ?? t("workspace.payloadEditor.stationId")}
      placeholder={t("workspace.payloadEditor.selectStation")}
      searchPlaceholder={t("workspace.payloadEditor.searchStations")}
      emptyLabel={t("workspace.payloadEditor.noStations")}
      value={value}
      onValueChange={onValueChange}
      loadOptions={loadOptions}
    />
  );
};

export const SubShelfPicker = ({
  value,
  onValueChange,
  rootShelfId,
  label,
}: {
  value: string;
  onValueChange: (id: string) => void;
  rootShelfId?: string;
  label?: string;
}) => {
  const { i18n, t } = useTranslation();
  const [executeSearchSubShelves] = useSearchSubShelvesLazyQuery();
  const loadOptions = useCallback(
    async ({
      query,
      after,
      first,
    }: {
      query: string;
      after?: string;
      first: number;
    }) => {
      const result = await executeSearchSubShelves({
        variables: {
          input: {
            query,
            after,
            first,
            ...(rootShelfId ? { rootShelfId: rootShelfId as UUID } : {}),
            sortBy: SearchSubShelfSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();

      return {
        options:
          result.data?.searchSubShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              rootShelfId: string;
              prevSubShelfId: string | null;
              path: string[];
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              nextSubShelfIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              description: `${node.id} · ${t("workspace.payloadEditor.rootShelf")} ${node.rootShelfId.length > 8 ? node.rootShelfId.slice(0, 8) : node.rootShelfId}`,
              details: [
                {
                  label: t("workspace.payloadEditor.rootShelf"),
                  value: node.rootShelfId,
                },
                {
                  label: t("workspace.payloadEditor.previous"),
                  value: node.prevSubShelfId,
                },
                {
                  label: t("workspace.payloadEditor.pathDepth"),
                  value: node.path?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.children"),
                  value: node.nextSubShelfIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.items"),
                  value: node.itemIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.updated"),
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.created"),
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.deleted"),
                  value:
                    node.deletedAt === null
                      ? t("workspace.payloadEditor.no")
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(
                            i18n.resolvedLanguage
                          ),
                },
              ],
            };
          }) ?? [],
        cursor:
          result.data?.searchSubShelves.searchPageInfo.endEncodedSearchCursor ??
          null,
        hasMore:
          result.data?.searchSubShelves.searchPageInfo.hasNextPage ?? false,
      };
    },
    [executeSearchSubShelves, i18n.resolvedLanguage, rootShelfId, t]
  );

  return (
    <SearchPicker
      label={label ?? t("workspace.payloadEditor.subShelfId")}
      placeholder={t("workspace.payloadEditor.selectSubShelf")}
      searchPlaceholder={t("workspace.payloadEditor.searchSubShelves")}
      emptyLabel={t("workspace.payloadEditor.noSubShelves")}
      value={value}
      onValueChange={onValueChange}
      loadOptions={loadOptions}
    />
  );
};

export const ShelfLocationPicker = ({
  mode,
  label,
  placeholder,
  rootShelfId,
  subShelfId,
  onSelectRoot,
  onSelectSub,
}: {
  mode: "root-or-sub" | "sub-only";
  label: string;
  placeholder: string;
  rootShelfId: string;
  subShelfId: string;
  onSelectRoot?: (rootShelfId: string) => void;
  onSelectSub: (subShelfId: string, rootShelfId: string) => void;
}) => {
  const { i18n, t } = useTranslation();
  const [executeSearchRootShelves] = useSearchRootShelvesLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });
  const [executeSearchSubShelves] = useSearchSubShelvesLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [rootQuery, setRootQuery] = useState("");
  const [subShelfQuery, setSubShelfQuery] = useState("");
  const [rootOptions, setRootOptions] = useState<SearchOption[]>([]);
  const [subShelfOptions, setSubShelfOptions] = useState<
    Array<SearchOption & { rootShelfId: string }>
  >([]);
  const [rootCursor, setRootCursor] = useState<string | null>(null);
  const [subShelfCursor, setSubShelfCursor] = useState<string | null>(null);
  const [hasMoreRoots, setHasMoreRoots] = useState(true);
  const [hasMoreSubShelves, setHasMoreSubShelves] = useState(true);
  const [isLoadingRoots, setIsLoadingRoots] = useState(false);
  const [isLoadingSubShelves, setIsLoadingSubShelves] = useState(false);
  const [activeRootShelfId, setActiveRootShelfId] = useState("");
  const [selectedRootOption, setSelectedRootOption] =
    useState<SearchOption | null>(null);
  const [selectedSubShelfOption, setSelectedSubShelfOption] =
    useState<SearchOption | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const isLoadingRootsRef = useRef(false);
  const isLoadingSubShelvesRef = useRef(false);
  const lastRootRequestKeyRef = useRef<string | null>(null);
  const lastSubShelfRequestKeyRef = useRef<string | null>(null);

  const loadRoots = useCallback(
    async (reset: boolean) => {
      if (isLoadingRootsRef.current) return;
      if (!reset && (!hasMoreRoots || !rootCursor)) return;

      const requestKey = `${reset ? "reset" : "page"}:${rootQuery.trim()}:${
        reset ? "" : rootCursor
      }`;
      if (lastRootRequestKeyRef.current === requestKey) return;
      lastRootRequestKeyRef.current = requestKey;

      isLoadingRootsRef.current = true;
      setIsLoadingRoots(true);
      try {
        const result = await executeSearchRootShelves({
          variables: {
            input: {
              query: rootQuery.trim(),
              after: reset ? undefined : (rootCursor ?? undefined),
              first: reset ? 20 : 10,
              sortBy: SearchRootShelfSortBy.LastUpdate,
              sortOrder: SearchSortOrder.Desc,
            },
          },
        }).retain();
        const nextOptions =
          result.data?.searchRootShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              permission: string;
              subShelfCount: number;
              itemCount: number;
              lastAnalyzedAt: Date | string | number;
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              ownerId: string;
              sharerIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              description: node.id,
              details: [
                {
                  label: t("workspace.payloadEditor.permission"),
                  value: node.permission,
                },
                {
                  label: t("workspace.payloadEditor.subShelves"),
                  value: node.subShelfCount,
                },
                {
                  label: t("workspace.payloadEditor.items"),
                  value: node.itemCount,
                },
                {
                  label: t("workspace.payloadEditor.ownerId"),
                  value: node.ownerId,
                },
                {
                  label: t("workspace.payloadEditor.sharers"),
                  value: node.sharerIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.itemIds"),
                  value: node.itemIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.lastAnalyzed"),
                  value: Number.isNaN(new Date(node.lastAnalyzedAt).getTime())
                    ? String(node.lastAnalyzedAt)
                    : new Date(node.lastAnalyzedAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.updated"),
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.created"),
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.deleted"),
                  value:
                    node.deletedAt === null
                      ? t("workspace.payloadEditor.no")
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(
                            i18n.resolvedLanguage
                          ),
                },
              ],
            };
          }) ?? [];

        setRootOptions(previousOptions => {
          if (reset) return nextOptions;
          const nextIds = new Set(nextOptions.map(option => option.id));
          return [
            ...previousOptions.filter(option => !nextIds.has(option.id)),
            ...nextOptions,
          ];
        });
        setRootCursor(
          result.data?.searchRootShelves.searchPageInfo
            .endEncodedSearchCursor ?? null
        );
        setHasMoreRoots(
          result.data?.searchRootShelves.searchPageInfo.hasNextPage ?? false
        );
      } finally {
        isLoadingRootsRef.current = false;
        setIsLoadingRoots(false);
      }
    },
    [
      executeSearchRootShelves,
      hasMoreRoots,
      i18n.resolvedLanguage,
      rootCursor,
      rootQuery,
      t,
    ]
  );

  const loadSubShelves = useCallback(
    async (reset: boolean) => {
      if (!activeRootShelfId) return;
      if (isLoadingSubShelvesRef.current) return;
      if (!reset && (!hasMoreSubShelves || !subShelfCursor)) return;

      const requestKey = `${activeRootShelfId}:${
        reset ? "reset" : "page"
      }:${subShelfQuery.trim()}:${reset ? "" : subShelfCursor}`;
      if (lastSubShelfRequestKeyRef.current === requestKey) return;
      lastSubShelfRequestKeyRef.current = requestKey;

      isLoadingSubShelvesRef.current = true;
      setIsLoadingSubShelves(true);
      try {
        const result = await executeSearchSubShelves({
          variables: {
            input: {
              rootShelfId: activeRootShelfId as UUID,
              query: subShelfQuery.trim(),
              after: reset ? undefined : (subShelfCursor ?? undefined),
              first: reset ? 20 : 10,
              sortBy: SearchSubShelfSortBy.LastUpdate,
              sortOrder: SearchSortOrder.Desc,
            },
          },
        }).retain();
        const nextOptions =
          result.data?.searchSubShelves.searchEdges.map(edge => {
            const node = edge.node as unknown as {
              id: string;
              name: string;
              rootShelfId: string;
              prevSubShelfId: string | null;
              path: string[];
              deletedAt: Date | string | number | null;
              updatedAt: Date | string | number;
              createdAt: Date | string | number;
              nextSubShelfIds: string[];
              itemIds: string[];
            };
            return {
              id: node.id,
              label: node.name,
              rootShelfId: node.rootShelfId,
              description: node.id,
              details: [
                {
                  label: t("workspace.payloadEditor.rootShelf"),
                  value: node.rootShelfId,
                },
                {
                  label: t("workspace.payloadEditor.previous"),
                  value: node.prevSubShelfId,
                },
                {
                  label: t("workspace.payloadEditor.pathDepth"),
                  value: node.path?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.children"),
                  value: node.nextSubShelfIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.items"),
                  value: node.itemIds?.length ?? 0,
                },
                {
                  label: t("workspace.payloadEditor.updated"),
                  value: Number.isNaN(new Date(node.updatedAt).getTime())
                    ? String(node.updatedAt)
                    : new Date(node.updatedAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.created"),
                  value: Number.isNaN(new Date(node.createdAt).getTime())
                    ? String(node.createdAt)
                    : new Date(node.createdAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                },
                {
                  label: t("workspace.payloadEditor.deleted"),
                  value:
                    node.deletedAt === null
                      ? t("workspace.payloadEditor.no")
                      : Number.isNaN(new Date(node.deletedAt).getTime())
                        ? String(node.deletedAt)
                        : new Date(node.deletedAt).toLocaleString(
                            i18n.resolvedLanguage
                          ),
                },
              ],
            };
          }) ?? [];

        setSubShelfOptions(previousOptions => {
          if (reset) return nextOptions;
          const nextIds = new Set(nextOptions.map(option => option.id));
          return [
            ...previousOptions.filter(option => !nextIds.has(option.id)),
            ...nextOptions,
          ];
        });
        setSubShelfCursor(
          result.data?.searchSubShelves.searchPageInfo.endEncodedSearchCursor ??
            null
        );
        setHasMoreSubShelves(
          result.data?.searchSubShelves.searchPageInfo.hasNextPage ?? false
        );
      } finally {
        isLoadingSubShelvesRef.current = false;
        setIsLoadingSubShelves(false);
      }
    },
    [
      activeRootShelfId,
      executeSearchSubShelves,
      hasMoreSubShelves,
      i18n.resolvedLanguage,
      subShelfCursor,
      subShelfQuery,
      t,
    ]
  );

  useEffect(() => {
    if (!isOpen) return;
    const timeout = window.setTimeout(() => {
      void loadRoots(true);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [isOpen, rootQuery]);

  useEffect(() => {
    if (!isOpen || !activeRootShelfId) return;
    const timeout = window.setTimeout(() => {
      void loadSubShelves(true);
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [activeRootShelfId, isOpen, subShelfQuery]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeRootShelfId) return;
    if (rootShelfId) {
      setActiveRootShelfId(rootShelfId);
      return;
    }
    if (rootOptions[0]) {
      setActiveRootShelfId(rootOptions[0].id);
    }
  }, [activeRootShelfId, isOpen, rootOptions, rootShelfId]);

  useEffect(() => {
    setSubShelfOptions([]);
    setSubShelfCursor(null);
    setHasMoreSubShelves(true);
  }, [activeRootShelfId]);

  const triggerLabel = (() => {
    if (selectedSubShelfOption?.id === subShelfId) {
      return selectedSubShelfOption.label;
    }
    if (mode === "root-or-sub" && selectedRootOption?.id === rootShelfId) {
      return selectedRootOption.label;
    }
    if (subShelfId)
      return subShelfId.length > 8 ? subShelfId.slice(0, 8) : subShelfId;
    if (mode === "root-or-sub" && rootShelfId)
      return rootShelfId.length > 8 ? rootShelfId.slice(0, 8) : rootShelfId;
    return "";
  })();

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={open => {
          if (open) {
            setPortalContainer(
              (triggerRef.current?.closest(
                '[data-slot="dialog-content"], [data-slot="sheet-content"]'
              ) ?? null) as HTMLElement | null
            );
          }
          setIsOpen(open);
          if (!open) return;
          setRootQuery("");
          setSubShelfQuery("");
          setRootOptions([]);
          setSubShelfOptions([]);
          setRootCursor(null);
          setSubShelfCursor(null);
          setHasMoreRoots(true);
          setHasMoreSubShelves(true);
          lastRootRequestKeyRef.current = null;
          lastSubShelfRequestKeyRef.current = null;
          setActiveRootShelfId(rootShelfId);
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            className="w-full justify-start rounded-sm"
          >
            <span className="truncate">
              {triggerLabel || (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-[220] w-[620px] origin-[--radix-popover-content-transform-origin] overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <div className="grid h-96 grid-cols-[240px_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col border-r">
                <div className="shrink-0 border-b p-2">
                  <Input
                    value={rootQuery}
                    onChange={event => setRootQuery(event.currentTarget.value)}
                    placeholder={t("workspace.payloadEditor.searchRootShelves")}
                    className="h-8"
                  />
                </div>
                <div
                  className="min-h-0 flex-1 overflow-y-auto p-2"
                  onScroll={event => {
                    const element = event.currentTarget;
                    if (
                      element.scrollTop + element.clientHeight <
                      element.scrollHeight - 24
                    ) {
                      return;
                    }
                    void loadRoots(false);
                  }}
                >
                  <div className="px-2 py-1.5 text-muted-foreground text-xs">
                    {t("workspace.trash.rootShelves")}
                  </div>
                  {rootOptions.length === 0 ? (
                    <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                      {isLoadingRoots
                        ? t("workspace.payloadEditor.searching")
                        : t("workspace.payloadEditor.noRootShelves")}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {rootOptions.map(option => (
                        <SearchOptionButton
                          key={option.id}
                          option={option}
                          isSelected={activeRootShelfId === option.id}
                          onSelect={() => {
                            setActiveRootShelfId(option.id);
                            setSelectedRootOption(option);
                            if (mode === "root-or-sub") {
                              setSelectedSubShelfOption(null);
                              onSelectRoot?.(option.id);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="shrink-0 border-b p-2">
                  <Input
                    value={subShelfQuery}
                    onChange={event =>
                      setSubShelfQuery(event.currentTarget.value)
                    }
                    placeholder={t("workspace.payloadEditor.searchSubShelves")}
                    className="h-8"
                    disabled={!activeRootShelfId}
                  />
                </div>
                <div
                  className="min-h-0 flex-1 overflow-y-auto p-2"
                  onScroll={event => {
                    const element = event.currentTarget;
                    if (
                      element.scrollTop + element.clientHeight <
                      element.scrollHeight - 24
                    ) {
                      return;
                    }
                    void loadSubShelves(false);
                  }}
                >
                  <div className="px-2 py-1.5 text-muted-foreground text-xs">
                    {t("workspace.trash.subShelves")}
                  </div>
                  {!activeRootShelfId ? (
                    <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                      {t("workspace.payloadEditor.selectARootShelf")}
                    </div>
                  ) : subShelfOptions.length === 0 ? (
                    <div className="px-2 py-8 text-center text-muted-foreground text-xs">
                      {isLoadingSubShelves
                        ? t("workspace.payloadEditor.searching")
                        : t("workspace.payloadEditor.noSubShelves")}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {subShelfOptions.map(option => (
                        <SearchOptionButton
                          key={option.id}
                          option={option}
                          isSelected={subShelfId === option.id}
                          onSelect={() => {
                            setSelectedSubShelfOption(option);
                            onSelectSub(option.id, option.rootShelfId);
                            setIsOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
};
