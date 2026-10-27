import {
  type FragmentedBasicPrivateBlockPackFragment,
  type FragmentedBasicPrivateMaterialFragment,
  type FragmentedBasicPrivateRootShelfFragment,
  type FragmentedBasicPrivateSearchableRoutineFragment,
  type FragmentedBasicPrivateSearchableStationFragment,
  type FragmentedBasicPrivateSubShelfFragment,
  type SearchBlockPacksQuery,
  type SearchMaterialsQuery,
  type SearchRootShelvesQuery,
  type SearchRoutinesQuery,
  type SearchStationsQuery,
  type SearchSubShelvesQuery,
} from "@shared/api/graphql/generated/graphql";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";
import { ArchiveRestoreIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import DeleteShelfItemDialog from "@/components/dialogs/ShelfItemDialog/DeleteShelfItemDialog";
import {
  BlockPackIcon,
  MaterialIcon,
  RootShelfIcon,
  RoutineIcon,
  StationIcon,
  SubShelfIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDebounceValue } from "@/hooks/useDebounce";
import {
  getTrashEntryKey,
  type TrashEntry,
  useTrashActions,
} from "./useTrashActions";

type TrashItemType = TrashEntry["type"];

type TrashSearchData = {
  rootShelfSearch: SearchRootShelvesQuery;
  subShelfSearch: SearchSubShelvesQuery;
  materialSearch: SearchMaterialsQuery;
  blockPackSearch: SearchBlockPacksQuery;
  stationSearch: SearchStationsQuery;
  routineSearch: SearchRoutinesQuery;
};

const typeMetadata = {
  rootShelf: { icon: RootShelfIcon, labelKey: "rootShelf" },
  subShelf: { icon: SubShelfIcon, labelKey: "subShelf" },
  material: { icon: MaterialIcon, labelKey: "material" },
  blockPack: { icon: BlockPackIcon, labelKey: "blockPack" },
  station: { icon: StationIcon, labelKey: "station" },
  routine: { icon: RoutineIcon, labelKey: "routine" },
} as const;

const TrashPage = ({
  query: initialQuery,
  searchData,
  onQueryChange,
  onChanged,
}: {
  query: string;
  searchData: TrashSearchData;
  onQueryChange: (query: string) => void;
  onChanged: () => Promise<void>;
}) => {
  const { i18n, t } = useTranslation();
  const sidebarManager = useSidebar();
  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<TrashItemType | "all">(
    "all"
  );
  const debouncedQuery = useDebounceValue(query);
  const submittedQuery = useRef(initialQuery);
  const actions = useTrashActions(onChanged);
  const [deleteTargets, setDeleteTargets] = useState<TrashEntry[]>([]);
  const [selectedEntryKeys, setSelectedEntryKeys] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (initialQuery !== submittedQuery.current) {
      submittedQuery.current = initialQuery;
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (query !== debouncedQuery || debouncedQuery === submittedQuery.current)
      return;
    submittedQuery.current = debouncedQuery;
    onQueryChange(debouncedQuery);
  }, [debouncedQuery, query, onQueryChange]);

  const entries = useMemo<TrashEntry[]>(
    () => [
      ...searchData.rootShelfSearch.searchRootShelves.searchEdges.map(edge => {
        const node = edge.node as FragmentedBasicPrivateRootShelfFragment;
        return { ...node, type: "rootShelf" as const };
      }),
      ...searchData.subShelfSearch.searchSubShelves.searchEdges.map(edge => {
        const node = edge.node as FragmentedBasicPrivateSubShelfFragment;
        return { ...node, type: "subShelf" as const };
      }),
      ...searchData.materialSearch.searchMaterials.searchEdges.map(edge => {
        const node = edge.node as FragmentedBasicPrivateMaterialFragment;
        return { ...node, type: "material" as const };
      }),
      ...searchData.blockPackSearch.searchBlockPacks.searchEdges.map(edge => {
        const node = edge.node as FragmentedBasicPrivateBlockPackFragment;
        return { ...node, type: "blockPack" as const };
      }),
      ...searchData.stationSearch.searchStations.searchEdges.map(edge => {
        const node =
          edge.node as FragmentedBasicPrivateSearchableStationFragment;
        return { ...node, type: "station" as const };
      }),
      ...searchData.routineSearch.searchRoutines.searchEdges.map(edge => {
        const node =
          edge.node as FragmentedBasicPrivateSearchableRoutineFragment;
        return {
          ...node,
          name: node.title,
          type: "routine" as const,
        };
      }),
    ],
    [searchData]
  );
  const visibleEntries = entries
    .filter(
      entry =>
        entry.deletedAt &&
        !actions.completedEntries.has(getTrashEntryKey(entry))
    )
    .filter(entry => selectedType === "all" || entry.type === selectedType)
    .sort(
      (left, right) =>
        new Date(right.deletedAt ?? 0).getTime() -
        new Date(left.deletedAt ?? 0).getTime()
    );
  const selectedEntries = visibleEntries.filter(entry =>
    selectedEntryKeys.has(getTrashEntryKey(entry))
  );
  const pendingDeleteTargets = deleteTargets.filter(
    entry => !actions.completedEntries.has(getTrashEntryKey(entry))
  );

  return (
    <main
      className={
        sidebarManager.isMobile
          ? "h-full min-h-0 overflow-y-auto bg-canvas px-4 pt-12 pb-8 sm:px-6 lg:px-10"
          : "h-full min-h-0 overflow-y-auto bg-canvas px-4 py-8 sm:px-6 lg:px-10"
      }
    >
      {sidebarManager.isMobile && (
        <SidebarTrigger className="fixed top-2 left-2 z-40 border-none bg-transparent" />
      )}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-10">
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
              <Trash2Icon className="size-6" />
              {t("workspace.trash.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("workspace.trash.description")}
            </p>
          </div>
        </header>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={t("workspace.trash.searchPlaceholder")}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t("workspace.trash.searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto rounded-md border border-border bg-card p-1">
          <ToggleGroup
            type="single"
            value={selectedType}
            onValueChange={value => {
              if (value) setSelectedType(value as TrashItemType | "all");
            }}
            className="w-max min-w-full justify-start"
          >
            {(
              [
                ["all", "all"],
                ["rootShelf", "rootShelves"],
                ["subShelf", "subShelves"],
                ["material", "materials"],
                ["blockPack", "blockPacks"],
                ["station", "stations"],
                ["routine", "routines"],
              ] as const
            ).map(([value, labelKey]) => (
              <ToggleGroupItem
                key={value}
                value={value}
                variant="outline"
                size="sm"
                className="h-8 flex-none rounded-sm px-3 text-xs data-[state=on]:bg-accent data-[state=on]:text-accent-foreground border-none"
              >
                {t(`workspace.trash.${labelKey}` as never)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <label className="flex min-w-0 items-center gap-2 text-sm">
            <Checkbox
              checked={
                selectedEntries.length > 0 &&
                selectedEntries.length === visibleEntries.length
                  ? true
                  : selectedEntries.length > 0
                    ? "indeterminate"
                    : false
              }
              disabled={
                visibleEntries.length === 0 || actions.pendingEntry !== null
              }
              onCheckedChange={checked =>
                setSelectedEntryKeys(
                  new Set(
                    checked === true ? visibleEntries.map(getTrashEntryKey) : []
                  )
                )
              }
            />
            {t("workspace.trash.selectVisible")}
          </label>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={
                selectedEntries.length === 0 || actions.pendingEntry !== null
              }
              onClick={() => {
                void actions
                  .perform(selectedEntries, "restore")
                  .then(completed => {
                    if (completed) setSelectedEntryKeys(new Set());
                  })
                  .catch(error => toast.error(tError(error, t)));
              }}
            >
              {t("workspace.trash.restoreSelected")}
            </Button>
            <Button
              variant="destructive"
              disabled={
                selectedEntries.length === 0 || actions.pendingEntry !== null
              }
              onClick={() => setDeleteTargets(selectedEntries)}
            >
              {t("workspace.trash.deleteSelected")}
            </Button>
          </div>
        </div>

        <section className="border-y border-border">
          {visibleEntries.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
              <Trash2Icon className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">
                {t("workspace.trash.emptyTitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("workspace.trash.emptyDescription")}
              </p>
            </div>
          ) : (
            visibleEntries.map(entry => {
              const metadata = typeMetadata[entry.type];
              const Icon = metadata.icon;

              return (
                <div
                  key={`${entry.type}-${entry.id}`}
                  className="flex min-w-0 items-center gap-3 border-b border-border px-1 py-4 last:border-b-0"
                >
                  <Checkbox
                    aria-label={t("workspace.trash.selectItem", {
                      name: entry.name ?? t("workspace.trash.untitled"),
                    })}
                    checked={selectedEntryKeys.has(getTrashEntryKey(entry))}
                    disabled={actions.pendingEntry !== null}
                    onCheckedChange={checked =>
                      setSelectedEntryKeys(previous => {
                        const selected = new Set(previous);
                        if (checked === true)
                          selected.add(getTrashEntryKey(entry));
                        else selected.delete(getTrashEntryKey(entry));
                        return selected;
                      })
                    }
                  />
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.name ?? t("workspace.trash.untitled")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(`workspace.trash.${metadata.labelKey}` as never)} ·{" "}
                      {entry.deletedAt
                        ? t("workspace.trash.deletedAt", {
                            date: new Date(entry.deletedAt).toLocaleString(
                              i18n.resolvedLanguage
                            ),
                          })
                        : t("workspace.trash.unknownTime")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={t("workspace.trash.restore")}
                      title={t("workspace.trash.restore")}
                      disabled={actions.pendingEntry !== null}
                      onClick={() => {
                        void actions
                          .perform([entry], "restore")
                          .catch(error => toast.error(tError(error, t)));
                      }}
                    >
                      {actions.pendingEntry === getTrashEntryKey(entry) ? (
                        <Spinner />
                      ) : (
                        <ArchiveRestoreIcon
                          aria-hidden="true"
                          className="size-4"
                        />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      aria-label={t("workspace.trash.hardDelete")}
                      title={t("workspace.trash.hardDelete")}
                      disabled={actions.pendingEntry !== null}
                      onClick={() => setDeleteTargets([entry])}
                    >
                      <Trash2Icon aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
      {pendingDeleteTargets.length > 0 && (
        <DeleteShelfItemDialog
          isOpen
          onClose={() => setDeleteTargets([])}
          onCancel={() => setDeleteTargets([])}
          dialogHeader={
            pendingDeleteTargets.length === 1
              ? t("workspace.trash.hardDeleteTitle")
              : t("workspace.trash.hardDeleteItemsTitle", {
                  count: pendingDeleteTargets.length,
                })
          }
          dialogDescription={
            pendingDeleteTargets.length === 1
              ? t("workspace.trash.hardDeleteDescription", {
                  name: pendingDeleteTargets[0].name,
                })
              : t("workspace.trash.hardDeleteItemsDescription", {
                  count: pendingDeleteTargets.length,
                })
          }
          confirmKeyword="DELETE"
          inputPlaceholder={t("workspace.menu.typeDelete")}
          confirmLabel={t("workspace.trash.hardDelete")}
          onDelete={async () => {
            const completed = await actions.perform(
              pendingDeleteTargets,
              "hardDelete"
            );
            if (completed)
              setSelectedEntryKeys(previous => {
                const selected = new Set(previous);
                for (const entry of deleteTargets)
                  selected.delete(getTrashEntryKey(entry));
                return selected;
              });
            return completed;
          }}
        />
      )}
    </main>
  );
};

export default TrashPage;
