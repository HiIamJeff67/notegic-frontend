export const AllPhases = [
  "disabled",
  "worker-starting",
  "worker-connection-pending",
  "worker-connected",
  "migration-lock-pending",
  "migration-lock-acquired",
  "reading-version",
  "freezing-local-writes",
  "waiting-for-local-operations",
  "checking-transaction-queue",
  "flushing-yjs",
  "checking-rebuildability",
  "exporting-local-data",
  "clearing-local-storage",
  "rebuild-in-progress",
  "bootstrapping",
  "migrating",
  "verifying",
  "verifying-schema",
  "resynchronizing",
  "ready",
  "failed",
  "needs-action",
  "manual-recovery",
] as const;

export type Phase = (typeof AllPhases)[number];

export const isPhase = (value: unknown): value is Phase =>
  typeof value === "string" && (AllPhases as readonly string[]).includes(value);
