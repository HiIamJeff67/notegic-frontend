import {
  SearchRoutineTaskSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { routineTaskPurposeTKeys } from "@shared/i18n/enums/routineTaskPurpose.tKey";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast/toast";
import type { UUID } from "crypto";
import { ListFilter, SquarePen } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchRoutineTasksQuery } from "@/api/graphql/hooks/useSearchRoutineTasks";
import { RoutineTaskIcon } from "@/components/icons/WorkspaceEntityIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useDebounceValue } from "@/hooks/useDebounce";
import type { RoutineTaskNode } from "@/providers/StationRoutineProvider/routineTaskNode.type";
import RoutineSearchOrder from "../RoutineSearchOrder/RoutineSearchOrder";

const RoutineTaskTable = () => {
  const { t } = useTranslation();
  const id = useId();
  const stationRoutineManager = useStationRoutine();
  const [searchQuery, setSearchQuery] = useState("");
  const query = useDebounceValue(searchQuery);
  const [order, setOrder] = useState({
    sortBy: SearchRoutineTaskSortBy.Title,
    sortOrder: SearchSortOrder.Asc,
  });
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

  const skipSearch =
    stationRoutineManager.stations.length > 0 &&
    effectiveStationIds.length === 0;
  const input = {
    query,
    ...order,
    first: 20,
    routineIds:
      routineId === "All" || routineId === "Unlinked" ? [] : [routineId],
  };
  const routineTaskSearch = useSearchRoutineTasksQuery(
    { input },
    { skip: skipSearch, fetchPolicy: "cache-and-network", ssr: false }
  );
  const connection = routineTaskSearch.data?.searchRoutineTasks;
  const routineTaskTotalCount = skipSearch ? 0 : (connection?.totalCount ?? 0);
  const isSearchingRoutineTasks = routineTaskSearch.loading;
  const hasMoreRoutineTasks = connection?.searchPageInfo.hasNextPage ?? false;
  const cursor = connection?.searchPageInfo.endEncodedSearchCursor;
  const pendingCursor = useRef<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const searchSignature = JSON.stringify(input);
  useEffect(() => {
    viewport.current?.scrollTo({ top: 0 });
  }, [searchSignature]);
  const loadMoreRoutineTasks = async () => {
    if (
      skipSearch ||
      isSearchingRoutineTasks ||
      !hasMoreRoutineTasks ||
      !cursor ||
      pendingCursor.current === cursor
    )
      return;
    pendingCursor.current = cursor;
    try {
      await routineTaskSearch.fetchMore({
        variables: { input: { ...input, after: cursor } },
      });
    } catch (error) {
      toast.error(tError(error, t));
    } finally {
      if (pendingCursor.current === cursor) pendingCursor.current = null;
    }
  };

  const routineTasks = useMemo(() => {
    if (skipSearch) return [];
    const selectedStationIds = new Set(effectiveStationIds);
    const searchedRoutineTasks = (
      routineTaskSearch.data?.searchRoutineTasks.searchEdges ?? []
    )
      .map((edge: any) => {
        const node = edge.node as unknown as {
          id: UUID;
          routineId: UUID;
          title: string;
          kind: string;
          payload: RoutineTaskNode["payload"];
          priority: number;
          maxAttempts: number;
          previousRoutineTaskIds: UUID[];
          updatedAt: Date | string | number;
          createdAt: Date | string | number;
        };
        if (node.kind === "Start") return null;
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
          payload: node.payload,
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

    return searchedRoutineTasks;
  }, [
    routineTaskSearch.data,
    skipSearch,
    stationPresenceSignature,
    stationRoutineManager.getRoutineById,
    routineLookupSignature,
    stationRoutineManager.stations.length,
  ]);

  const filteredRoutineTasks = useMemo(() => {
    return routineTasks.filter(routineTask => {
      if (purpose !== "All" && routineTask.payload.purpose !== purpose)
        return false;

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
      <div className="flex min-h-11 shrink-0 select-none items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2 @max-[1040px]:flex-col @max-[1040px]:items-start">
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
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <Input
            aria-label={t("workspace.table.searchRoutineTasks")}
            placeholder={t("workspace.table.searchRoutineTasks")}
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
                  purpose !== "All" || routineId !== "All"
                    ? "secondary"
                    : "outline"
                }
                className="size-8 shrink-0 rounded-sm"
                aria-label={t("workspace.table.routineTaskFilters")}
                title={t("workspace.table.routineTaskFilters")}
              >
                <ListFilter className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              aria-label={t("workspace.table.routineTaskFilters")}
              className="h-80 w-[min(24rem,calc(100vw-2rem))] max-h-[min(20rem,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-contain p-3"
            >
              <p className="mb-4 text-sm font-medium">
                {t("workspace.table.routineTaskFilters")}
              </p>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-3">
                <Label htmlFor={`${id}-purpose`}>
                  {t("workspace.table.purpose")}
                </Label>
                <Select
                  value={purpose}
                  onValueChange={value =>
                    setPurpose(value as RoutineTaskPurpose | "All")
                  }
                >
                  <SelectTrigger
                    size="sm"
                    id={`${id}-purpose`}
                    aria-label={t("workspace.table.purpose")}
                    className="h-8 w-full min-w-0 rounded-sm text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    <SelectItem value="All">
                      {t("workspace.table.allPurpose")}
                    </SelectItem>
                    {Object.values(RoutineTaskPurpose).map(
                      routineTaskPurpose => (
                        <SelectItem
                          key={routineTaskPurpose}
                          value={routineTaskPurpose}
                        >
                          {`${t(routineTaskPurposeTKeys[routineTaskPurpose].action)} · ${t(routineTaskPurposeTKeys[routineTaskPurpose].target)}`}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Label htmlFor={`${id}-routine`}>
                  {t("workspace.table.routine")}
                </Label>
                <Select
                  value={routineId}
                  onValueChange={value =>
                    setRoutineId(value as UUID | "All" | "Unlinked")
                  }
                >
                  <SelectTrigger
                    size="sm"
                    id={`${id}-routine`}
                    aria-label={t("workspace.table.routine")}
                    className="h-8 w-full min-w-0 rounded-sm text-xs"
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
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="col-start-2"
                  onClick={() => {
                    setPurpose("All");
                    setRoutineId("All");
                  }}
                >
                  {t("workspace.records.resetFilters")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <RoutineSearchOrder
            label={t("workspace.table.sortRoutineTasks")}
            value={order}
            defaultValue={{
              sortBy: SearchRoutineTaskSortBy.Title,
              sortOrder: SearchSortOrder.Asc,
            }}
            onChange={setOrder}
            options={[
              {
                value: SearchRoutineTaskSortBy.Title,
                label: t("workspace.fields.title"),
              },
              {
                value: SearchRoutineTaskSortBy.Priority,
                label: t("workspace.fields.priority"),
              },
              {
                value: SearchRoutineTaskSortBy.MaxAttempts,
                label: t("workspace.fields.maxAttempts"),
              },
              {
                value: SearchRoutineTaskSortBy.Purpose,
                label: t("workspace.table.purpose"),
              },
              {
                value: SearchRoutineTaskSortBy.CreatedAt,
                label: t("workspace.records.createdAt"),
              },
              {
                value: SearchRoutineTaskSortBy.LastUpdate,
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
          if (isSearchingRoutineTasks || !hasMoreRoutineTasks) return;

          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.55) return;
          void loadMoreRoutineTasks();
        }}
      >
        <Table className="min-w-[40rem] table-fixed border-collapse text-xs">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:whitespace-normal [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:leading-tight [&_th]:text-left">
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
                      {`${t(routineTaskPurposeTKeys[routineTask.payload.purpose].action)} · ${t(routineTaskPurposeTKeys[routineTask.payload.purpose].target)}`}
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
