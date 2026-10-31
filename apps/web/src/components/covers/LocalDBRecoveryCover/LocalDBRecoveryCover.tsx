import { useTranslation } from "@shared/i18n/useTranslation";
import type { TFunction } from "i18next";
import {
  ChevronDownIcon,
  DownloadIcon,
  MessageSquareWarningIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type LocalDBRebuildPreflight, localDB } from "@/api/local/db";
import type {
  LocalDBDiagnostics,
  LocalDBResult,
} from "@/api/local/diagnostics";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useLoading } from "@/hooks/useLoading";

const recoveryPhases = new Set([
  "failed",
  "needs-action",
  "manual-recovery",
  "checking-rebuildability",
]);
const RECOVERY_NOTICE_TIMEOUT_MS = 30_000;

const getPhaseLabel = (
  phase: LocalDBDiagnostics["phase"],
  t: TFunction
): string => {
  switch (phase) {
    case "worker-connection-pending":
      return t("localDBRecovery.phases.workerConnectionPending");
    case "worker-connected":
      return t("localDBRecovery.phases.workerConnected");
    case "migration-lock-pending":
      return t("localDBRecovery.phases.migrationLockPending");
    case "migration-lock-acquired":
      return t("localDBRecovery.phases.migrationLockAcquired");
    case "reading-version":
      return t("localDBRecovery.phases.readingVersion");
    case "freezing-local-writes":
      return t("localDBRecovery.phases.freezingLocalWrites");
    case "waiting-for-local-operations":
      return t("localDBRecovery.phases.waitingForLocalOperations");
    case "checking-transaction-queue":
      return t("localDBRecovery.phases.checkingTransactionQueue");
    case "flushing-yjs":
      return t("localDBRecovery.phases.flushingYjs");
    case "checking-rebuildability":
      return t("localDBRecovery.phases.checkingRebuildability");
    case "exporting-local-data":
      return t("localDBRecovery.phases.exportingLocalData");
    case "clearing-local-storage":
      return t("localDBRecovery.phases.clearingLocalStorage");
    case "rebuild-in-progress":
      return t("localDBRecovery.phases.rebuilding");
    case "migrating":
      return t("localDBRecovery.phases.migrating");
    case "bootstrapping":
      return t("localDBRecovery.phases.bootstrapping");
    case "verifying":
      return t("localDBRecovery.phases.verifying");
    case "verifying-schema":
      return t("localDBRecovery.phases.verifyingSchema");
    case "resynchronizing":
      return t("localDBRecovery.phases.resynchronizing");
    case "ready":
      return t("localDBRecovery.phases.ready");
    case "needs-action":
      return t("localDBRecovery.phases.needsAction");
    case "manual-recovery":
      return t("localDBRecovery.phases.manualRecovery");
    default:
      return t("localDBRecovery.phases.failed");
  }
};

const getResultLabel = (result: LocalDBResult, t: TFunction): string => {
  switch (result) {
    case "success":
      return t("localDBRecovery.results.success");
    case "retryable":
      return t("localDBRecovery.results.retryable");
    case "needs-action":
      return t("localDBRecovery.results.needsAction");
    case "safe-to-rebuild":
      return t("localDBRecovery.results.safeToRebuild");
    case "manual-recovery":
      return t("localDBRecovery.results.manualRecovery");
  }
};

export const LocalDBRecoveryCover = () => {
  const { t } = useTranslation();
  const { startAsyncTransactionLoading } = useLoading();
  const diagnostics = useSyncExternalStore(
    localDB.subscribeToDiagnostics,
    localDB.getDiagnostics,
    () => null
  );
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [preflight, setPreflight] = useState<LocalDBRebuildPreflight | null>(
    null
  );
  const [hasExportedDiagnostics, setHasExportedDiagnostics] = useState(false);
  const [rebuildOpen, setRebuildOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [dataChecked, setDataChecked] = useState(false);
  const [hasExportedLocalData, setHasExportedLocalData] = useState(false);
  const [isNoticeHovered, setIsNoticeHovered] = useState(false);
  const [isNoticeFocused, setIsNoticeFocused] = useState(false);
  const countdownRef = useRef<HTMLDivElement>(null);
  const countdownAnimationRef = useRef<Animation | null>(null);
  const needsRecovery =
    diagnostics !== null && recoveryPhases.has(diagnostics.phase);
  const rebuildAttemptedAt = diagnostics?.rebuildAttemptedAt ?? null;
  const showNotice =
    diagnostics !== null && !needsRecovery && rebuildAttemptedAt !== null;

  useEffect(() => {
    if (!showNotice || !countdownRef.current) return;
    const notice = countdownRef.current.parentElement;
    setIsNoticeHovered(notice?.matches(":hover") ?? false);
    setIsNoticeFocused(notice?.contains(document.activeElement) ?? false);
    const animation = countdownRef.current.animate(
      [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
      {
        duration: RECOVERY_NOTICE_TIMEOUT_MS,
        easing: "linear",
        fill: "forwards",
      }
    );
    countdownAnimationRef.current = animation;
    animation.onfinish = () => {
      const current = localDB.getDiagnostics();
      if (current.rebuildAttemptedAt === rebuildAttemptedAt) {
        localDB.transitionDiagnostics(current.phase, {
          rebuildAttemptedAt: null,
        });
      }
    };
    return () => {
      animation.onfinish = null;
      animation.cancel();
      countdownAnimationRef.current = null;
    };
  }, [showNotice, rebuildAttemptedAt]);

  useEffect(() => {
    const animation = countdownAnimationRef.current;
    if (!animation) return;
    if (isNoticeHovered || isNoticeFocused || reportOpen) animation.pause();
    else animation.play();
  }, [
    showNotice,
    rebuildAttemptedAt,
    isNoticeHovered,
    isNoticeFocused,
    reportOpen,
  ]);

  if (!diagnostics) return null;

  const retry = async () => {
    setIsBusy(true);
    setActionError(null);
    if (
      diagnostics.errorCode === "LOCAL_DB_RUNTIME_FAILURE" ||
      diagnostics.errorCode === "LOCAL_DB_TRANSIENT_FAILURE" ||
      diagnostics.errorCode === "LOCAL_DB_REBUILD_FAILED" ||
      diagnostics.errorCode === "LOCAL_DB_REBUILD_IN_ANOTHER_TAB"
    ) {
      window.location.reload();
      return;
    }
    try {
      await startAsyncTransactionLoading(() => localDB.ensureReady());
    } catch {
      setActionError(t("localDBRecovery.errors.retryFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  const exportLocalData = async () => {
    setIsBusy(true);
    setActionError(null);
    try {
      if (!window.confirm(t("localDBRecovery.confirmExport"))) {
        return;
      }
      await startAsyncTransactionLoading(() => localDB.downloadLocalData());
      setHasExportedLocalData(true);
    } catch {
      setActionError(t("localDBRecovery.errors.exportFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  const rebuild = async () => {
    if (!backupConfirmed || !hasExportedDiagnostics || !hasExportedLocalData)
      return;
    setRebuildOpen(false);
    setIsBusy(true);
    setActionError(null);
    try {
      await startAsyncTransactionLoading(() =>
        localDB.rebuild({
          diagnosticsExported: hasExportedDiagnostics,
          localDataExported: hasExportedLocalData,
          discardLocalData: backupConfirmed,
        })
      );
    } catch {
      setActionError(t("localDBRecovery.errors.rebuildFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  const checkRebuildEligibility = async () => {
    setIsBusy(true);
    setActionError(null);
    try {
      const preflight = await localDB.getRebuildPreflight();
      setPreflight(preflight);
    } catch {
      setActionError(t("localDBRecovery.errors.preflightFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  const hasAttemptedRebuild = rebuildAttemptedAt !== null;
  const reportEmail = import.meta.env.VITE_CONTACT_EMAIL || "notegic@gmail.com";

  if (!needsRecovery && !hasAttemptedRebuild) return null;

  return (
    <>
      {needsRecovery ? (
        <div className="fixed inset-0 z-9999 overflow-y-auto bg-background/95 p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <section
              aria-labelledby="local-db-recovery-title"
              className="w-full max-w-2xl rounded-xl border bg-card p-6 text-card-foreground shadow-lg"
            >
              <h1
                id="local-db-recovery-title"
                className="text-xl font-semibold"
              >
                {t("localDBRecovery.title")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {getPhaseLabel(diagnostics.phase, t)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {hasAttemptedRebuild
                  ? t("localDBRecovery.rebuildAttemptedDescription")
                  : t("localDBRecovery.description")}
              </p>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">
                    {t("localDBRecovery.labels.currentPhase")}
                  </dt>
                  <dd className="font-medium">
                    {getPhaseLabel(diagnostics.phase, t)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("localDBRecovery.labels.recoveryResult")}
                  </dt>
                  <dd className="font-medium">
                    {getResultLabel(diagnostics.result, t)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("localDBRecovery.labels.recoverability")}
                  </dt>
                  <dd className="font-medium">
                    {getResultLabel(diagnostics.recoverability, t)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("localDBRecovery.labels.databaseVersion")}
                  </dt>
                  <dd className="font-medium">
                    {diagnostics.currentVersion ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("localDBRecovery.labels.targetVersion")}
                  </dt>
                  <dd className="font-medium">
                    {diagnostics.targetVersion ?? "—"}
                  </dd>
                </div>
              </dl>

              {diagnostics.errorMessage && (
                <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                  <p className="font-medium">
                    {t("localDBRecovery.technicalDetails")}
                  </p>
                  <p className="mt-1 break-words">{diagnostics.errorMessage}</p>
                </div>
              )}
              {preflight && (
                <div
                  role="status"
                  className="mt-3 rounded-md border p-3 text-sm"
                >
                  <p className="font-medium">
                    {t("localDBRecovery.labels.rebuildEligibility")}
                  </p>
                  <p className="mt-1">{getResultLabel(preflight.result, t)}</p>
                  <p className="mt-1 break-words text-muted-foreground">
                    {preflight.reason ?? t("localDBRecovery.rebuildWarning")}
                  </p>
                </div>
              )}
              {actionError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {actionError}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void checkRebuildEligibility()}
                    disabled={isBusy}
                  >
                    <ShieldCheckIcon aria-hidden="true" />
                    {t("localDBRecovery.actions.checkRebuildEligibility")}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="group"
                        disabled={isBusy}
                      >
                        <DownloadIcon aria-hidden="true" />
                        {t("localDBRecovery.actions.export")}
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-10000" align="start">
                      <DropdownMenuItem
                        onSelect={() => {
                          localDB.downloadDiagnostics();
                          setHasExportedDiagnostics(true);
                        }}
                      >
                        {t("localDBRecovery.actions.exportDiagnostics")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => void exportLocalData()}>
                        {t("localDBRecovery.actions.exportLocalData")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    type="button"
                    onClick={() => void retry()}
                    disabled={isBusy}
                  >
                    <RefreshCwIcon aria-hidden="true" />
                    {t("localDBRecovery.actions.retry")}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="ml-auto shrink-0"
                  disabled={isBusy}
                  onClick={() => {
                    setBackupConfirmed(false);
                    setRebuildOpen(true);
                  }}
                >
                  <RotateCcwIcon aria-hidden="true" />
                  {t("localDBRecovery.actions.rebuildLocalData")}
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("localDBRecovery.rebuildHelp")}{" "}
                <Button
                  type="button"
                  variant="link"
                  data-density-static
                  className="h-auto gap-1 p-0 align-baseline"
                  disabled={isBusy}
                  onClick={() => setReportOpen(true)}
                >
                  <MessageSquareWarningIcon aria-hidden="true" />
                  {t("localDBRecovery.actions.report")}
                </Button>
              </p>
            </section>
          </div>
        </div>
      ) : (
        <section
          role="status"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl overflow-hidden rounded-md border bg-card p-6 text-card-foreground shadow-lg"
          onMouseEnter={() => setIsNoticeHovered(true)}
          onMouseLeave={() => setIsNoticeHovered(false)}
          onFocusCapture={() => setIsNoticeFocused(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setIsNoticeFocused(false);
          }}
        >
          <p className="mb-5 text-left text-sm leading-relaxed">
            {t("localDBRecovery.reportHelp")}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                localDB.transitionDiagnostics(diagnostics.phase, {
                  rebuildAttemptedAt: null,
                })
              }
            >
              {t("common.close")}
            </Button>
            <Button type="button" onClick={() => setReportOpen(true)}>
              <MessageSquareWarningIcon aria-hidden="true" />
              {t("localDBRecovery.actions.report")}
            </Button>
          </div>
          <Progress
            ref={countdownRef}
            value={100}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-none bg-transparent motion-reduce:invisible [[data-reduce-motion=true]_&]:invisible"
          />
        </section>
      )}
      <Dialog open={rebuildOpen} onOpenChange={setRebuildOpen}>
        <DialogContent
          className="z-10000 max-h-[calc(100dvh-2rem)] overflow-y-auto"
          overlayClassName="z-10000"
        >
          <DialogHeader>
            <DialogTitle>
              {t("localDBRecovery.actions.rebuildLocalData")}
            </DialogTitle>
            <DialogDescription>
              {t("localDBRecovery.rebuildWarning")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">{t("localDBRecovery.backupHelp")}</p>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={backupConfirmed}
              onCheckedChange={value => setBackupConfirmed(value === true)}
              disabled={!hasExportedDiagnostics || !hasExportedLocalData}
            />
            {t("localDBRecovery.confirmRebuild")}
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRebuildOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void rebuild()}
              disabled={
                !backupConfirmed ||
                !hasExportedDiagnostics ||
                !hasExportedLocalData ||
                isBusy
              }
            >
              <RotateCcwIcon aria-hidden="true" />
              {t("localDBRecovery.actions.rebuildLocalData")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent
          className="z-10000 max-h-[calc(100dvh-2rem)] overflow-y-auto"
          overlayClassName="z-10000"
        >
          <DialogHeader>
            <DialogTitle>{t("localDBRecovery.actions.report")}</DialogTitle>
            <DialogDescription>
              {t("localDBRecovery.reportHelp")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">{t("localDBRecovery.reportPrivacy")}</p>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={dataChecked}
              onCheckedChange={value => setDataChecked(value === true)}
              disabled={!hasAttemptedRebuild}
            />
            {t("localDBRecovery.confirmReport")}
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportOpen(false)}
            >
              {t("common.close")}
            </Button>
            {hasAttemptedRebuild && dataChecked ? (
              <Button asChild>
                <a
                  href={`mailto:${reportEmail}?subject=${encodeURIComponent(t("localDBRecovery.reportSubject"))}&body=${encodeURIComponent(t("localDBRecovery.reportBody"))}`}
                >
                  {t("localDBRecovery.actions.sendEmail")}
                </a>
              </Button>
            ) : (
              <Button disabled>{t("localDBRecovery.actions.sendEmail")}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
