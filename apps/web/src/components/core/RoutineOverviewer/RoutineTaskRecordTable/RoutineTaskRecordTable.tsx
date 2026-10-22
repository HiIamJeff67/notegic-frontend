import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast";
import {
  SearchRoutineTaskRecordSortBy,
  type FragmentedPrivateRoutineTaskRecordFragment,
  type RoutineTaskRecordStatus as GraphQLRoutineTaskRecordStatus,
} from "@shared/api/graphql/generated/graphql";
import {
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import { routineTaskPurposeTKeys } from "@shared/i18n/enums/routineTaskPurpose.tKey";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { useTranslation } from "@shared/i18n/useTranslation";
import type { UUID } from "crypto";
import { HistoryIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchRoutineTaskRecordsQuery } from "@/api/graphql/hooks/useSearchRoutineTaskRecords";
import RoutineRecordFilters, {
  defaultRoutineRecordFilters,
  type RoutineRecordFiltersValue,
} from "@/components/core/RoutineOverviewer/RoutineRecordFilters/RoutineRecordFilters";
import { useDebounceValue } from "@/hooks/useDebounce";
import RoutineTaskStatusDot from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStationRoutine } from "@/hooks";

const RoutineTaskRecordTable = ({
  routineTaskIds = [],
}: {
  routineTaskIds?: UUID[];
}) => {
  const { i18n, t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const [filters, setFilters] = useState<RoutineRecordFiltersValue>(
    defaultRoutineRecordFilters
  );
  const query = useDebounceValue(filters.query);
  const invalidRange = Boolean(
    filters.actualStartedAtFrom &&
      filters.actualStartedAtBefore &&
      filters.actualStartedAtFrom >= filters.actualStartedAtBefore
  );
  const input = {
    ...filters,
    query,
    status: filters.status as GraphQLRoutineTaskRecordStatus | undefined,
    sortBy: filters.sortBy as SearchRoutineTaskRecordSortBy,
    routineTaskIds,
    first: 20,
  };
  const recordSearch = useSearchRoutineTaskRecordsQuery(
    { input },
    { skip: invalidRange, fetchPolicy: "cache-and-network" }
  );

  const viewport = useRef<HTMLDivElement>(null);
  const searchSignature = JSON.stringify(input);
  useEffect(() => {
    viewport.current?.scrollTo({ top: 0 });
  }, [searchSignature]);

  const pendingCursor = useRef<string | null>(null);
  const connection = recordSearch.data?.searchRoutineTaskRecords;
  const isSearching = recordSearch.loading;
  const hasMore = connection?.searchPageInfo.hasNextPage ?? false;
  const cursor = connection?.searchPageInfo.endEncodedSearchCursor;
  const loadMoreRecords = async () => {
    if (
      invalidRange ||
      isSearching ||
      !hasMore ||
      !cursor ||
      pendingCursor.current === cursor
    )
      return;
    pendingCursor.current = cursor;
    try {
      await recordSearch.fetchMore({
        variables: { input: { ...input, after: cursor } },
      });
    } catch (error) {
      toast.error(tError(error, t));
    } finally {
      if (pendingCursor.current === cursor) pendingCursor.current = null;
    }
  };

  const records = invalidRange
    ? []
    : (connection?.searchEdges ?? []).map(edge => {
        const node = edge.node as FragmentedPrivateRoutineTaskRecordFragment;
        return {
          ...node,
          purpose: node.purpose.replace(
            "RoutineTaskPurpose_",
            ""
          ) as RoutineTaskPurpose,
          status: node.status.replace(
            "RoutineTaskRecordStatus_",
            ""
          ) as RoutineTaskRecordStatus,
          errorCode:
            node.errorCode?.replace("RoutineTaskRecordErrorCode_", "") ?? null,
          actualStartedAt: node.actualStartedAt
            ? new Date(node.actualStartedAt)
            : null,
          actualEndedAt: node.actualEndedAt
            ? new Date(node.actualEndedAt)
            : null,
        };
      });

  return (
    <section className="@container flex max-h-[480px] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card">
      <div className="flex min-h-11 shrink-0 select-none items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2 flex-wrap">
        <div className="flex min-w-0 items-center gap-2">
          <HistoryIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            {t("workspace.table.routineTaskRecordTable")}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {records.length}
          </span>
        </div>
        <RoutineRecordFilters task value={filters} onChange={setFilters} />
      </div>
      <div
        ref={viewport}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain [&>div]:overflow-visible"
        onScroll={event => {
          if (isSearching || !hasMore) return;
          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.55) return;
          void loadMoreRecords();
        }}
      >
        <Table className="table-fixed text-xs">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:whitespace-normal [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:leading-tight [&_th]:text-left">
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
                {t("workspace.table.started")}
              </TableHead>
              <TableHead className="h-9 w-[15%] px-2">
                {t("workspace.table.ended")}
              </TableHead>
              <TableHead className="h-9 w-[12%] px-2">
                {t("workspace.table.error")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map(record => {
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
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <RoutineTaskStatusDot status={record.status} />
                      <span className="truncate">
                        {t(routineTaskRecordStatusTKeys[record.status])}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <span className="line-clamp-2">
                      {`${t(routineTaskPurposeTKeys[record.purpose].action)} · ${t(routineTaskPurposeTKeys[record.purpose].target)}`}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {record.actualStartedAt?.toLocaleString(
                      i18n.resolvedLanguage
                    ) ?? t("workspace.period.none")}
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {record.actualEndedAt?.toLocaleString(
                      i18n.resolvedLanguage
                    ) ?? t("workspace.period.none")}
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
            {records.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
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
