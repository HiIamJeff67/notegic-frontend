import {
  SearchRoutineTaskRecordSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTaskRecordsLazyQuery } from "@/api/graphql/hooks/useSearchRoutineTaskRecords";
import {
  AllRoutineTaskPurposes,
  AllRoutineTaskRecordStatuses,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";
import { HistoryIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
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
import {
  translateRoutineTaskPurpose,
  translateRoutineTaskRecordStatus,
} from "@shared/i18n/workspace";

type RoutineTaskRecordRow = {
  id: UUID;
  routineTaskId: UUID;
  purpose: RoutineTaskPurpose;
  status: RoutineTaskRecordStatus;
  errorCode: string | null;
  errorReason: string | null;
  costUnit: number;
  totalAttempts: number;
  scheduledAt: Date;
  actualStartedAt: Date | null;
  actualEndedAt: Date | null;
};

const RoutineTaskRecordTable = ({
  routineTaskIds = [],
}: {
  routineTaskIds?: UUID[];
}) => {
  const { i18n, t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const [executeSearch, recordSearch] = useSearchRoutineTaskRecordsLazyQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [records, setRecords] = useState<RoutineTaskRecordRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = useRef(false);
  const hasExecutedRef = useRef(false);
  const [status, setStatus] = useState<RoutineTaskRecordStatus | "All">("All");
  const [purpose, setPurpose] = useState<RoutineTaskPurpose | "All">("All");
  const [scheduledAfter, setScheduledAfter] = useState<Date | undefined>();
  const [scheduledBefore, setScheduledBefore] = useState<Date | undefined>();
  const routineTaskIdSignature = routineTaskIds.join("|");

  const applyData = useCallback((data?: any) => {
    const nextRecords = (data?.searchRoutineTaskRecords.searchEdges ?? []).map(
      (edge: any) => {
        const node = edge.node as any;
        return {
          id: node.id,
          routineTaskId: node.routineTaskId,
          purpose: node.purpose.replace("RoutineTaskPurpose_", ""),
          status: node.status.replace("RoutineTaskRecordStatus_", ""),
          errorCode:
            node.errorCode?.replace("RoutineTaskRecordErrorCode_", "") ?? null,
          errorReason: node.errorReason ?? null,
          costUnit: node.costUnit,
          totalAttempts: node.totalAttempts,
          scheduledAt: new Date(node.scheduledAt),
          actualStartedAt:
            node.actualStartedAt === null
              ? null
              : new Date(node.actualStartedAt),
          actualEndedAt:
            node.actualEndedAt === null ? null : new Date(node.actualEndedAt),
        } satisfies RoutineTaskRecordRow;
      }
    );

    setRecords(nextRecords);
    setTotalCount(data?.searchRoutineTaskRecords.totalCount ?? 0);
    setCursor(
      data?.searchRoutineTaskRecords.searchPageInfo.endEncodedSearchCursor ??
        null
    );
    setHasMore(
      data?.searchRoutineTaskRecords.searchPageInfo.hasNextPage ?? false
    );
  }, []);

  const searchRecords = useCallback(
    async (reset: boolean) => {
      if (isSearchingRef.current) return;
      if (!reset && (!hasMore || !cursor)) return;

      isSearchingRef.current = true;
      setIsSearching(true);
      try {
        const variables = {
          input: {
            routineTaskIds,
            query: "",
            after: reset ? undefined : (cursor ?? undefined),
            first: reset ? 20 : 10,
            sortBy: SearchRoutineTaskRecordSortBy.ScheduledAt,
            sortOrder: SearchSortOrder.Desc,
          },
        };

        if (reset || !hasExecutedRef.current) {
          hasExecutedRef.current = true;
          await executeSearch({ variables }).retain();
        } else {
          await recordSearch.fetchMore({
            variables,
            updateQuery: (previous, { fetchMoreResult }) => {
              if (!fetchMoreResult) return previous;
              const ids = new Set(
                previous.searchRoutineTaskRecords.searchEdges.map(edge => {
                  const node = edge.node as any;
                  return node.id;
                })
              );
              return {
                ...fetchMoreResult,
                searchRoutineTaskRecords: {
                  ...fetchMoreResult.searchRoutineTaskRecords,
                  searchEdges: [
                    ...previous.searchRoutineTaskRecords.searchEdges,
                    ...fetchMoreResult.searchRoutineTaskRecords.searchEdges.filter(
                      edge => {
                        const node = edge.node as any;
                        return !ids.has(node.id);
                      }
                    ),
                  ],
                },
              };
            },
          });
        }
      } finally {
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    },
    [
      cursor,
      executeSearch,
      hasMore,
      recordSearch.fetchMore,
      routineTaskIdSignature,
    ]
  );

  useEffect(() => {
    if (!recordSearch.data) return;
    applyData(recordSearch.data);
  }, [applyData, recordSearch.data]);

  useEffect(() => {
    void searchRecords(true);
  }, [routineTaskIdSignature]);

  const filteredRecords = records.filter(record => {
    if (status !== "All" && record.status !== status) return false;
    if (purpose !== "All" && record.purpose !== purpose) return false;
    if (scheduledAfter && record.scheduledAt < scheduledAfter) return false;
    if (scheduledBefore && record.scheduledAt > scheduledBefore) return false;
    return true;
  });

  return (
    <section className="@container flex max-h-[480px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
      <div className="flex min-h-11 select-none items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2 @max-[1040px]:flex-col @max-[1040px]:items-start">
        <div className="flex min-w-0 items-center gap-2">
          <HistoryIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            {t("workspace.table.routineTaskRecordTable")}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredRecords.length}
            <span className="px-0.5">|</span>
            {totalCount}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 @max-[1040px]:grid @max-[1040px]:w-full @max-[1040px]:grid-cols-[repeat(auto-fit,minmax(6.75rem,1fr))] @max-[1040px]:justify-start">
          <Select
            value={status}
            onValueChange={value =>
              setStatus(value as RoutineTaskRecordStatus | "All")
            }
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-32 min-w-0 rounded-sm text-xs @max-[1040px]:w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              <SelectItem value="All">
                {t("workspace.table.allStatus")}
              </SelectItem>
              {AllRoutineTaskRecordStatuses.map(recordStatus => (
                <SelectItem key={recordStatus} value={recordStatus}>
                  {translateRoutineTaskRecordStatus(recordStatus, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {AllRoutineTaskPurposes.map(taskPurpose => (
                <SelectItem key={taskPurpose} value={taskPurpose}>
                  {translateRoutineTaskPurpose(taskPurpose, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            value={scheduledAfter}
            onValueChange={setScheduledAfter}
            placeholder={t("workspace.table.scheduledAfter")}
            className="h-8 w-40 min-w-0 text-xs @max-[1040px]:w-full @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
          />
          <DatePicker
            value={scheduledBefore}
            onValueChange={setScheduledBefore}
            placeholder={t("workspace.table.scheduledBefore")}
            className="h-8 w-40 min-w-0 text-xs @max-[1040px]:w-full @max-[520px]:justify-center @max-[520px]:px-0 @max-[520px]:[&_span]:hidden"
          />
        </div>
      </div>
      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={event => {
          if (isSearching || !hasMore) return;
          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.55) return;
          void searchRecords(false);
        }}
      >
        <Table className="table-fixed text-xs">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:whitespace-normal [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:leading-tight">
            <TableRow>
              <TableHead className="h-9 w-[18%] px-2">
                {t("workspace.table.task")}
              </TableHead>
              <TableHead className="h-9 w-[14%] px-2">
                {t("workspace.table.status")}
              </TableHead>
              <TableHead className="h-9 w-[16%] px-2">
                {t("workspace.table.purpose")}
              </TableHead>
              <TableHead className="h-9 w-[15%] px-2">
                {t("workspace.table.scheduled")}
              </TableHead>
              <TableHead className="h-9 w-[15%] px-2">
                {t("workspace.table.ended")}
              </TableHead>
              <TableHead className="h-9 w-[10%] px-2">
                {t("workspace.table.cost")}
              </TableHead>
              <TableHead className="h-9 w-[12%] px-2">
                {t("workspace.table.error")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map(record => {
              const task = stationRoutineManager.getRoutineTaskById(
                record.routineTaskId
              );
              return (
                <TableRow key={record.id}>
                  <TableCell className="px-2 py-2.5">
                    <span className="line-clamp-2">
                      {task?.title ?? record.routineTaskId}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {translateRoutineTaskRecordStatus(record.status, t)}
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="line-clamp-2">
                      {translateRoutineTaskPurpose(record.purpose, t)}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {record.scheduledAt.toLocaleString(i18n.resolvedLanguage)}
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {record.actualEndedAt?.toLocaleString(
                      i18n.resolvedLanguage
                    ) ?? t("workspace.period.none")}
                  </TableCell>
                  <TableCell className="px-2 py-2.5 tabular-nums">
                    {record.costUnit}
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="line-clamp-2">
                      {record.errorCode ??
                        record.errorReason ??
                        t("workspace.period.none")}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {isSearching
                    ? t("workspace.records.loading")
                    : t("workspace.records.noMatches")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default RoutineTaskRecordTable;
