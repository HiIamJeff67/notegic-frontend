import type { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { localDB } from "@/api/local/db";
import type {
  LocalDBDiagnostics,
  LocalDBResult,
} from "@/api/local/diagnostics";
import { Button } from "@/components/ui/button";

const recoveryPhases = new Set([
  "failed",
  "needs-action",
  "manual-recovery",
  "checking-rebuildability",
]);

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
  const [diagnostics, setDiagnostics] = useState(localDB.getDiagnostics());
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [canRebuild, setCanRebuild] = useState(false);
  const [hasExportedLocalData, setHasExportedLocalData] = useState(false);

  useEffect(() => {
    return localDB.subscribeToDiagnostics(() => {
      setDiagnostics(localDB.getDiagnostics());
    });
  }, []);

  if (!recoveryPhases.has(diagnostics.phase)) return null;

  const retry = async () => {
    setIsBusy(true);
    setActionError(null);
    try {
      await localDB.ensureReady();
      setDiagnostics(localDB.getDiagnostics());
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
      await localDB.downloadLocalData();
      setHasExportedLocalData(true);
    } catch {
      setActionError(t("localDBRecovery.errors.exportFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  const continueReadOnly = () => {
    if (!localDB.isReady) {
      setActionError(t("localDBRecovery.errors.readOnlyUnavailable"));
      return;
    }
    localDB.setReadOnly(true);
    setDiagnostics(localDB.getDiagnostics());
  };

  const rebuild = async () => {
    setIsBusy(true);
    setActionError(null);
    try {
      await localDB.rebuild({
        localDataExported: true,
        remoteDataValidated: true,
      });
    } catch {
      setActionError(t("localDBRecovery.errors.rebuildFailed"));
      setIsBusy(false);
    }
  };

  const checkRebuildEligibility = async () => {
    setIsBusy(true);
    setActionError(null);
    try {
      const preflight = await localDB.getRebuildPreflight();
      setCanRebuild(preflight.canRebuild);
      if (!preflight.canRebuild && preflight.reason) {
        setActionError(preflight.reason);
      }
    } catch {
      setActionError(t("localDBRecovery.errors.preflightFailed"));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/95 p-6">
      <section
        aria-labelledby="local-db-recovery-title"
        className="w-full max-w-2xl rounded-xl border bg-card p-6 text-card-foreground shadow-lg"
      >
        <h1 id="local-db-recovery-title" className="text-xl font-semibold">
          {t("localDBRecovery.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getPhaseLabel(diagnostics.phase, t)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("localDBRecovery.description")}
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
            <dd className="font-medium">{diagnostics.currentVersion ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {t("localDBRecovery.labels.targetVersion")}
            </dt>
            <dd className="font-medium">{diagnostics.targetVersion ?? "—"}</dd>
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
        {actionError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {actionError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void retry()} disabled={isBusy}>
            {t("localDBRecovery.actions.retry")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={isBusy}
          >
            {t("localDBRecovery.actions.reconnect")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => localDB.downloadDiagnostics()}
            disabled={isBusy}
          >
            {t("localDBRecovery.actions.exportDiagnostics")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void exportLocalData()}
            disabled={isBusy}
          >
            {t("localDBRecovery.actions.exportLocalData")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void checkRebuildEligibility()}
            disabled={isBusy}
          >
            {t("localDBRecovery.actions.checkRebuildEligibility")}
          </Button>
          {localDB.isReady && (
            <Button
              type="button"
              variant="secondary"
              onClick={continueReadOnly}
              disabled={isBusy}
            >
              {t("localDBRecovery.actions.continueReadOnly")}
            </Button>
          )}
          {canRebuild && hasExportedLocalData && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => void rebuild()}
              disabled={isBusy}
            >
              {t("localDBRecovery.actions.rebuildLocalData")}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};
