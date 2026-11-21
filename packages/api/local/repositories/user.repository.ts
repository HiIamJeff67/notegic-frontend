import type { Client } from "@shared/api/local/client";
import { User } from "@shared/api/local/schemas";
import { eq } from "drizzle-orm";
import type { UpsertLoggedInUserInput } from "./inputs/user.input";
import type { UpsertLoggedInUserOutput } from "./outputs/user.output";

export class UserRepository {
  static async UpsertLoggedIn(
    client: Client,
    input: UpsertLoggedInUserInput
  ): Promise<UpsertLoggedInUserOutput> {
    await client.transaction(async tx => {
      await tx
        .update(User)
        .set({ isLoggedIn: false })
        .where(eq(User.isLoggedIn, true))
        .run();
      await tx
        .insert(User)
        .values({ ...input, isLoggedIn: true })
        .onConflictDoUpdate({
          target: User.publicId,
          set: {
            name: input.name,
            displayName: input.displayName,
            email: input.email,
            isLoggedIn: true,
          },
        })
        .run();
    });
    return { publicId: input.publicId };
  }
}
