import {
  SearchRoutineRecordSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import {
  AllRoutineRecordStatuses,
  RoutineRecordStatus,
} from "@shared/api/interfaces/enums";
import { translateRoutineRecordStatus } from "@shared/i18n/workspace";
import type { UUID } from "crypto";
import { Activity, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchRoutineRecordsLazyQuery } from "@/api/graphql/hooks/useSearchRoutineRecords";
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
import { useModal, useStationRoutine } from "@/hooks";

type RoutineRecordRow = {
  id: UUID;
  routineId: UUID;
  status: RoutineRecordStatus;
  scheduledAt: Date;
  actualEndedAt: Date | null;
  totalTaskCount: number;
  successTaskCount: number;
  failedTaskCount: number;
  blockedTaskCount: number;
};

const RoutineRecordTable = () => {
  const { i18n, t } = useTranslation();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const [executeSearch, recordSearch] = useSearchRoutineRecordsLazyQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [records, setRecords] = useState<RoutineRecordRow[]>([]);
  const [status, setStatus] = useState<RoutineRecordStatus | "All">("All");
  const [totalCount, setTotalCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = useRef(false);
  const routineIds = stationRoutineManager.visibleRoutines.map(
    routine => routine.id
  );
  const routineIdsSignature = routineIds.join("|");

  const applyData = useCallback((data?: any) => {
    const nextRecords = (data?.searchRoutineRecords?.searchEdges ?? []).map(
      (edge: any) => {
        const node = edge.node as any;
        return {
          id: node.id,
          routineId: node.routineId,
          status: node.status.replace(
            "RoutineRecordStatus_",
            ""
          ) as RoutineRecordStatus,
          scheduledAt: new Date(node.scheduledAt),
          actualEndedAt:
            node.actualEndedAt === null ? null : new Date(node.actualEndedAt),
          totalTaskCount: node.totalTaskCount,
          successTaskCount: node.successTaskCount,
          failedTaskCount: node.failedTaskCount,
          blockedTaskCount: node.blockedTaskCount,
        } satisfies RoutineRecordRow;
      }
    );

    setRecords(nextRecords);
    setTotalCount(data?.searchRoutineRecords?.totalCount ?? 0);
    setCursor(
      data?.searchRoutineRecords?.searchPageInfo?.endEncodedSearchCursor ?? null
    );
    setHasMore(
      data?.searchRoutineRecords?.searchPageInfo?.hasNextPage ?? false
    );
  }, []);

  const searchRecords = useCallback(
    async (reset: boolean) => {
      if (isSearchingRef.current || routineIds.length === 0) return;
      if (!reset && (!hasMore || !cursor)) return;

      isSearchingRef.current = true;
      setIsSearching(true);
      try {
        const variables = {
          input: {
            routineIds,
            query: "",
            after: reset ? undefined : (cursor ?? undefined),
            first: reset ? 20 : 10,
            sortBy: SearchRoutineRecordSortBy.ScheduledAt,
            sortOrder: SearchSortOrder.Desc,
          },
        };

        if (reset) {
          const result = await executeSearch({ variables }).retain();
          applyData(result.data);
          return;
        }

        await recordSearch.fetchMore({
          variables,
          updateQuery: (previous, { fetchMoreResult }) => {
            if (!fetchMoreResult) return previous;
            const existingIds = new Set(
              previous.searchRoutineRecords.searchEdges.map(edge => {
                const node = edge.node as any;
                return node.id;
              })
            );
            return {
              ...fetchMoreResult,
              searchRoutineRecords: {
                ...fetchMoreResult.searchRoutineRecords,
                searchEdges: [
                  ...previous.searchRoutineRecords.searchEdges,
                  ...fetchMoreResult.searchRoutineRecords.searchEdges.filter(
                    edge => {
                      const node = edge.node as any;
                      return !existingIds.has(node.id);
                    }
                  ),
                ],
              },
            };
          },
        });
      } finally {
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    },
    [
      applyData,
      cursor,
      executeSearch,
      hasMore,
      recordSearch.fetchMore,
      routineIdsSignature,
    ]
  );

  useEffect(() => {
    if (routineIds.length === 0) {
      setRecords([]);
      setTotalCount(0);
      setCursor(null);
      setHasMore(false);
      return;
    }
    void searchRecords(true);
  }, [routineIdsSignature]);

  const filteredRecords = records.filter(
    record => status === "All" || record.status === status
  );

  return (
    <section className="@container flex max-h-[480px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            {t("workspace.records.routineTitle")}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredRecords.length}
            <span className="px-0.5">|</span>
            {totalCount}
          </span>
        </div>
        <Select
          value={status}
          onValueChange={value =>
            setStatus(value as RoutineRecordStatus | "All")
          }
        >
          <SelectTrigger className="h-8 w-32 rounded-sm text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            <SelectItem value="All">
              {t("workspace.table.allStatus")}
            </SelectItem>
            {AllRoutineRecordStatuses.map(recordStatus => (
              <SelectItem key={recordStatus} value={recordStatus}>
                {translateRoutineRecordStatus(recordStatus, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={event => {
          if (isSearching || !hasMore) return;
          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.6) return;
          void searchRecords(false);
        }}
      >
        <Table className="table-fixed text-xs">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary">
            <TableRow>
              <TableHead className="h-9 w-[20%] px-2">
                {t("workspace.table.routine")}
              </TableHead>
              <TableHead className="h-9 w-[14%] px-2">
                {t("workspace.table.status")}
              </TableHead>
              <TableHead className="h-9 w-[18%] px-2">
                {t("workspace.table.scheduled")}
              </TableHead>
              <TableHead className="h-9 w-[28%] px-2">
                {t("workspace.table.tasks")}
              </TableHead>
              <TableHead className="h-9 w-[12%] px-2">
                {t("workspace.table.ended")}
              </TableHead>
              <TableHead className="h-9 w-[8%] px-2" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map(record => {
              const routine = stationRoutineManager.getRoutineById(
                record.routineId
              );
              return (
                <TableRow key={record.id}>
                  <TableCell className="px-2 py-2.5">
                    <span className="line-clamp-2">
                      {routine?.title ?? record.routineId}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {translateRoutineRecordStatus(record.status, t)}
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {record.scheduledAt.toLocaleString(i18n.resolvedLanguage)}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 tabular-nums">
                    {record.successTaskCount}/{record.totalTaskCount}
                    <span className="ml-1 text-muted-foreground">
                      ({record.failedTaskCount} {t("workspace.status.failed")},{" "}
                      {record.blockedTaskCount} {t("workspace.status.blocked")})
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {record.actualEndedAt?.toLocaleString(
                      i18n.resolvedLanguage
                    ) ?? t("workspace.period.none")}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 rounded-sm"
                      aria-label={t("workspace.records.title")}
                      onClick={() => {
                        if (!routine) return;
                        modalManager.open("RoutineTaskRecordDialog", {
                          routineTitle: routine.title,
                          routineTaskIds: routine.routineTaskIds,
                          routineRecordId: record.id,
                        });
                      }}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {isSearching
                    ? t("workspace.records.loadingRoutineRecords")
                    : t("workspace.records.noRoutineRecords")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default RoutineRecordTable;
