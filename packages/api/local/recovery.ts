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
  const message = errorMessage.toLowerCase();

  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("websocket") ||
    message.includes("not ready")
  ) {
    return {
      result: "retryable",
      errorCode: "LOCAL_DB_TRANSIENT_FAILURE",
      errorMessage,
    };
  }

  if (
    phase.includes("worker") ||
    message.includes("driver") ||
    message.includes("opfs") ||
    message.includes("storage") ||
    message.includes("schema") ||
    message.includes("pragma")
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

// JSON alone drops Blob/File contents and the type of Yjs byte arrays.
export const createLocalDataExport = async (
  database: File,
  indexedDB: unknown
): Promise<string> => {
  const encode = async (value: unknown): Promise<unknown> => {
    if (
      value instanceof Blob ||
      value instanceof ArrayBuffer ||
      ArrayBuffer.isView(value)
    ) {
      const bytes =
        value instanceof Blob
          ? new Uint8Array(await value.arrayBuffer())
          : value instanceof ArrayBuffer
            ? new Uint8Array(value)
            : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      }
      return {
        type: value.constructor.name,
        base64: btoa(binary),
        ...(value instanceof Blob ? { contentType: value.type } : {}),
        ...(value instanceof File
          ? { name: value.name, lastModified: value.lastModified }
          : {}),
      };
    }
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return await Promise.all(value.map(encode));
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(value).map(async ([key, item]) => [
            key,
            await encode(item),
          ])
        )
      );
    }
    return value;
  };

  return JSON.stringify(
    {
      formatVersion: 2,
      exportedAt: new Date().toISOString(),
      warning:
        "This export may contain notes, personal workspace data, and local synchronization metadata.",
      database: await encode(database),
      indexedDB: await encode(indexedDB),
    },
    null,
    2
  );
};

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
