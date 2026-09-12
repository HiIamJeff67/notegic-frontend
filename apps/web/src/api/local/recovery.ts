import type { LocalDBDiagnostics, LocalDBResult } from "./diagnostics";

export type LocalDBRecoveryClassification = {
  result: LocalDBResult;
  errorCode: string;
  errorMessage: string;
};

export const isOPFSMissingFileError = (
  error: unknown,
  databasePath?: string
): boolean => {
  let current: unknown = error;
  for (let depth = 0; depth < 8; depth += 1) {
    if (current === null || current === undefined) break;

    if (
      typeof DOMException !== "undefined" &&
      current instanceof DOMException &&
      current.name === "NotFoundError"
    ) {
      return true;
    }

    if (current instanceof Error) {
      const message = current.message ?? "";
      if (message.includes("GetSyncHandleError")) return true;
      if (
        message.includes("NotFoundError") &&
        (message.includes("xLock") ||
          (databasePath !== undefined &&
            databasePath.length > 0 &&
            message.includes(databasePath)))
      ) {
        return true;
      }
      if (
        message.includes("unable to open database file") ||
        message.includes("SQLITE_CANTOPEN")
      ) {
        return true;
      }

      current = (current as { cause?: unknown }).cause;
      continue;
    }

    break;
  }

  return false;
};

export const classifyLocalDBError = (
  error: unknown,
  phase: string
): LocalDBRecoveryClassification => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const normalizedMessage = errorMessage.toLowerCase();

  if (
    normalizedMessage.includes("timeout") ||
    normalizedMessage.includes("timed out") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("fetch") ||
    normalizedMessage.includes("websocket") ||
    normalizedMessage.includes("not ready")
  ) {
    return {
      result: "retryable",
      errorCode: "LOCAL_DB_TRANSIENT_FAILURE",
      errorMessage,
    };
  }

  if (
    phase.includes("worker") ||
    normalizedMessage.includes("driver") ||
    normalizedMessage.includes("opfs") ||
    normalizedMessage.includes("storage") ||
    normalizedMessage.includes("schema") ||
    normalizedMessage.includes("pragma")
  ) {
    return {
      result: "manual-recovery",
      errorCode: "LOCAL_DB_RUNTIME_FAILURE",
      errorMessage,
    };
  }

  return {
    result: "needs-action",
    errorCode: "LOCAL_DB_MIGRATION_FAILURE",
    errorMessage,
  };
};

export const createLocalDBDiagnosticsExport = (
  diagnostics: LocalDBDiagnostics
): string =>
  JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      phase: diagnostics.phase,
      previousPhase: diagnostics.previousPhase,
      result: diagnostics.result,
      recoverability: diagnostics.recoverability,
      currentVersion: diagnostics.currentVersion,
      targetVersion: diagnostics.targetVersion,
      pendingCount: diagnostics.pendingCount,
      terminalFailureCount: diagnostics.terminalFailureCount,
      activeOperationCount: diagnostics.activeOperationCount,
      errorCode: diagnostics.errorCode,
      errorMessage: diagnostics.errorMessage,
      updatedAt: diagnostics.updatedAt,
      workerEvents: diagnostics.workerEvents,
      browser: {
        userAgent:
          typeof navigator === "undefined" ? null : navigator.userAgent,
        language: typeof navigator === "undefined" ? null : navigator.language,
        online: typeof navigator === "undefined" ? null : navigator.onLine,
        crossOriginIsolated:
          typeof crossOriginIsolated === "undefined"
            ? null
            : crossOriginIsolated,
        indexedDB: typeof indexedDB !== "undefined",
        opfs: typeof navigator !== "undefined" && "storage" in navigator,
      },
    },
    null,
    2
  );

export const downloadTextFile = (
  contents: string,
  filename: string,
  contentType = "application/json"
): void => {
  if (typeof document === "undefined") return;

  const url = URL.createObjectURL(new Blob([contents], { type: contentType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
