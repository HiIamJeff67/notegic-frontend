import { tError } from "@shared/i18n/error";
import toast from "@shared/lib/toast";
import {
  SearchRoutineRecordSortBy,
  type FragmentedPrivateRoutineRecordFragment,
  type RoutineRecordStatus as GraphQLRoutineRecordStatus,
} from "@shared/api/graphql/generated/graphql";
import { RoutineRecordStatus } from "@shared/api/interfaces/enums";
import { routineRecordStatusTKeys } from "@shared/i18n/enums/routineRecordStatus.tKey";
import { useTranslation } from "@shared/i18n/useTranslation";
import type { UUID } from "crypto";
import { Activity, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchRoutineRecordsQuery } from "@/api/graphql/hooks/useSearchRoutineRecords";
import RoutineRecordFilters, {
  defaultRoutineRecordFilters,
  type RoutineRecordFiltersValue,
} from "@/components/core/RoutineOverviewer/RoutineRecordFilters/RoutineRecordFilters";
import { useDebounceValue } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModal, useStationRoutine } from "@/hooks";

const RoutineRecordTable = () => {
  const { i18n, t } = useTranslation();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const [filters, setFilters] = useState<RoutineRecordFiltersValue>(
    defaultRoutineRecordFilters
  );
  const query = useDebounceValue(filters.query);
  const routineIds = stationRoutineManager.visibleRoutines.map(
    routine => routine.id
  );
  const invalidRange = Boolean(
    filters.actualStartedAtFrom &&
      filters.actualStartedAtBefore &&
      filters.actualStartedAtFrom >= filters.actualStartedAtBefore
  );
  const input = {
    ...filters,
    query,
    status: filters.status as GraphQLRoutineRecordStatus | undefined,
    sortBy: filters.sortBy as SearchRoutineRecordSortBy,
    routineIds,
    first: 20,
  };
  const recordSearch = useSearchRoutineRecordsQuery(
    { input },
    {
      skip: routineIds.length === 0 || invalidRange,
      fetchPolicy: "cache-and-network",
    }
  );

  const viewport = useRef<HTMLDivElement>(null);
  const searchSignature = JSON.stringify(input);
  useEffect(() => {
    viewport.current?.scrollTo({ top: 0 });
  }, [searchSignature]);

  const pendingCursor = useRef<string | null>(null);
  const connection = recordSearch.data?.searchRoutineRecords;
  const isSearching = recordSearch.loading;
  const hasMore = connection?.searchPageInfo.hasNextPage ?? false;
  const cursor = connection?.searchPageInfo.endEncodedSearchCursor;
  const loadMoreRecords = async () => {
    if (
      routineIds.length === 0 ||
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

  const records =
    routineIds.length === 0 || invalidRange
      ? []
      : (connection?.searchEdges ?? []).map(edge => {
          const node = edge.node as FragmentedPrivateRoutineRecordFragment;
          return {
            ...node,
            status: node.status.replace(
              "RoutineRecordStatus_",
              ""
            ) as RoutineRecordStatus,
            scheduledAt: new Date(node.scheduledAt),
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
      <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-secondary px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium @max-[520px]:sr-only">
            {t("workspace.records.routineTitle")}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {records.length}
          </span>
        </div>
        <RoutineRecordFilters value={filters} onChange={setFilters} />
      </div>
      <div
        ref={viewport}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain [&>div]:overflow-visible"
        onScroll={event => {
          if (isSearching || !hasMore) return;
          const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
          if (scrollTop + clientHeight < scrollHeight * 0.6) return;
          void loadMoreRecords();
        }}
      >
        <Table className="table-fixed text-xs">
          <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:text-left">
            <TableRow>
              <TableHead className="h-9 w-[20%] px-2">
                {t("workspace.table.routine")}
              </TableHead>
              <TableHead className="h-9 w-[14%] px-2">
                {t("workspace.table.status")}
              </TableHead>
              <TableHead className="h-9 w-[18%] px-2">
                {t("workspace.table.started")}
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
            {records.map(record => {
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
                    {t(routineRecordStatusTKeys[record.status])}
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    {record.actualStartedAt?.toLocaleString(
                      i18n.resolvedLanguage
                    ) ?? t("workspace.period.none")}
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
                          routineId: routine.id,
                        });
                      }}
                    >
                      <Eye className="size-3.5" />
                    </Button>
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
