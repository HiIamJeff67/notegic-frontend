import type { Client } from "@shared/api/local/client";
import { Transaction } from "@shared/api/local/schemas";
import { eq } from "drizzle-orm";
import type { SettleOutboxInput } from "./inputs/outbox.input";
import type { SettleOutboxOutput } from "./outputs/outbox.output";

export class OutboxRepository {
  static async Settle(
    client: Client,
    input: SettleOutboxInput
  ): Promise<SettleOutboxOutput> {
    await client
      .update(Transaction)
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
