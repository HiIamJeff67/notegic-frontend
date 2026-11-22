import { LocalDatabaseClientExceptions } from "@shared/api/exceptions/client/localDatabase.exception";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import type { Client } from "@shared/api/local/client";
import {
  SubShelf,
  Transaction,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import type { UUID } from "crypto";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { OutboxStatus } from "./inputs/outbox.input";
import type {
  CreateSubShelfInput,
  DeleteSubShelfInput,
  GetManySubShelvesInput,
  GetObservedManySubShelvesInput,
  GetObservedSubShelfInput,
  UpdateSubShelfInput,
  UpsertObservedManySubShelvesInput,
  UpsertObservedSubShelfInput,
} from "./inputs/subShelf.input";
import type {
  CreateSubShelfOutput,
  DeleteSubShelfOutput,
  GetManySubShelvesOutput,
  SubShelfRecord,
  UpdateSubShelfOutput,
} from "./outputs/subShelf.output";

const requireShelfWriter = async (
  client: Client,
  rootShelfId: string,
  ownerPublicId: string
) => {
  const allowedPermissions = new Set<string>([
    AccessControlPermission.Owner,
    AccessControlPermission.Admin,
    AccessControlPermission.Write,
  ]);
  const membership = await client
    .select({ permission: UsersToShelves.permission })
    .from(UsersToShelves)
    .where(
      and(
        eq(UsersToShelves.rootShelfId, rootShelfId),
        eq(UsersToShelves.userPublicId, ownerPublicId)
      )
    )
    .get();
  if (
    membership === undefined ||
    !allowedPermissions.has(membership.permission)
  ) {
    throw new NotegicLocalDatabaseError(
      LocalDatabaseClientExceptions.NotPermitted()
    );
  }
};

export class SubShelfRepository {
  static async CreateOne(
    client: Client,
    input: CreateSubShelfInput
  ): Promise<CreateSubShelfOutput> {
    const at = input.at ?? new Date();
    return await client.transaction(async tx => {
      await requireShelfWriter(tx, input.rootShelfId, input.ownerPublicId);
      await tx
        .insert(SubShelf)
        .values({
          id: input.id,
          name: input.name,
          rootShelfId: input.rootShelfId,
          prevSubShelfId: input.prevSubShelfId ?? null,
          path: [],
          updatedAt: at,
          createdAt: at,
        })
        .run();
      const outbox = await tx
        .insert(Transaction)
        .values({
          ownerPublicId: input.ownerPublicId,
          entityType: TransactionEntityType.SubShelf,
          actionType: TransactionActionType.CREATE,
          body: {
            id: input.id,
            name: input.name,
            rootShelfId: input.rootShelfId,
            prevSubShelfId: input.prevSubShelfId ?? null,
          },
          status: OutboxStatus.pending,
        })
        .returning({ sequence: Transaction.sequence })
        .get();
      return { id: input.id, sequence: outbox.sequence };
    });
  }

  static async UpdateOne(
    client: Client,
    input: UpdateSubShelfInput
  ): Promise<UpdateSubShelfOutput> {
    const at = input.at ?? new Date();
    return await client.transaction(async tx => {
      await requireShelfWriter(tx, input.rootShelfId, input.ownerPublicId);
      await tx
        .update(SubShelf)
        .set({ name: input.name, updatedAt: at })
        .where(eq(SubShelf.id, input.id))
        .run();
      const outbox = await tx
        .insert(Transaction)
        .values({
          ownerPublicId: input.ownerPublicId,
          entityType: TransactionEntityType.SubShelf,
          actionType: TransactionActionType.UPDATE,
          body: { subShelfId: input.id, values: { name: input.name } },
          status: OutboxStatus.pending,
        })
        .returning({ sequence: Transaction.sequence })
        .get();
      return { id: input.id, sequence: outbox.sequence };
    });
  }

  static async DeleteOne(
    client: Client,
    input: DeleteSubShelfInput
  ): Promise<DeleteSubShelfOutput> {
    const at = input.at ?? new Date();
    return await client.transaction(async tx => {
      await requireShelfWriter(tx, input.rootShelfId, input.ownerPublicId);
      await tx
        .update(SubShelf)
        .set({ deletedAt: at, updatedAt: at })
        .where(eq(SubShelf.id, input.id))
        .run();
      const outbox = await tx
        .insert(Transaction)
        .values({
          ownerPublicId: input.ownerPublicId,
          entityType: TransactionEntityType.SubShelf,
          actionType: TransactionActionType.DELETE,
          body: { subShelfId: input.id },
          status: OutboxStatus.pending,
        })
        .returning({ sequence: Transaction.sequence })
        .get();
      return { id: input.id, sequence: outbox.sequence };
    });
  }

  static async GetMany(
    client: Client,
    input: GetManySubShelvesInput
  ): Promise<GetManySubShelvesOutput> {
    if (input.rootShelfIds.length === 0) return { shelves: [] };
    const rows = await client
      .select({
        id: SubShelf.id,
        name: SubShelf.name,
        rootShelfId: SubShelf.rootShelfId,
        prevSubShelfId: SubShelf.prevSubShelfId,
        path: SubShelf.path,
        updatedAt: SubShelf.updatedAt,
        createdAt: SubShelf.createdAt,
      })
      .from(SubShelf)
      .where(
        and(
          inArray(SubShelf.rootShelfId, input.rootShelfIds),
          isNull(SubShelf.deletedAt)
        )
      )
      .all();
    return {
      shelves: rows.map(row => ({
        ...row,
        prevSubShelfId: row.prevSubShelfId ?? null,
        path: row.path ?? [],
      })),
    };
  }

  static async GetObserved(
    client: Client,
    input: GetObservedSubShelfInput
  ): Promise<SubShelfRecord | undefined> {
    const row = await client
      .select({
        id: SubShelf.id,
        name: SubShelf.name,
        rootShelfId: SubShelf.rootShelfId,
        prevSubShelfId: SubShelf.prevSubShelfId,
        path: SubShelf.path,
        updatedAt: SubShelf.updatedAt,
        createdAt: SubShelf.createdAt,
      })
      .from(SubShelf)
      .where(and(eq(SubShelf.id, input.id), isNull(SubShelf.deletedAt)))
      .get();
    if (!row) return undefined;
    return {
      ...row,
      prevSubShelfId: row.prevSubShelfId ?? null,
      path: row.path ?? [],
    };
  }

  static async GetObservedMany(
    client: Client,
    input: GetObservedManySubShelvesInput
  ): Promise<SubShelfRecord[]> {
    if (input.rootShelfId === undefined && input.prevSubShelfId === undefined) {
      return [];
    }
    const rows = await client
      .select({
        id: SubShelf.id,
        name: SubShelf.name,
        rootShelfId: SubShelf.rootShelfId,
        prevSubShelfId: SubShelf.prevSubShelfId,
        path: SubShelf.path,
        updatedAt: SubShelf.updatedAt,
        createdAt: SubShelf.createdAt,
      })
      .from(SubShelf)
      .where(
        and(
          isNull(SubShelf.deletedAt),
          ...(input.rootShelfId === undefined
            ? []
            : [eq(SubShelf.rootShelfId, input.rootShelfId)]),
          ...(input.prevSubShelfId === undefined
            ? []
            : [eq(SubShelf.prevSubShelfId, input.prevSubShelfId)])
        )
      )
      .all();
    return rows.map(row => ({
      ...row,
      prevSubShelfId: row.prevSubShelfId ?? null,
      path: row.path ?? [],
    }));
  }

  static async UpsertObserved(
    client: Client,
    input: UpsertObservedSubShelfInput
  ): Promise<boolean> {
    return await SubShelfRepository.UpsertObservedMany(client, {
      shelves: [input],
    });
  }

  static async UpsertObservedMany(
    client: Client,
    input: UpsertObservedManySubShelvesInput
  ): Promise<boolean> {
    if (input.shelves.length === 0) return false;
    return await client.transaction(async tx => {
      let changed = false;
      for (const shelf of input.shelves) {
        const rows = await tx
          .insert(SubShelf)
          .values({
            id: shelf.id,
            name: shelf.name,
            rootShelfId: shelf.rootShelfId,
            prevSubShelfId: shelf.prevSubShelfId,
            path: shelf.path as UUID[],
            deletedAt: null,
            updatedAt: shelf.at,
            createdAt: shelf.at,
          })
          .onConflictDoUpdate({
            target: SubShelf.id,
            set: {
              name: shelf.name,
              rootShelfId: shelf.rootShelfId,
              prevSubShelfId: shelf.prevSubShelfId,
              path: shelf.path as UUID[],
              updatedAt: shelf.at,
            },
            setWhere: sql`name is not excluded.name or root_shelf_id is not excluded.root_shelf_id or prev_sub_shelf_id is not excluded.prev_sub_shelf_id or path is not excluded.path or updated_at is not excluded.updated_at`,
          })
          .returning({ id: SubShelf.id })
          .all();
        if (rows.length > 0) changed = true;
      }
      return changed;
    });
  }
}
