import {
  SearchRoutineTaskSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTasksLazyQuery } from "@/api/graphql/hooks/useSearchRoutineTasks";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { UUID } from "crypto";
import { SquarePen } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RoutineTaskIcon } from "@/components/icons/WorkspaceEntityIcons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStationRoutine } from "@/hooks";
import { translateRoutineTaskPurpose } from "@shared/i18n/workspace";

const RoutineTaskTable = () => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const [executeSearchRoutineTasks, routineTaskSearch] =
    useSearchRoutineTasksLazyQuery({
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    });
  const [routineTasks, setRoutineTasks] = useState<
    Array<
      RoutineTaskNode & {
        linkedRoutineIds: UUID[];
        linkedRoutines: Array<{ id: UUID; tagIds: UUID[] }>;
      }
    >
  >([]);
  const [routineTaskTotalCount, setRoutineTaskTotalCount] = useState<number>(0);
  const [routineTaskSearchCursor, setRoutineTaskSearchCursor] = useState<
    string | null
  >(null);
  const [hasMoreRoutineTasks, setHasMoreRoutineTasks] = useState<boolean>(true);
  const [isSearchingRoutineTasks, setIsSearchingRoutineTasks] =
    useState<boolean>(false);
  const isSearchingRoutineTasksRef = useRef<boolean>(false);
  const hasExecutedInitialSearchRef = useRef<boolean>(false);
  const [purpose, setPurpose] = useState<RoutineTaskPurpose | "All">("All");
  const [routineId, setRoutineId] = useState<UUID | "All" | "Unlinked">("All");
  const effectiveStationIds =
    stationRoutineManager.viewMode === "station" &&
    stationRoutineManager.activeStationId
      ? [stationRoutineManager.activeStationId]
      : stationRoutineManager.presence.stationIds;
  const stationPresenceSignature = effectiveStationIds.join("|");
  const routineTagPresenceSignature =
    stationRoutineManager.presence.routineTagIds.join("|");
  const routineLookupSignature = stationRoutineManager.routines
    .map(
      routine =>
        `${routine.id}:${routine.stationId}:${routine.routineTagIds.join(",")}`
    )
    .join("|");

  const applySearchRoutineTasksData = useCallback(
    (data?: any): void => {
      const selectedStationIds = new Set(effectiveStationIds);
      const searchedRoutineTasks = (data?.searchRoutineTasks.searchEdges ?? [])
        .map((edge: any) => {
          const node = edge.node as unknown as {
            id: UUID;
            routineId: UUID;
            title: string;
            purpose: string;
            costUnit: number;
            priority: number;
            maxAttempts: number;
            previousRoutineTaskIds: UUID[];
            updatedAt: Date | string | number;
            createdAt: Date | string | number;
          };
          const linkedRoutine = stationRoutineManager.getRoutineById(
            node.routineId
          );
          if (
            stationRoutineManager.stations.length > 0 &&
            linkedRoutine &&
            !selectedStationIds.has(linkedRoutine.stationId)
          ) {
            return null;
          }
          const linkedRoutineIds = [node.routineId];
          const routineTask: RoutineTaskNode & {
            linkedRoutineIds: UUID[];
            linkedRoutines: Array<{ id: UUID; tagIds: UUID[] }>;
          } = {
            id: node.id,
            routineId: node.routineId,
            stationId: linkedRoutine?.stationId ?? ("" as UUID),
            title: node.title,
            purpose: node.purpose.replace(
              "RoutineTaskPurpose_",
              ""
            ) as RoutineTaskPurpose,
            payload: {},
            costUnit: node.costUnit,
            priority: node.priority,
            maxAttempts: node.maxAttempts,
            previousRoutineTaskIds: node.previousRoutineTaskIds,
            updatedAt: new Date(node.updatedAt),
            createdAt: new Date(node.createdAt),
            linkedRoutineIds,
            linkedRoutines: linkedRoutine
              ? [
                  {
                    id: linkedRoutine.id,
                    tagIds: linkedRoutine.routineTagIds,
                  },
                ]
              : [],
          };
          return routineTask;
        })
        .filter(
          (
            routineTask:
              | (RoutineTaskNode & {
                  linkedRoutineIds: UUID[];
                  linkedRoutines: Array<{ id: UUID; tagIds: UUID[] }>;
                })
              | null
          ): routineTask is RoutineTaskNode & {
            linkedRoutineIds: UUID[];
            linkedRoutines: Array<{ id: UUID; tagIds: UUID[] }>;
          } => routineTask !== null
        );

      setRoutineTasks(searchedRoutineTasks);
      setRoutineTaskTotalCount(data?.searchRoutineTasks.totalCount ?? 0);
      setRoutineTaskSearchCursor(
        data?.searchRoutineTasks.searchPageInfo.endEncodedSearchCursor ?? null
      );
      setHasMoreRoutineTasks(
        data?.searchRoutineTasks.searchPageInfo.hasNextPage ?? false
      );
    },
    [
      stationPresenceSignature,
      stationRoutineManager.getRoutineById,
      routineLookupSignature,
      stationRoutineManager.stations.length,
    ]
  );

  const searchRoutineTasks = useCallback(
    async (reset: boolean): Promise<void> => {
      if (isSearchingRoutineTasksRef.current) return;
      if (!reset && (!hasMoreRoutineTasks || !routineTaskSearchCursor)) return;
      if (
        stationRoutineManager.stations.length > 0 &&
        effectiveStationIds.length === 0
      ) {
        if (reset) {
          setRoutineTasks([]);
          setRoutineTaskTotalCount(0);
          setRoutineTaskSearchCursor(null);
          setHasMoreRoutineTasks(false);
        }
        return;
      }

      isSearchingRoutineTasksRef.current = true;
      setIsSearchingRoutineTasks(true);
      try {
        const variables = {
          input: {
            query: stationRoutineManager.presence.query,
            after: reset ? undefined : (routineTaskSearchCursor ?? undefined),
            first: reset ? 20 : 10,
            routineIds: [],
            sortBy: SearchRoutineTaskSortBy.Title,
            sortOrder: SearchSortOrder.Asc,
          },
        };

        if (reset || !hasExecutedInitialSearchRef.current) {
          hasExecutedInitialSearchRef.current = true;
          await executeSearchRoutineTasks({ variables }).retain();
        } else {
          await routineTaskSearch.fetchMore({
            variables,
            updateQuery: (previous, { fetchMoreResult }) => {
              if (!fetchMoreResult) return previous;
              const existingRoutineTaskIds = new Set(
                previous.searchRoutineTasks.searchEdges.map(edge => {
                  const node = edge.node as unknown as { id: UUID };
                  return node.id;
                })
              );
              return {
                ...fetchMoreResult,
                searchRoutineTasks: {
                  ...fetchMoreResult.searchRoutineTasks,
                  searchEdges: [
                    ...previous.searchRoutineTasks.searchEdges,
                    ...fetchMoreResult.searchRoutineTasks.searchEdges.filter(
                      edge => {
                        const node = edge.node as unknown as { id: UUID };
                        return !existingRoutineTaskIds.has(node.id);
                      }
                    ),
                  ],
                },
              };
            },
          });
        }
      } finally {
        isSearchingRoutineTasksRef.current = false;
        setIsSearchingRoutineTasks(false);
      }
    },
    [
      executeSearchRoutineTasks,
      stationPresenceSignature,
      hasMoreRoutineTasks,
      routineTaskSearchCursor,
      stationRoutineManager.presence.query,
      stationRoutineManager.stations.length,
      stationRoutineManager.viewMode,
      routineTaskSearch.fetchMore,
    ]
  );

  useEffect(() => {
    if (!routineTaskSearch.data) return;
    applySearchRoutineTasksData(routineTaskSearch.data);
  }, [applySearchRoutineTasksData, routineTaskSearch.data]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void searchRoutineTasks(true);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [stationRoutineManager.presence.query, stationPresenceSignature]);

  const filteredRoutineTasks = useMemo(() => {
    return routineTasks.filter(routineTask => {
      if (purpose !== "All" && routineTask.purpose !== purpose) return false;

      const selectedRoutineTagIds = new Set(
        stationRoutineManager.presence.routineTagIds
      );
      const isAllRoutineTagsVisible =
        stationRoutineManager.routineTags.length === selectedRoutineTagIds.size;
      const shouldFilterByRoutineTags =
        stationRoutineManager.routineTags.length > 0 &&
        (!isAllRoutineTagsVisible ||
          !stationRoutineManager.presence.showUntaggedRoutines);
      if (shouldFilterByRoutineTags) {
        const isRoutineTaskPresent = routineTask.linkedRoutines.some(
          routine => {
            if (routine.tagIds.length === 0) {
              return stationRoutineManager.presence.showUntaggedRoutines;
            }
            if (isAllRoutineTagsVisible) return true;
            return routine.tagIds.some(routineTagId =>
              selectedRoutineTagIds.has(routineTagId)
            );
          }
        );
        if (!isRoutineTaskPresent) return false;
      }

      const linkedRoutineIds = routineTask.linkedRoutineIds;
      if (routineId === "Unlinked" && linkedRoutineIds.length > 0) {
        return false;
      }
      if (
        routineId !== "All" &&
        routineId !== "Unlinked" &&
        !linkedRoutineIds.includes(routineId)
      ) {
        return false;
      }

      return true;
    });
  }, [
    routineId,
    routineTagPresenceSignature,
    routineTasks,
    purpose,
    stationRoutineManager.presence.showUntaggedRoutines,
    stationRoutineManager.routineTags.length,
  ]);

  return (
    <section className="@container flex max-h-[480px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
      <div className="flex min-h-11 select-none items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2 @max-[1040px]:flex-col @max-[1040px]:items-start">
        <div className="flex min-w-0 items-center gap-2">
          <RoutineTaskIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            {t("workspace.table.routineTaskTable")}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredRoutineTasks.length}
            <span className="px-0.5">|</span>
            {routineTaskTotalCount}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 @max-[1040px]:grid @max-[1040px]:w-full @max-[1040px]:grid-cols-[repeat(auto-fit,minmax(6.75rem,1fr))] @max-[1040px]:justify-start">
          <Select
            value={purpose}
            onValueChange={value =>
              setPurpose(value as RoutineTaskPurpose | "All")
            }
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-40 min-w-0 rounded-sm text-xs @max-[1040px]:w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              <SelectItem value="All">
                {t("workspace.table.allPurpose")}
              </SelectItem>
              {Object.values(RoutineTaskPurpose).map(routineTaskPurpose => (
                <SelectItem key={routineTaskPurpose} value={routineTaskPurpose}>
                  {translateRoutineTaskPurpose(routineTaskPurpose, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={routineId}
            onValueChange={value =>
              setRoutineId(value as UUID | "All" | "Unlinked")
            }
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-44 min-w-0 rounded-sm text-xs @max-[1040px]:w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              <SelectItem value="All">
                {t("workspace.table.allRoutines")}
              </SelectItem>
              <SelectItem value="Unlinked">
                {t("workspace.table.unlinked")}
              </SelectItem>
              {stationRoutineManager.visibleRoutines.map(routine => (
                <SelectItem key={routine.id} value={routine.id}>
                  {routine.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={event => {
          if (isSearchingRoutineTasks || !hasMoreRoutineTasks) return;

          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.55) return;
          void searchRoutineTasks(false);
        }}
      >
        <Table className="w-full table-fixed border-collapse text-xs">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:whitespace-normal [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:leading-tight">
            <TableRow>
              <TableHead className="h-9 w-[19%] px-2">
                {t("workspace.table.task")}
              </TableHead>
              <TableHead className="h-9 w-[10%] px-2">
                {t("workspace.table.station")}
              </TableHead>
              <TableHead className="h-9 w-[13%] px-2">
                {t("workspace.table.purpose")}
              </TableHead>
              <TableHead className="h-9 w-[17%] px-2">
                {t("workspace.table.routine")}
              </TableHead>
              <TableHead className="h-9 w-[8%] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutineTasks.map(routineTask => {
              const station = stationRoutineManager.getStationById(
                routineTask.stationId
              );
              const linkedRoutines = routineTask.linkedRoutineIds.flatMap(
                linkedRoutineId => {
                  const routine =
                    stationRoutineManager.getRoutineById(linkedRoutineId);
                  return routine ? [routine] : [];
                }
              );

              return (
                <TableRow key={routineTask.id}>
                  <TableCell className="px-2 py-2.5">
                    <div className="min-w-0">
                      <p className="whitespace-normal font-medium leading-snug [overflow-wrap:anywhere]">
                        {routineTask.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="break-words">
                      {station?.name ?? t("workspace.table.unknown")}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="break-words">
                      {translateRoutineTaskPurpose(routineTask.purpose, t)}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <div className="flex min-w-0 flex-wrap gap-1">
                      {linkedRoutines.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {t("workspace.table.unlinked")}
                        </span>
                      ) : (
                        linkedRoutines.map(routine => (
                          <span
                            key={routine.id}
                            className="inline-flex h-5 max-w-full items-center rounded-sm border border-border/60 px-1.5"
                          >
                            <span className="truncate">{routine.title}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 rounded-sm"
                      onClick={() =>
                        stationRoutineManager.openInspector({
                          type: "routineTask",
                          id: routineTask.id,
                        })
                      }
                    >
                      <SquarePen className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRoutineTasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {isSearchingRoutineTasks
                    ? t("workspace.table.loadingRoutineTasks")
                    : t("workspace.table.noRoutineTasksMatch")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default RoutineTaskTable;
