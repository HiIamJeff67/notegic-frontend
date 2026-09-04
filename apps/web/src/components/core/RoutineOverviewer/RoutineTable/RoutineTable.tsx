import { fromGraphQLRoutinePhase } from "@shared/api/graphql/conversions";
import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutinePhase as GraphQLRoutinePhase,
  RoutineStatus as GraphQLRoutineStatus,
  SearchRoutineSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import {
  AllRoutineStatuses,
  RoutinePeriod,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import {
  translateRoutinePhase,
  translateRoutineStatus,
  translateRoutineTaskRecordStatus,
} from "@shared/i18n/workspace";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { UUID } from "crypto";
import { Bookmark, SquarePen } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchRoutinesLazyQuery } from "@/api/graphql/hooks/useSearchRoutines";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import RoutineTaskStatusDot from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import { RoutineIcon } from "@/components/icons/WorkspaceEntityIcons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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

const RoutineTable = () => {
  const { i18n, t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const [executeSearchRoutines, routineSearch] = useSearchRoutinesLazyQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [routines, setRoutines] = useState<
    Array<RoutineNode & { routineTaskIds: UUID[] }>
  >([]);
  const [routineTotalCount, setRoutineTotalCount] = useState<number>(0);
  const [routineSearchCursor, setRoutineSearchCursor] = useState<string | null>(
    null
  );
  const [hasMoreRoutines, setHasMoreRoutines] = useState<boolean>(true);
  const [isSearchingRoutines, setIsSearchingRoutines] =
    useState<boolean>(false);
  const isSearchingRoutinesRef = useRef<boolean>(false);
  const hasExecutedInitialSearchRef = useRef<boolean>(false);
  const [status, setStatus] = useState<RoutineStatus | "All">("All");
  const [startsAfter, setStartsAfter] = useState<Date | undefined>();
  const [endsBefore, setEndsBefore] = useState<Date | undefined>();
  const [showUnscheduled, setShowUnscheduled] = useState<boolean>(true);
  const effectiveStationIds =
    stationRoutineManager.viewMode === "station" &&
    stationRoutineManager.activeStationId
      ? [stationRoutineManager.activeStationId]
      : stationRoutineManager.presence.stationIds;
  const stationPresenceSignature = effectiveStationIds.join("|");
  const routineTagPresenceSignature =
    stationRoutineManager.presence.routineTagIds.join("|");

  const applySearchRoutinesData = useCallback(
    (data?: any): void => {
      const isAllRoutineTagsSelected =
        stationRoutineManager.routineTags.length === 0 ||
        stationRoutineManager.presence.routineTagIds.length ===
          stationRoutineManager.routineTags.length;
      const shouldFilterRoutineTagsInView =
        stationRoutineManager.routineTags.length > 0 &&
        stationRoutineManager.presence.showUntaggedRoutines &&
        !isAllRoutineTagsSelected;
      const shouldShowOnlyUntaggedRoutines =
        stationRoutineManager.routineTags.length > 0 &&
        stationRoutineManager.presence.showUntaggedRoutines &&
        stationRoutineManager.presence.routineTagIds.length === 0;
      const searchedRoutines = (data?.searchRoutines.searchEdges ?? [])
        .map((edge: any) => {
          const node = edge.node as unknown as {
            id: UUID;
            stationId: UUID;
            title: string;
            status: GraphQLRoutineStatus;
            phase?: GraphQLRoutinePhase | null;
            isPinned: boolean;
            scheduledStartAt: Date | string | number;
            scheduledEndAt: Date | string | number;
            period: GraphQLRoutinePeriod | null;
            timezone: string;
            deletedAt: Date | string | number | null;
            updatedAt: Date | string | number;
            createdAt: Date | string | number;
            tagIds?: UUID[];
            taskIds?: UUID[];
            itemIds?: UUID[];
          };
          const routineTagIds = node.tagIds ?? [];
          if (shouldShowOnlyUntaggedRoutines && routineTagIds.length > 0) {
            return null;
          }
          if (
            shouldFilterRoutineTagsInView &&
            routineTagIds.length > 0 &&
            !routineTagIds.some(routineTagId =>
              stationRoutineManager.presence.routineTagIds.includes(
                routineTagId
              )
            )
          ) {
            return null;
          }

          const routineTaskIds = node.taskIds ?? [];
          const routine: RoutineNode & { routineTaskIds: UUID[] } = {
            id: node.id,
            stationId: node.stationId,
            title: node.title,
            description: "",
            status:
              node.status === GraphQLRoutineStatus.RoutineStatusCompleted
                ? RoutineStatus.Completed
                : node.status === GraphQLRoutineStatus.RoutineStatusInProgress
                  ? RoutineStatus.InProgress
                  : node.status === GraphQLRoutineStatus.RoutineStatusOverDue
                    ? RoutineStatus.OverDue
                    : RoutineStatus.Scheduled,
            phase: fromGraphQLRoutinePhase(node.phase),
            isPinned: node.isPinned,
            scheduledStartAt: new Date(node.scheduledStartAt),
            scheduledEndAt: new Date(node.scheduledEndAt),
            period:
              node.period === GraphQLRoutinePeriod.RoutinePeriodDaily
                ? RoutinePeriod.Daily
                : node.period === GraphQLRoutinePeriod.RoutinePeriodWeekly
                  ? RoutinePeriod.Weekly
                  : node.period === GraphQLRoutinePeriod.RoutinePeriodMonthly
                    ? RoutinePeriod.Monthly
                    : null,
            timezone: node.timezone,
            deletedAt:
              node.deletedAt === null ? null : new Date(node.deletedAt),
            updatedAt: new Date(node.updatedAt),
            createdAt: new Date(node.createdAt),
            isOpen: false,
            isExpanded: false,
            routineTagIds,
            itemIds: node.itemIds ?? [],
            routineTasks: routineTaskIds.flatMap(routineTaskId => {
              const routineTask =
                stationRoutineManager.getRoutineTaskById(routineTaskId);
              return routineTask ? [routineTask] : [];
            }),
            routineTaskIds,
          };
          return routine;
        })
        .filter(
          (
            routine: (RoutineNode & { routineTaskIds: UUID[] }) | null
          ): routine is RoutineNode & { routineTaskIds: UUID[] } =>
            routine !== null
        );

      setRoutines(searchedRoutines);
      setRoutineTotalCount(data?.searchRoutines.totalCount ?? 0);
      setRoutineSearchCursor(
        data?.searchRoutines.searchPageInfo.endEncodedSearchCursor ?? null
      );
      setHasMoreRoutines(
        data?.searchRoutines.searchPageInfo.hasNextPage ?? false
      );
    },
    [
      stationRoutineManager.getRoutineTaskById,
      stationRoutineManager.presence.routineTagIds,
      stationRoutineManager.presence.showUntaggedRoutines,
      stationRoutineManager.routineTags.length,
    ]
  );

  const searchRoutines = useCallback(
    async (reset: boolean): Promise<void> => {
      if (isSearchingRoutinesRef.current) return;
      if (!reset && (!hasMoreRoutines || !routineSearchCursor)) return;
      if (
        stationRoutineManager.stations.length > 0 &&
        effectiveStationIds.length === 0
      ) {
        if (reset) {
          setRoutines([]);
          setRoutineTotalCount(0);
          setRoutineSearchCursor(null);
          setHasMoreRoutines(false);
        }
        return;
      }
      if (
        stationRoutineManager.routineTags.length > 0 &&
        stationRoutineManager.presence.routineTagIds.length === 0 &&
        !stationRoutineManager.presence.showUntaggedRoutines
      ) {
        if (reset) {
          setRoutines([]);
          setRoutineTotalCount(0);
          setRoutineSearchCursor(null);
          setHasMoreRoutines(false);
        }
        return;
      }

      isSearchingRoutinesRef.current = true;
      setIsSearchingRoutines(true);
      try {
        const isAllStationsSelected =
          stationRoutineManager.viewMode !== "station" &&
          (stationRoutineManager.stations.length === 0 ||
            effectiveStationIds.length ===
              stationRoutineManager.stations.length);
        const isAllRoutineTagsSelected =
          stationRoutineManager.routineTags.length === 0 ||
          stationRoutineManager.presence.routineTagIds.length ===
            stationRoutineManager.routineTags.length;
        const shouldFilterRoutineTagsInView =
          stationRoutineManager.routineTags.length > 0 &&
          stationRoutineManager.presence.showUntaggedRoutines &&
          !isAllRoutineTagsSelected;
        const shouldShowOnlyUntaggedRoutines =
          stationRoutineManager.routineTags.length > 0 &&
          stationRoutineManager.presence.showUntaggedRoutines &&
          stationRoutineManager.presence.routineTagIds.length === 0;
        const variables = {
          input: {
            query: stationRoutineManager.presence.query,
            after: reset ? undefined : (routineSearchCursor ?? undefined),
            first: reset ? 20 : 10,
            stationIds: isAllStationsSelected ? [] : effectiveStationIds,
            tagIds:
              shouldFilterRoutineTagsInView ||
              shouldShowOnlyUntaggedRoutines ||
              isAllRoutineTagsSelected
                ? []
                : stationRoutineManager.presence.routineTagIds,
            sortBy: SearchRoutineSortBy.Title,
            sortOrder: SearchSortOrder.Asc,
          },
        };

        if (reset || !hasExecutedInitialSearchRef.current) {
          hasExecutedInitialSearchRef.current = true;
          await executeSearchRoutines({ variables }).retain();
        } else {
          await routineSearch.fetchMore({
            variables,
            updateQuery: (previous, { fetchMoreResult }) => {
              if (!fetchMoreResult) return previous;
              const existingRoutineIds = new Set(
                previous.searchRoutines.searchEdges.map(edge => {
                  const node = edge.node as unknown as { id: UUID };
                  return node.id;
                })
              );
              return {
                ...fetchMoreResult,
                searchRoutines: {
                  ...fetchMoreResult.searchRoutines,
                  searchEdges: [
                    ...previous.searchRoutines.searchEdges,
                    ...fetchMoreResult.searchRoutines.searchEdges.filter(
                      edge => {
                        const node = edge.node as unknown as { id: UUID };
                        return !existingRoutineIds.has(node.id);
                      }
                    ),
                  ],
                },
              };
            },
          });
        }
      } finally {
        isSearchingRoutinesRef.current = false;
        setIsSearchingRoutines(false);
      }
    },
    [
      executeSearchRoutines,
      stationPresenceSignature,
      hasMoreRoutines,
      routineSearchCursor,
      stationRoutineManager.presence.query,
      stationRoutineManager.presence.routineTagIds,
      stationRoutineManager.presence.showUntaggedRoutines,
      stationRoutineManager.routineTags.length,
      stationRoutineManager.stations.length,
      stationRoutineManager.viewMode,
      routineSearch.fetchMore,
    ]
  );

  useEffect(() => {
    if (!routineSearch.data) return;
    applySearchRoutinesData(routineSearch.data);
  }, [applySearchRoutinesData, routineSearch.data]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void searchRoutines(true);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [
    stationRoutineManager.presence.query,
    stationRoutineManager.presence.showUntaggedRoutines,
    stationPresenceSignature,
    routineTagPresenceSignature,
  ]);

  const filteredRoutines = useMemo(() => {
    return routines.filter(routine => {
      if (status !== "All" && routine.status !== status) return false;

      const isScheduled =
        routine.scheduledStartAt instanceof Date &&
        routine.scheduledEndAt instanceof Date &&
        !Number.isNaN(routine.scheduledStartAt.getTime()) &&
        !Number.isNaN(routine.scheduledEndAt.getTime());

      if (!isScheduled) return showUnscheduled;
      if (startsAfter && routine.scheduledEndAt < startsAfter) {
        return false;
      }
      if (endsBefore && routine.scheduledStartAt > endsBefore) {
        return false;
      }
      return true;
    });
  }, [endsBefore, routines, showUnscheduled, startsAfter, status]);

  return (
    <section className="@container flex max-h-[640px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
      <div className="flex min-h-11 select-none items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2 @max-[760px]:items-start @max-[760px]:flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <RoutineIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            {t("workspace.table.routineTable")}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredRoutines.length}
            <span className="px-0.5">|</span>
            {routineTotalCount}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 @max-[760px]:w-full @max-[760px]:justify-start">
          <Select
            value={status}
            onValueChange={value => setStatus(value as RoutineStatus | "All")}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-32 rounded-sm text-xs @max-[520px]:w-24"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">
                {t("workspace.table.allStatus")}
              </SelectItem>
              {AllRoutineStatuses.map(routineStatus => (
                <SelectItem key={routineStatus} value={routineStatus}>
                  {translateRoutineStatus(routineStatus, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            value={startsAfter}
            onValueChange={setStartsAfter}
            placeholder={t("workspace.table.startsAfter")}
            className="h-8 w-40 px-3 text-xs @max-[520px]:w-10 @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
          />
          <DatePicker
            value={endsBefore}
            onValueChange={setEndsBefore}
            placeholder={t("workspace.table.endsBefore")}
            className="h-8 w-40 px-3 text-xs @max-[520px]:w-10 @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
          />
          <label className="flex h-8 items-center gap-2 rounded-sm bg-transparent px-2 text-xs text-muted-foreground">
            <Checkbox
              checked={showUnscheduled}
              onCheckedChange={checked => setShowUnscheduled(checked === true)}
            />
            <span className="@max-[520px]:sr-only">
              {t("workspace.table.unscheduled")}
            </span>
          </label>
        </div>
      </div>

      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={event => {
          if (isSearchingRoutines || !hasMoreRoutines) return;

          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.55) return;
          void searchRoutines(false);
        }}
      >
        <Table className="table-fixed">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary">
            <TableRow>
              <TableHead className="w-[18%] px-3">
                {t("workspace.table.routine")}
              </TableHead>
              <TableHead className="w-[14%] px-3">
                {t("workspace.table.station")}
              </TableHead>
              <TableHead className="w-[12%] px-3">
                {t("workspace.table.status")}
              </TableHead>
              <TableHead className="w-[22%] px-3">
                {t("workspace.table.schedule")}
              </TableHead>
              <TableHead className="w-[22%] px-3">
                {t("workspace.table.tags")}
              </TableHead>
              <TableHead className="w-[7%] px-3">
                {t("workspace.table.tasks")}
              </TableHead>
              <TableHead className="w-[5%] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutines.map(routine => {
              const station = stationRoutineManager.getStationById(
                routine.stationId
              );
              const routineTags = routine.routineTagIds
                .flatMap(routineTagId => {
                  const routineTag =
                    stationRoutineManager.getRoutineTagById(routineTagId);
                  return routineTag ? [routineTag] : [];
                })
                .sort((left, right) => {
                  const nameComparison = left.name.localeCompare(right.name);
                  return nameComparison === 0
                    ? left.id.localeCompare(right.id)
                    : nameComparison;
                });
              const presentRoutineTags = routineTags.slice(0, 3);
              const hiddenRoutineTags = routineTags.slice(3);
              const routineTaskCount =
                routine.routineTaskIds.length > 0
                  ? routine.routineTaskIds.length
                  : routine.routineTasks.length;
              const isScheduled =
                routine.scheduledStartAt instanceof Date &&
                routine.scheduledEndAt instanceof Date &&
                !Number.isNaN(routine.scheduledStartAt.getTime()) &&
                !Number.isNaN(routine.scheduledEndAt.getTime());

              return (
                <TableRow key={routine.id}>
                  <TableCell className="overflow-hidden px-3 py-3">
                    <div className="flex min-w-0 items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-1.5">
                        {routine.isPinned && (
                          <Bookmark
                            className="mt-0.5 size-3.5 shrink-0 fill-muted-foreground/20 text-muted-foreground"
                            aria-label={t("workspace.table.pinnedRoutine")}
                          />
                        )}
                        <p className="whitespace-normal font-medium leading-snug [overflow-wrap:anywhere]">
                          {routine.title}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <span className="break-words">
                      {station?.name ?? t("workspace.table.unknown")}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span>{translateRoutineStatus(routine.status, t)}</span>
                      {routine.phase && (
                        <span className="text-xs text-muted-foreground">
                          {translateRoutinePhase(routine.phase, t)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    {isScheduled ? (
                      <div className="flex flex-col text-xs">
                        <span className="break-words">
                          {routine.scheduledStartAt.toLocaleString(
                            i18n.resolvedLanguage
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {routine.scheduledEndAt.toLocaleString(
                            i18n.resolvedLanguage
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("workspace.table.unscheduled")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex min-w-0 flex-wrap gap-1">
                      {routine.routineTagIds.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {t("workspace.table.untagged")}
                        </span>
                      ) : routineTags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {t("workspace.table.tagCount", {
                            count: routine.routineTagIds.length,
                          })}
                        </span>
                      ) : (
                        <>
                          {presentRoutineTags.map(routineTag => (
                            <span
                              key={routineTag.id}
                              className="inline-flex h-5 max-w-full items-center gap-1 rounded-sm border border-border/60 px-1.5 text-xs"
                            >
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: routineTag.color }}
                              />
                              <span className="truncate">
                                {routineTag.name}
                              </span>
                            </span>
                          ))}
                          {hiddenRoutineTags.length > 0 && (
                            <HoverCard openDelay={180} closeDelay={120}>
                              <HoverCardTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex h-5 items-center rounded-sm border border-border/60 px-1.5 text-xs text-muted-foreground hover:bg-accent/50"
                                >
                                  ...
                                </button>
                              </HoverCardTrigger>
                              <HoverCardContent
                                align="start"
                                className="w-72 rounded-sm p-3"
                              >
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm font-medium">
                                    {t("workspace.table.routineTags")}
                                  </p>
                                  <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
                                    {routineTags.map(routineTag => (
                                      <div
                                        key={routineTag.id}
                                        className="flex min-w-0 items-center gap-2 text-sm"
                                      >
                                        <span
                                          className="size-2.5 shrink-0 rounded-full"
                                          style={{
                                            backgroundColor: routineTag.color,
                                          }}
                                        />
                                        <span className="truncate">
                                          {routineTag.name}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {routineTaskCount === 0 ? (
                      0
                    ) : (
                      <HoverCard openDelay={180} closeDelay={120}>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            className="rounded-sm px-1 tabular-nums hover:bg-accent/50"
                          >
                            {routineTaskCount}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent
                          align="start"
                          className="w-80 rounded-sm p-3"
                        >
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">
                              {t("workspace.table.routineTasks")}
                            </p>
                            {routine.routineTasks.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                {t("workspace.table.linkedTasksNotLoaded", {
                                  count: routineTaskCount,
                                })}
                              </p>
                            ) : (
                              <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                                {routine.routineTasks.map(routineTask => (
                                  <div
                                    key={routineTask.id}
                                    className="flex min-w-0 items-center gap-2 text-sm"
                                  >
                                    <RoutineTaskStatusDot
                                      className="size-2.5"
                                      status={routineTask.executionStatus}
                                    />
                                    <span className="min-w-0 flex-1 truncate">
                                      {routineTask.title}
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {routineTask.executionStatus
                                        ? translateRoutineTaskRecordStatus(
                                            routineTask.executionStatus,
                                            t
                                          )
                                        : "—"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-sm"
                      onClick={() =>
                        stationRoutineManager.openInspector({
                          type: "routine",
                          id: routine.id,
                        })
                      }
                    >
                      <SquarePen className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRoutines.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {isSearchingRoutines
                    ? t("workspace.table.loadingRoutines")
                    : t("workspace.table.noRoutinesMatch")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default RoutineTable;
