import { Transaction } from "@shared/api/local/schemas";
import { eq } from "drizzle-orm";
import type { SettleOutboxInput } from "./inputs/outbox.input";
import type { LocalDB } from "./localDB";
import type { SettleOutboxOutput } from "./outputs/outbox.output";

export class OutboxRepository {
  static Settle(db: LocalDB, input: SettleOutboxInput): SettleOutboxOutput {
    db.update(Transaction)
      .set({
        status: input.status,
        dependsOnSequence: input.dependsOnSequence ?? null,
        lastError: input.lastError ?? null,
      })
      .where(eq(Transaction.sequence, input.sequence))
      .run();
    return { sequence: input.sequence, status: input.status };
  }
}
