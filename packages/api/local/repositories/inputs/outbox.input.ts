export const OutboxStatus = {
  pending: "pending",
  accepted: "accepted",
  rejected: "rejected",
  unplaced: "unplaced",
} as const;

export type OutboxStatus = (typeof OutboxStatus)[keyof typeof OutboxStatus];

export type SettleOutboxInput = {
  sequence: number;
  status: Exclude<OutboxStatus, "pending">;
  dependsOnSequence?: number;
  lastError?: string;
};
