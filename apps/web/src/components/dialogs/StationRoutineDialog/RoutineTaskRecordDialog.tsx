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
import { useEffect, useRef, useState } from "react";
import { useSearchRoutineTaskRecordsQuery } from "@/api/graphql/hooks/useSearchRoutineTaskRecords";
import RoutineRecordFilters, {
  defaultRoutineRecordFilters,
  type RoutineRecordFiltersValue,
} from "@/components/core/RoutineOverviewer/RoutineRecordFilters/RoutineRecordFilters";
import { useDebounceValue } from "@/hooks/useDebounce";
import RoutineTaskStatusDot from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStationRoutine } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface RoutineTaskRecordDialogProps extends ModalProps {
  routineTitle: string;
  routineTaskIds: UUID[];
  routineRecordId?: UUID;
  routineId?: UUID;
}

const RoutineTaskRecordDialog = ({
  isOpen,
  onClose,
  routineTitle,
  routineTaskIds,
  routineRecordId,
  routineId,
}: RoutineTaskRecordDialogProps) => {
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
    routineTaskIds: routineId || routineRecordId ? [] : routineTaskIds,
    routineIds: routineId ? [routineId] : undefined,
    routineRecordId,
    first: 20,
  };
  const recordSearch = useSearchRoutineTaskRecordsQuery(
    { input },
    {
      skip:
        invalidRange ||
        !isOpen ||
        (!routineId && !routineRecordId && routineTaskIds.length === 0),
      fetchPolicy: "cache-and-network",
    }
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
      !isOpen ||
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
    invalidRange || !isOpen
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
              node.errorCode?.replace("RoutineTaskRecordErrorCode_", "") ??
              null,
            actualStartedAt: node.actualStartedAt
              ? new Date(node.actualStartedAt)
              : null,
            actualEndedAt: node.actualEndedAt
              ? new Date(node.actualEndedAt)
              : null,
          };
        });
  const statusCounts = Object.values(RoutineTaskRecordStatus)
    .map(status => ({
      status,
      count: records.filter(record => record.status === status).length,
    }))
    .filter(entry => entry.count > 0);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] w-[92vw] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-md bg-card p-0 transition-[opacity,transform] sm:max-w-[92vw]">
        <DialogHeader className="shrink-0 border-b border-border bg-secondary px-6 py-5 pr-12">
          <DialogTitle>{t("workspace.records.title")}</DialogTitle>
          <DialogDescription className="truncate">
            {routineTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-border px-4 py-3">
          <RoutineRecordFilters task value={filters} onChange={setFilters} />
        </div>
        <p
          role="status"
          aria-label={t("workspace.records.summary")}
          className="overflow-x-auto whitespace-nowrap border-b border-border px-4 py-2 text-xs tabular-nums text-muted-foreground"
        >
          {t("workspace.records.loadedSummary", {
            count: records.length,
          })}
          {statusCounts.map(({ status, count }) => (
            <span
              key={status}
            >{` · ${t(routineTaskRecordStatusTKeys[status])} ${count}`}</span>
          ))}
        </p>
        <div
          ref={viewport}
          className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain [&>div]:overflow-visible"
          onScroll={event => {
            if (isSearching || !hasMore) return;
            const { clientHeight, scrollHeight, scrollTop } =
              event.currentTarget;
            if (scrollTop + clientHeight < scrollHeight * 0.65) return;
            void loadMoreRecords();
          }}
        >
          <Table className="min-w-[calc(50rem+var(--input-width)+var(--result-width))] table-fixed text-xs [--input-width:10rem] [--result-width:10rem] has-[td:nth-child(7)_details[open]]:[--input-width:30rem] has-[td:nth-child(8)_details[open]]:[--result-width:20rem]">
            <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:whitespace-normal [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:leading-tight [&_th]:text-left">
              <TableRow>
                <TableHead className="h-9 w-40 px-2">
                  {t("workspace.table.task")}
                </TableHead>
                <TableHead className="h-9 w-28 px-2">
                  {t("workspace.table.status")}
                </TableHead>
                <TableHead className="h-9 w-40 px-2">
                  {t("workspace.table.purpose")}
                </TableHead>
                <TableHead className="h-9 w-36 px-2">
                  {t("workspace.table.started")}
                </TableHead>
                <TableHead className="h-9 w-36 px-2">
                  {t("workspace.table.ended")}
                </TableHead>
                <TableHead className="h-9 w-20 px-2">
                  {t("workspace.table.attempts")}
                </TableHead>
                <TableHead className="h-9 w-[var(--input-width)] px-2">
                  {t("workspace.records.executionInput")}
                </TableHead>
                <TableHead className="h-9 w-[var(--result-width)] px-2">
                  {t("workspace.records.executionResult")}
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
                    <TableCell className="px-2 py-2.5 tabular-nums">
                      {record.attempts}
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <details>
                        <summary className="cursor-pointer text-muted-foreground">
                          {t("workspace.records.executionInput")}
                        </summary>
                        <pre className="mt-2 max-h-32 overflow-auto whitespace-pre font-mono text-[11px]">
                          {JSON.stringify(record.payloadSnapshot, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      {record.resultSnapshot &&
                      Object.keys(record.resultSnapshot).length > 0 ? (
                        <details>
                          <summary className="cursor-pointer text-muted-foreground">
                            {t("workspace.records.executionResult")}
                          </summary>
                          <pre className="mt-2 max-h-32 overflow-auto whitespace-pre font-mono text-[11px]">
                            {JSON.stringify(record.resultSnapshot, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("workspace.records.noDetailedOutput")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {records.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    {!routineId &&
                    !routineRecordId &&
                    routineTaskIds.length === 0
                      ? t("workspace.records.noLinkedTasks")
                      : isSearching
                        ? t("workspace.records.loading")
                        : t("workspace.records.noMatches")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoutineTaskRecordDialog;
