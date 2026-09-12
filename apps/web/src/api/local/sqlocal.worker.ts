import { SQLiteOpfsDriver, SQLocalProcessor } from "sqlocal";
import {
  type LocalDBWorkerDiagnostic,
  localDBWorkerDiagnosticMessageType,
} from "./diagnostics";

const workerScope = self as typeof self & {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { value: String(error) };
};

const getWorkerCapabilities = () => ({
  fileSystemFileHandle: typeof globalThis.FileSystemFileHandle,
  crossOriginIsolated: globalThis.crossOriginIsolated,
  sharedArrayBuffer: typeof globalThis.SharedArrayBuffer,
  atomics: typeof globalThis.Atomics,
  atomicsWait: typeof globalThis.Atomics?.wait,
  atomicsWaitAsync: typeof globalThis.Atomics?.waitAsync,
  worker: typeof globalThis.Worker,
  opfsDirectory: typeof globalThis.navigator?.storage?.getDirectory,
  fileSystemHandle: typeof globalThis.FileSystemHandle,
  fileSystemDirectoryHandle: typeof globalThis.FileSystemDirectoryHandle,
  syncAccessHandle: typeof Reflect.get(
    globalThis.FileSystemFileHandle?.prototype ?? {},
    "createSyncAccessHandle"
  ),
});

const report = (
  stage: LocalDBWorkerDiagnostic["stage"],
  details?: Record<string, unknown>
) => {
  const event: LocalDBWorkerDiagnostic = {
    stage,
    details,
    updatedAt: Date.now(),
  };

  workerScope.postMessage({
    type: localDBWorkerDiagnosticMessageType,
    event,
  });
};

const installNestedWorkerDiagnostics = () => {
  const NativeWorker = globalThis.Worker;
  if (typeof NativeWorker !== "function") {
    report("worker-capabilities", {
      ...getWorkerCapabilities(),
      nestedWorkerInstrumentation: "unavailable",
    });
    return;
  }

  let nestedWorkerSequence = 0;

  class DiagnosticWorker extends NativeWorker {
    constructor(scriptURL: string | URL, options?: WorkerOptions) {
      const url = String(scriptURL);
      const workerId = ++nestedWorkerSequence;
      report("nested-worker-constructing", {
        workerId,
        url,
        type: options?.type ?? "classic",
      });

      super(scriptURL, options);

      report("nested-worker-created", { workerId, url });
      this.addEventListener("message", event => {
        const data = event.data;
        if (!data || typeof data !== "object") return;

        const message = data as Record<string, unknown>;
        const type = typeof message.type === "string" ? message.type : null;
        const result =
          typeof message.result === "string" ? message.result : null;
        if (
          type === "opfs-async-loaded" ||
          type === "opfs-async-inited" ||
          type === "opfs-unavailable" ||
          type === "sqlite3-api"
        ) {
          report("nested-worker-message", {
            workerId,
            url,
            type,
            result,
          });
        }
      });
      this.addEventListener("error", event => {
        report("nested-worker-error", {
          workerId,
          url,
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: serializeError(event.error),
        });
      });
      this.addEventListener("messageerror", () => {
        report("nested-worker-message-error", { workerId, url });
      });
    }
  }

  globalThis.Worker = DiagnosticWorker;
  report("worker-capabilities", {
    ...getWorkerCapabilities(),
    nestedWorkerInstrumentation: "installed",
  });
};

class DiagnosticSQLiteOpfsDriver extends SQLiteOpfsDriver {
  override async init(
    config: Parameters<SQLiteOpfsDriver["init"]>[0]
  ): Promise<void> {
    report("opfs-driver-init-start", {
      databasePath: config.databasePath,
    });

    try {
      if (!this.sqlite3InitModule) {
        report("sqlite-wasm-import-start");
        const { default: sqlite3InitModule } = await import(
          "@sqlite.org/sqlite-wasm"
        );
        this.sqlite3InitModule = sqlite3InitModule;
        report("sqlite-wasm-imported");
      }

      if (!this.sqlite3) {
        report("sqlite-wasm-init-start");
        this.sqlite3 = await this.sqlite3InitModule();
        report("sqlite-wasm-init-complete", {
          opfsVfs: "opfs" in this.sqlite3,
        });
      }

      await super.init(config);
      report("opfs-driver-init-complete", {
        storageType: this.storageType,
        opfsVfs: "opfs" in this.sqlite3,
      });
    } catch (error) {
      report("opfs-driver-init-failed", {
        databasePath: config.databasePath,
        error: serializeError(error),
      });
      throw error;
    }
  }

  override async exec(
    statement: Parameters<SQLiteOpfsDriver["exec"]>[0]
  ): Promise<Awaited<ReturnType<SQLiteOpfsDriver["exec"]>>> {
    const sql = statement.sql.replace(/\s+/g, " ").trim().slice(0, 160);
    report("query-start", { method: statement.method, sql });

    try {
      const result = await super.exec(statement);
      report("query-complete", {
        method: statement.method,
        sql,
        rowCount: result.rows.length,
      });
      return result;
    } catch (error) {
      report("query-failed", {
        method: statement.method,
        sql,
        error: serializeError(error),
      });
      throw error;
    }
  }
}

installNestedWorkerDiagnostics();
report("worker-module-evaluated", {
  location: globalThis.location?.href,
  capabilities: getWorkerCapabilities(),
});

const processor = new SQLocalProcessor(new DiagnosticSQLiteOpfsDriver());

self.addEventListener("error", event => {
  report("worker-runtime-error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: serializeError(event.error),
  });
});

self.addEventListener("unhandledrejection", event => {
  report("worker-unhandled-rejection", {
    reason: serializeError(event.reason),
  });
});

self.onmessage = message => {
  const data = message.data;
  if (data && typeof data === "object" && "type" in data) {
    if (data.type === "config") {
      report("worker-config-received", {
        databasePath:
          "config" in data &&
          data.config &&
          typeof data.config === "object" &&
          "databasePath" in data.config
            ? data.config.databasePath
            : undefined,
      });
    }
  }

  void processor.postMessage(data);
};

processor.onmessage = (message, transfer) => {
  if (message.type === "error") {
    report("processor-error", {
      queryKey: message.queryKey,
      error: serializeError(message.error),
    });
  }
  if (message.type === "event" && message.event === "connect") {
    report("worker-connected", { reason: message.reason });
  }
  workerScope.postMessage(message, transfer);
};
