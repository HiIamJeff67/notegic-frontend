import { fromGraphQLRoutinePhase } from "@shared/api/graphql/conversions";
import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutinePhase as GraphQLRoutinePhase,
  SearchRoutineSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { RoutinePeriod } from "@shared/api/interfaces/enums";
import type { RoutineAdmissionState } from "@shared/api/interfaces/routine.interface";
import { routinePhaseTKeys } from "@shared/i18n/enums/routinePhase.tKey";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import { compareEntityNames } from "@shared/lib/comparisons/compareEntityNames";
import toast from "@shared/lib/toast/toast";
import type { UUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { Bookmark, ListFilter, SquarePen } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSearchRoutinesQuery } from "@/api/graphql/hooks/useSearchRoutines";
import { useUpdateMyRoutineById } from "@/api/hooks/routine.hook";
import { localDB } from "@/api/local/db";
import { Transaction, User } from "@/api/local/schemas";
import { TransactionEntityType } from "@/api/local/schemas/enums/transaction_entity_type.enum";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStationRoutine } from "@/hooks";
import { useDebounceValue } from "@/hooks/useDebounce";
import { useTransactionSynchronizer } from "@/hooks/useTransactionSynchronizer";
import type { RoutineNode } from "@/providers/StationRoutineProvider/routineNode.type";
import RoutineSearchOrder from "../RoutineSearchOrder/RoutineSearchOrder";

const RoutineTable = () => {
  const { i18n, t } = useTranslation();
  const id = useId();
  const stationRoutineManager = useStationRoutine();
  const updateRoutine = useUpdateMyRoutineById();
  const { synchronizationRevision } = useTransactionSynchronizer();
  const [searchQuery, setSearchQuery] = useState("");
  const query = useDebounceValue(searchQuery);
  const [order, setOrder] = useState({
    sortBy: SearchRoutineSortBy.Title,
    sortOrder: SearchSortOrder.Asc,
  });
  const [pendingActive, setPendingActive] = useState<Record<string, boolean>>(
    {}
  );
  const [startsAfter, setStartsAfter] = useState<Date | undefined>();
  const [endsBefore, setEndsBefore] = useState<Date | undefined>();
  const [showUnscheduled, setShowUnscheduled] = useState<boolean>(true);
  const effectiveStationIds =
    stationRoutineManager.viewMode === "station" &&
    stationRoutineManager.activeStationId
      ? [stationRoutineManager.activeStationId]
      : stationRoutineManager.presence.stationIds;
  const isAllStationsSelected =
    stationRoutineManager.viewMode !== "station" &&
    (stationRoutineManager.stations.length === 0 ||
      effectiveStationIds.length === stationRoutineManager.stations.length);
  const isAllRoutineTagsSelected =
    stationRoutineManager.routineTags.length === 0 ||
    stationRoutineManager.presence.routineTagIds.length ===
      stationRoutineManager.routineTags.length;
  const skipSearch =
    (stationRoutineManager.stations.length > 0 &&
      effectiveStationIds.length === 0) ||
    (stationRoutineManager.routineTags.length > 0 &&
      stationRoutineManager.presence.routineTagIds.length === 0 &&
      !stationRoutineManager.presence.showUntaggedRoutines);
  const input = {
    query,
    ...order,
    first: 20,
    stationIds: isAllStationsSelected ? [] : effectiveStationIds,
    tagIds:
      stationRoutineManager.presence.showUntaggedRoutines ||
      isAllRoutineTagsSelected
        ? []
        : stationRoutineManager.presence.routineTagIds,
  };
  const routineSearch = useSearchRoutinesQuery(
    { input },
    { skip: skipSearch, fetchPolicy: "cache-and-network", ssr: false }
  );
  const connection = routineSearch.data?.searchRoutines;
  const routineTotalCount = skipSearch ? 0 : (connection?.totalCount ?? 0);
  const isSearchingRoutines = routineSearch.loading;
  const hasMoreRoutines = connection?.searchPageInfo.hasNextPage ?? false;
  const cursor = connection?.searchPageInfo.endEncodedSearchCursor;
  const pendingCursor = useRef<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const searchSignature = JSON.stringify(input);
  useEffect(() => {
    viewport.current?.scrollTo({ top: 0 });
  }, [searchSignature]);
  const loadMoreRoutines = async () => {
    if (
      skipSearch ||
      isSearchingRoutines ||
      !hasMoreRoutines ||
      !cursor ||
      pendingCursor.current === cursor
    )
      return;
    pendingCursor.current = cursor;
    try {
      await routineSearch.fetchMore({
        variables: { input: { ...input, after: cursor } },
      });
    } catch (error) {
      toast.error(tError(error, t));
    } finally {
      if (pendingCursor.current === cursor) pendingCursor.current = null;
    }
  };

  const routines = useMemo(() => {
    if (skipSearch) return [];
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
    const searchedRoutines = (
      routineSearch.data?.searchRoutines.searchEdges ?? []
    )
      .map((edge: any) => {
        const node = edge.node as unknown as {
          id: UUID;
          stationId: UUID;
          title: string;
          phase?: GraphQLRoutinePhase | null;
          admissionState: RoutineAdmissionState;
          isActive: boolean;
          definitionVersion: number;
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
            stationRoutineManager.presence.routineTagIds.includes(routineTagId)
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
          phase: fromGraphQLRoutinePhase(node.phase),
          isActive: node.isActive,
          admissionState: node.admissionState,
          definitionVersion: node.definitionVersion,
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
          deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt),
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

    return searchedRoutines;
  }, [
    routineSearch.data,
    skipSearch,
    stationRoutineManager.getRoutineTaskById,
    stationRoutineManager.presence.routineTagIds,
    stationRoutineManager.presence.showUntaggedRoutines,
    stationRoutineManager.routineTags.length,
  ]);

  useEffect(() => {
    let cancelled = false;
    const reconcilePending = async () => {
      if (!localDB.isEnabled) return;
      if (!localDB.isReady) await localDB.ensureReady();
      const [user] = await localDB
        .select()
        .from(User)
        .where(eq(User.isLoggedIn, true))
        .limit(1);
      if (!user) return;
      const pending = await localDB
        .select()
        .from(Transaction)
        .where(
          and(
            eq(Transaction.ownerPublicId, user.publicId),
            eq(Transaction.entityType, TransactionEntityType.Routine)
          )
        );
      const activeById: Record<string, boolean> = {};
      for (const transaction of pending) {
        const body = transaction.body as {
          routineId?: string;
          values?: { isActive?: boolean };
        };
        if (body.routineId && body.values?.isActive !== undefined)
          activeById[body.routineId] = body.values.isActive;
      }
      if (!cancelled) {
        setPendingActive(activeById);
        if (synchronizationRevision > 0 && !skipSearch)
          await routineSearch.refetch();
      }
    };
    void reconcilePending().catch(error =>
      console.error("Failed to reconcile pending routine activation", error)
    );
    return () => {
      cancelled = true;
    };
  }, [synchronizationRevision, routineSearch.refetch, skipSearch]);

  const filteredRoutines = useMemo(() => {
    return routines.filter(routine => {
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
  }, [endsBefore, routines, showUnscheduled, startsAfter]);

  return (
    <section className="@container flex max-h-[640px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
      <div className="flex min-h-11 shrink-0 select-none items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2 @max-[760px]:items-start @max-[760px]:flex-col">
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
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <Input
            aria-label={t("workspace.table.searchRoutines")}
            placeholder={t("workspace.table.searchRoutines")}
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="h-8 w-40 min-w-0 flex-1 text-xs sm:flex-none"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant={
                  startsAfter || endsBefore || !showUnscheduled
                    ? "secondary"
                    : "outline"
                }
                className="size-8 shrink-0 rounded-sm"
                aria-label={t("workspace.table.routineFilters")}
                title={t("workspace.table.routineFilters")}
              >
                <ListFilter className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              aria-label={t("workspace.table.routineFilters")}
              className="h-80 w-[min(24rem,calc(100vw-2rem))] max-h-[min(20rem,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-contain p-3"
            >
              <p className="mb-4 text-sm font-medium">
                {t("workspace.table.routineFilters")}
              </p>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3">
                <Label htmlFor={`${id}-starts-after`}>
                  {t("workspace.table.startsAfter")}
                </Label>
                <DatePicker
                  id={`${id}-starts-after`}
                  value={startsAfter}
                  onValueChange={setStartsAfter}
                  placeholder={t("workspace.table.startsAfter")}
                  className="h-8 w-full min-w-0 text-xs"
                />
                <Label htmlFor={`${id}-ends-before`}>
                  {t("workspace.table.endsBefore")}
                </Label>
                <DatePicker
                  id={`${id}-ends-before`}
                  value={endsBefore}
                  onValueChange={setEndsBefore}
                  placeholder={t("workspace.table.endsBefore")}
                  className="h-8 w-full min-w-0 text-xs"
                />
                <Label htmlFor={`${id}-unscheduled`}>
                  {t("workspace.table.unscheduled")}
                </Label>
                <Checkbox
                  id={`${id}-unscheduled`}
                  checked={showUnscheduled}
                  onCheckedChange={checked =>
                    setShowUnscheduled(checked === true)
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="col-start-2"
                  onClick={() => {
                    setStartsAfter(undefined);
                    setEndsBefore(undefined);
                    setShowUnscheduled(true);
                  }}
                >
                  {t("workspace.records.resetFilters")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <RoutineSearchOrder
            label={t("workspace.table.sortRoutines")}
            value={order}
            defaultValue={{
              sortBy: SearchRoutineSortBy.Title,
              sortOrder: SearchSortOrder.Asc,
            }}
            onChange={setOrder}
            options={[
              {
                value: SearchRoutineSortBy.Title,
                label: t("workspace.fields.title"),
              },
              {
                value: SearchRoutineSortBy.ScheduledStartAt,
                label: t("workspace.fields.starts"),
              },
              {
                value: SearchRoutineSortBy.ScheduledEndAt,
                label: t("workspace.fields.ends"),
              },
              {
                value: SearchRoutineSortBy.Period,
                label: t("workspace.payloadEditor.period"),
              },
              {
                value: SearchRoutineSortBy.CreatedAt,
                label: t("workspace.records.createdAt"),
              },
              {
                value: SearchRoutineSortBy.LastUpdate,
                label: t("workspace.records.updatedAt"),
              },
            ]}
          />
        </div>
      </div>

      <div
        ref={viewport}
        className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [&>div]:overflow-visible"
        onScroll={event => {
          if (isSearchingRoutines || !hasMoreRoutines) return;

          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.55) return;
          void loadMoreRoutines();
        }}
      >
        <Table className="min-w-[56rem] table-fixed">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:text-left">
            <TableRow>
              <TableHead className="w-[16%] px-3">
                {t("workspace.table.routine")}
              </TableHead>
              <TableHead className="w-[14%] px-3">
                {t("workspace.table.station")}
              </TableHead>
              <TableHead className="w-[12%] px-3">
                {t("workspace.table.phase")}
              </TableHead>
              <TableHead className="w-[18.5%] px-3">
                {t("workspace.table.schedule")}
              </TableHead>
              <TableHead className="w-[12%] px-3">
                {t("workspace.table.tags")}
              </TableHead>
              <TableHead className="w-[7%] px-3">
                {t("workspace.table.tasks")}
              </TableHead>
              <TableHead className="w-[7%] px-2">
                {t("workspace.fields.active")}
              </TableHead>
              <TableHead className="w-12 px-2" />
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
                .sort(compareEntityNames);
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

              let admissionLabel: string;
              switch (
                routine.isActive === false ? "Paused" : routine.admissionState
              ) {
                case "Paused":
                  admissionLabel = t("workspace.routineAdmission.paused");
                  break;
                case "NoEntry":
                  admissionLabel = t("workspace.routineAdmission.noEntry");
                  break;
                case "QuotaBlocked":
                  admissionLabel = t("workspace.routineAdmission.quotaBlocked");
                  break;
                case "DependencyBlocked":
                  admissionLabel = t(
                    "workspace.routineAdmission.dependencyBlocked"
                  );
                  break;
                case "Eligible":
                  admissionLabel = t("workspace.routineAdmission.eligible");
                  break;
                case "Unavailable":
                  admissionLabel = t("workspace.routineAdmission.unavailable");
                  break;
                default:
                  admissionLabel = t("workspace.routineAdmission.unknown");
              }

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
                      {routine.phase && (
                        <span className="text-xs text-muted-foreground">
                          {t(routinePhaseTKeys[routine.phase])}
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
                                {[...routine.routineTasks]
                                  .sort(compareEntityNames)
                                  .map(routineTask => (
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
                                          ? t(
                                              routineTaskRecordStatusTKeys[
                                                routineTask.executionStatus
                                              ]
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
                    <Switch
                      aria-label={`${routine.title}: ${t("workspace.fields.active")}`}
                      checked={
                        pendingActive[routine.id] ?? routine.isActive ?? true
                      }
                      disabled={updateRoutine.isPending}
                      onCheckedChange={isActive => {
                        setPendingActive(current => ({
                          ...current,
                          [routine.id]: isActive,
                        }));
                        void (async () => {
                          try {
                            const response = await updateRoutine.mutateAsync({
                              header: getClientRequestHeaders(
                                navigator.userAgent
                              ),
                              body: {
                                routineId: routine.id,
                                values: { isActive },
                              },
                            });
                            if (!response.success) {
                              toast.info(t("workspace.fields.pendingSync"));
                              return;
                            }
                            await routineSearch.refetch();
                            setPendingActive(current => {
                              const next = { ...current };
                              delete next[routine.id];
                              return next;
                            });
                          } catch (error) {
                            setPendingActive(current => {
                              const next = { ...current };
                              delete next[routine.id];
                              return next;
                            });
                            toast.error(tError(error, t));
                          }
                        })();
                      }}
                    />
                    <span className="mt-1 block text-[10px] leading-tight text-muted-foreground">
                      {pendingActive[routine.id] !== undefined
                        ? t("workspace.fields.pendingSync")
                        : admissionLabel}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 rounded-sm"
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
                  colSpan={8}
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
