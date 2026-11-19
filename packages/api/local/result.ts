export const AllResults = [
  "success",
  "retryable",
  "needs-action",
  "safe-to-rebuild",
  "manual-recovery",
] as const;

export type Result = (typeof AllResults)[number];

export const isResult = (value: unknown): value is Result =>
  typeof value === "string" &&
  (AllResults as readonly string[]).includes(value);
