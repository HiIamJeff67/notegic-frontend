import type { OutboxStatus } from "../inputs/outbox.input";

export type SettleOutboxOutput = {
  sequence: number;
  status: OutboxStatus;
};
