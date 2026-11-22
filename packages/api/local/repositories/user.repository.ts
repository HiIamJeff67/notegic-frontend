import type { Client } from "@shared/api/local/client";
import { User } from "@shared/api/local/schemas";
import { and, eq, ne, sql } from "drizzle-orm";
import type { UpsertLoggedInUserInput } from "./inputs/user.input";
import type {
  GetLoggedInUserOutput,
  UpsertLoggedInUserOutput,
} from "./outputs/user.output";

export class UserRepository {
  static async UpsertLoggedIn(
    client: Client,
    input: UpsertLoggedInUserInput
  ): Promise<UpsertLoggedInUserOutput> {
    const changed = await client.transaction(async tx => {
      await tx
        .update(User)
        .set({ isLoggedIn: false })
        .where(
          and(eq(User.isLoggedIn, true), ne(User.publicId, input.publicId))
        )
        .run();
      const rows = await tx
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
          setWhere: sql`name is not excluded.name or display_name is not excluded.display_name or email is not excluded.email or is_logged_in is not excluded.is_logged_in`,
        })
        .returning({ publicId: User.publicId })
        .all();
      return rows.length > 0;
    });
    return { publicId: input.publicId, changed };
  }

  static async GetLoggedIn(client: Client): Promise<GetLoggedInUserOutput> {
    const [row] = await client
      .select({
        publicId: User.publicId,
        name: User.name,
        displayName: User.displayName,
        email: User.email,
      })
      .from(User)
      .where(eq(User.isLoggedIn, true))
      .limit(1)
      .all();
    return row ?? null;
  }
}
