import {
  SearchRoutineTaskRecordSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import {
  AllRoutineTaskPurposes,
  AllRoutineTaskRecordStatuses,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import type { ExecutionResult } from "@shared/api/interfaces/routineTaskRecord.interface";
import {
  translateRoutineTaskPurpose,
  translateRoutineTaskRecordStatus,
} from "@shared/i18n/workspace";
import type { UUID } from "crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchRoutineTaskRecordsLazyQuery } from "@/api/graphql/hooks/useSearchRoutineTaskRecords";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import RoutineTaskStatusDot from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { ModalProps } from "@/providers/ModalProvider";

interface RoutineTaskRecordDialogProps extends ModalProps {
  routineTitle: string;
  routineTaskIds: UUID[];
  routineRecordId?: UUID;
}

const RoutineTaskRecordDialog = ({
  isOpen,
  onClose,
  routineTitle,
  routineTaskIds,
  routineRecordId,
}: RoutineTaskRecordDialogProps) => {
  const { i18n, t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const [executeSearch, recordSearch] = useSearchRoutineTaskRecordsLazyQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [status, setStatus] = useState<RoutineTaskRecordStatus | "All">("All");
  const [purpose, setPurpose] = useState<RoutineTaskPurpose | "All">("All");
  const [scheduledAfter, setScheduledAfter] = useState<Date | undefined>();
  const [scheduledBefore, setScheduledBefore] = useState<Date | undefined>();
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = useRef(false);
  const signature = [routineRecordId ?? "", ...routineTaskIds].join("|");
  const records =
    routineTaskIds.length === 0
      ? []
      : ((recordSearch.data?.searchRoutineTaskRecords?.searchEdges ?? []).map(
          edge => {
            const node = edge.node as any;
            return {
              id: node.id as UUID,
              routineTaskId: node.routineTaskId as UUID,
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
              costUnit: node.costUnit as number,
              routineRecordId: node.routineRecordId as UUID,
              attempts: node.attempts as number,
              payloadSnapshot: node.payloadSnapshot,
              resultSnapshot: node.resultSnapshot,
              actualStartedAt:
                node.actualStartedAt === null
                  ? null
                  : new Date(node.actualStartedAt),
              actualEndedAt:
                node.actualEndedAt === null
                  ? null
                  : new Date(node.actualEndedAt),
            };
          }
        ) ?? []);

  const searchRecords = useCallback(
    async (reset: boolean) => {
      if (!isOpen || routineTaskIds.length === 0 || isSearchingRef.current) {
        return;
      }
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
            sortBy: SearchRoutineTaskRecordSortBy.Attempts,
            sortOrder: SearchSortOrder.Desc,
          },
        };

        if (reset) {
          const result = await executeSearch({ variables }).retain();
          setCursor(
            result.data?.searchRoutineTaskRecords.searchPageInfo
              .endEncodedSearchCursor ?? null
          );
          setHasMore(
            result.data?.searchRoutineTaskRecords.searchPageInfo.hasNextPage ??
              false
          );
          return;
        }

        const result = await recordSearch.fetchMore({
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
        setCursor(
          result.data?.searchRoutineTaskRecords?.searchPageInfo
            .endEncodedSearchCursor ?? null
        );
        setHasMore(
          result.data?.searchRoutineTaskRecords?.searchPageInfo.hasNextPage ??
            false
        );
      } finally {
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    },
    [cursor, executeSearch, hasMore, isOpen, recordSearch.fetchMore, signature]
  );

  useEffect(() => {
    if (!isOpen) return;
    void searchRecords(true);
  }, [isOpen, signature]);

  const visibleRecords = routineRecordId
    ? records.filter(record => record.routineRecordId === routineRecordId)
    : records;
  const filteredRecords = visibleRecords.filter(record => {
    if (status !== "All" && record.status !== status) return false;
    if (purpose !== "All" && record.purpose !== purpose) return false;
    if (
      scheduledAfter &&
      (!record.actualStartedAt || record.actualStartedAt < scheduledAfter)
    )
      return false;
    if (
      scheduledBefore &&
      (!record.actualStartedAt || record.actualStartedAt > scheduledBefore)
    )
      return false;
    return true;
  });

  const deterministicRecords = visibleRecords.filter(record =>
    [
      RoutineTaskPurpose.CreateSubShelf,
      RoutineTaskPurpose.CreateBlockPack,
      RoutineTaskPurpose.CreateMaterial,
    ].includes(record.purpose)
  );
  const deterministicCompletedCount = deterministicRecords.filter(
    record => record.status === RoutineTaskRecordStatus.Success
  ).length;
  const deterministicHasFailure = deterministicRecords.some(
    record =>
      record.status === RoutineTaskRecordStatus.Failed ||
      record.status === RoutineTaskRecordStatus.Blocked ||
      record.status === RoutineTaskRecordStatus.Cancel
  );
  const deterministicHasRunningTask = deterministicRecords.some(
    record =>
      record.status === RoutineTaskRecordStatus.Running ||
      record.status === RoutineTaskRecordStatus.Ready
  );
  const deterministicBarrierStatus = deterministicHasFailure
    ? RoutineTaskRecordStatus.Blocked
    : deterministicCompletedCount === deterministicRecords.length
      ? RoutineTaskRecordStatus.Success
      : deterministicHasRunningTask
        ? RoutineTaskRecordStatus.Running
        : RoutineTaskRecordStatus.Waiting;
  const deterministicItemTotals = deterministicRecords.reduce(
    (totals, record) => {
      const result =
        typeof record.resultSnapshot === "object" &&
        record.resultSnapshot !== null
          ? (record.resultSnapshot as ExecutionResult)
          : {};
      totals.updated += result.updated ?? 0;
      totals.skipped += result.skipped ?? 0;
      totals.failed += result.failed ?? 0;
      return totals;
    },
    { failed: 0, skipped: 0, updated: 0 }
  );

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex max-h-[82vh] w-[min(94vw,48rem)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-md bg-card p-0 sm:max-w-[min(88vw,48rem)]">
        <DialogHeader className="shrink-0 border-b border-border bg-secondary px-6 py-5 pr-12">
          <DialogTitle>{t("workspace.records.title")}</DialogTitle>
          <DialogDescription className="truncate">
            {routineTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-border px-4 py-3">
          <Select
            value={status}
            onValueChange={value =>
              setStatus(value as RoutineTaskRecordStatus | "All")
            }
          >
            <SelectTrigger className="h-8 w-32 rounded-sm text-xs">
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
            <SelectTrigger className="h-8 w-40 rounded-sm text-xs">
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
            className="h-8 w-40 text-xs"
          />
          <DatePicker
            value={scheduledBefore}
            onValueChange={setScheduledBefore}
            placeholder={t("workspace.table.scheduledBefore")}
            className="h-8 w-40 text-xs"
          />
        </div>
        {deterministicRecords.length > 0 && (
          <div
            aria-label={t("workspace.records.creationBarrier")}
            className="shrink-0 border-b border-border bg-muted/20 px-4 py-3"
            role="status"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="font-medium text-sm">
                {t("workspace.records.creationBarrier")}
              </p>
              <p className="text-muted-foreground text-xs">
                {translateRoutineTaskRecordStatus(
                  deterministicBarrierStatus,
                  t
                )}
              </p>
            </div>
            <p className="mt-1 text-muted-foreground text-xs">
              {t("workspace.records.creationBarrierDescription")}
            </p>
            <p className="mt-1 text-xs tabular-nums">
              {t("workspace.records.creationBarrierProgress", {
                completed: deterministicCompletedCount,
                total: deterministicRecords.length,
              })}
              {` · ${t("workspace.records.creationBarrierItems", deterministicItemTotals)}`}
            </p>
          </div>
        )}
        <div
          className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
          onScroll={event => {
            if (isSearching || !hasMore) return;
            const { clientHeight, scrollHeight, scrollTop } =
              event.currentTarget;
            if (scrollTop + clientHeight < scrollHeight * 0.65) return;
            void searchRecords(false);
          }}
        >
          <Table className="table-fixed text-xs">
            <TableHeader className="select-none [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:whitespace-normal [&_th]:border-b [&_th]:border-border/80 [&_th]:bg-secondary [&_th]:leading-tight">
              <TableRow>
                <TableHead className="h-9 w-[20%] px-2">
                  {t("workspace.table.task")}
                </TableHead>
                <TableHead className="h-9 w-[12%] px-2">
                  {t("workspace.table.status")}
                </TableHead>
                <TableHead className="h-9 w-[18%] px-2">
                  {t("workspace.table.purpose")}
                </TableHead>
                <TableHead className="h-9 w-[18%] px-2">
                  {t("workspace.table.started")}
                </TableHead>
                <TableHead className="h-9 w-[18%] px-2">
                  {t("workspace.table.ended")}
                </TableHead>
                <TableHead className="h-9 w-[7%] px-2">
                  {t("workspace.table.cost")}
                </TableHead>
                <TableHead className="h-9 w-[7%] px-2">
                  {t("workspace.table.attempts")}
                </TableHead>
                <TableHead className="h-9 w-[8%] px-2">
                  {t("workspace.table.payload")}
                </TableHead>
                <TableHead className="h-9 w-[8%] px-2">
                  {t("workspace.table.result")}
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
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <RoutineTaskStatusDot status={record.status} />
                        <span className="truncate">
                          {translateRoutineTaskRecordStatus(record.status, t)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <span className="line-clamp-2">
                        {translateRoutineTaskPurpose(record.purpose, t)}
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
                      {record.costUnit}
                    </TableCell>
                    <TableCell className="px-2 py-2.5 tabular-nums">
                      {record.attempts}
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <details>
                        <summary className="cursor-pointer text-muted-foreground">
                          {t("workspace.payloadEditor.payloadPreview")}
                        </summary>
                        <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px]">
                          {JSON.stringify(record.payloadSnapshot, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <details>
                        <summary className="cursor-pointer text-muted-foreground">
                          {t("workspace.payloadEditor.payloadPreview")}
                        </summary>
                        <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px]">
                          {JSON.stringify(record.resultSnapshot, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    {routineTaskIds.length === 0
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
