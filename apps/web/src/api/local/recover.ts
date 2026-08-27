import { SQLocalDrizzle } from "sqlocal/drizzle";

let isOPFSRecoveryInFlight: Promise<void> | null = null;

export const isOPFSMissingFileError = (error: unknown): boolean => {
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
          message.includes(import.meta.env.VITE_LOCAL_DATABASE_PATH))
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

// try to recover database instance from the error about OPFS
export const recoverOPFSError = async (sqlocalDrizzle: SQLocalDrizzle) => {
  if (isOPFSRecoveryInFlight) return await isOPFSRecoveryInFlight;

  isOPFSRecoveryInFlight = (async () => {
    try {
      await sqlocalDrizzle.deleteDatabaseFile();
    } catch (error) {
      if (isOPFSMissingFileError(error)) return;
      throw error;
    }
  })().finally(() => {
    isOPFSRecoveryInFlight = null;
  });

  await isOPFSRecoveryInFlight;
};
