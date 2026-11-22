import { LocalDatabaseClientExceptions } from "@shared/api/exceptions/client/localDatabase.exception";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import type { Client } from "@shared/api/local/client";
import { Item, Transaction, UsersToShelves } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import type {
  CreateItemInput,
  DeleteItemInput,
  GetManyItemsInput,
  GetObservedItemInput,
  GetObservedManyItemsInput,
  UpdateItemInput,
  UpsertObservedItemInput,
  UpsertObservedManyItemsInput,
} from "./inputs/item.input";
import { OutboxStatus } from "./inputs/outbox.input";
import type {
  CreateItemOutput,
  DeleteItemOutput,
  GetManyItemsOutput,
  ItemRecord,
  UpdateItemOutput,
} from "./outputs/item.output";

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

const entityType = (type: ItemType) =>
  type === ItemType.BlockPack
    ? TransactionEntityType.BlockPack
    : TransactionEntityType.Material;

export class ItemRepository {
  static async CreateOne(
    client: Client,
    input: CreateItemInput
  ): Promise<CreateItemOutput> {
    const at = input.at ?? new Date();
    return await client.transaction(async tx => {
      await requireShelfWriter(tx, input.rootShelfId, input.ownerPublicId);
      await tx
        .insert(Item)
        .values({
          id: input.id,
          name: input.name,
          rootShelfId: input.rootShelfId,
          parentSubShelfId: input.parentSubShelfId,
          type: input.type,
          updatedAt: at,
          createdAt: at,
        })
        .run();
      const outbox = await tx
        .insert(Transaction)
        .values({
          ownerPublicId: input.ownerPublicId,
          entityType: entityType(input.type),
          actionType: TransactionActionType.CREATE,
          body: {
            id: input.id,
            name: input.name,
            rootShelfId: input.rootShelfId,
            parentSubShelfId: input.parentSubShelfId,
            type: input.type,
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
    input: UpdateItemInput
  ): Promise<UpdateItemOutput> {
    const at = input.at ?? new Date();
    return await client.transaction(async tx => {
      await requireShelfWriter(tx, input.rootShelfId, input.ownerPublicId);
      const current = await tx
        .select({ type: Item.type })
        .from(Item)
        .where(eq(Item.id, input.id))
        .get();
      await tx
        .update(Item)
        .set({ name: input.name, updatedAt: at })
        .where(eq(Item.id, input.id))
        .run();
      const outbox = await tx
        .insert(Transaction)
        .values({
          ownerPublicId: input.ownerPublicId,
          entityType: entityType(current?.type ?? ItemType.Material),
          actionType: TransactionActionType.UPDATE,
          body: { id: input.id, values: { name: input.name } },
          status: OutboxStatus.pending,
        })
        .returning({ sequence: Transaction.sequence })
        .get();
      return { id: input.id, sequence: outbox.sequence };
    });
  }

  static async DeleteOne(
    client: Client,
    input: DeleteItemInput
  ): Promise<DeleteItemOutput> {
    const at = input.at ?? new Date();
    return await client.transaction(async tx => {
      await requireShelfWriter(tx, input.rootShelfId, input.ownerPublicId);
      const current = await tx
        .select({ type: Item.type })
        .from(Item)
        .where(eq(Item.id, input.id))
        .get();
      await tx
        .update(Item)
        .set({ deletedAt: at, updatedAt: at })
        .where(eq(Item.id, input.id))
        .run();
      const outbox = await tx
        .insert(Transaction)
        .values({
          ownerPublicId: input.ownerPublicId,
          entityType: entityType(current?.type ?? ItemType.Material),
          actionType: TransactionActionType.DELETE,
          body: { id: input.id },
          status: OutboxStatus.pending,
        })
        .returning({ sequence: Transaction.sequence })
        .get();
      return { id: input.id, sequence: outbox.sequence };
    });
  }

  static async GetMany(
    client: Client,
    input: GetManyItemsInput
  ): Promise<GetManyItemsOutput> {
    if (input.parentSubShelfIds.length === 0) return { items: [] };
    const rows = await client
      .select({
        id: Item.id,
        name: Item.name,
        rootShelfId: Item.rootShelfId,
        parentSubShelfId: Item.parentSubShelfId,
        type: Item.type,
        updatedAt: Item.updatedAt,
        createdAt: Item.createdAt,
      })
      .from(Item)
      .where(
        and(
          inArray(Item.parentSubShelfId, input.parentSubShelfIds),
          isNull(Item.deletedAt)
        )
      )
      .all();
    return { items: rows };
  }

  static async GetObserved(
    client: Client,
    input: GetObservedItemInput
  ): Promise<ItemRecord | undefined> {
    const row = await client
      .select({
        id: Item.id,
        name: Item.name,
        rootShelfId: Item.rootShelfId,
        parentSubShelfId: Item.parentSubShelfId,
        type: Item.type,
        updatedAt: Item.updatedAt,
        createdAt: Item.createdAt,
      })
      .from(Item)
      .where(and(eq(Item.id, input.id), isNull(Item.deletedAt)))
      .get();
    return row;
  }

  static async GetObservedMany(
    client: Client,
    input: GetObservedManyItemsInput
  ): Promise<ItemRecord[]> {
    if (
      input.parentSubShelfId === undefined &&
      input.rootShelfId === undefined &&
      input.type === undefined
    ) {
      return [];
    }
    return await client
      .select({
        id: Item.id,
        name: Item.name,
        rootShelfId: Item.rootShelfId,
        parentSubShelfId: Item.parentSubShelfId,
        type: Item.type,
        updatedAt: Item.updatedAt,
        createdAt: Item.createdAt,
      })
      .from(Item)
      .where(
        and(
          isNull(Item.deletedAt),
          ...(input.parentSubShelfId === undefined
            ? []
            : [eq(Item.parentSubShelfId, input.parentSubShelfId)]),
          ...(input.rootShelfId === undefined
            ? []
            : [eq(Item.rootShelfId, input.rootShelfId)]),
          ...(input.type === undefined ? [] : [eq(Item.type, input.type)])
        )
      )
      .all();
  }

  static async UpsertObserved(
    client: Client,
    input: UpsertObservedItemInput
  ): Promise<boolean> {
    return await ItemRepository.UpsertObservedMany(client, { items: [input] });
  }

  static async UpsertObservedMany(
    client: Client,
    input: UpsertObservedManyItemsInput
  ): Promise<boolean> {
    if (input.items.length === 0) return false;
    return await client.transaction(async tx => {
      let changed = false;
      for (const item of input.items) {
        const rows = await tx
          .insert(Item)
          .values({
            id: item.id,
            name: item.name,
            rootShelfId: item.rootShelfId,
            parentSubShelfId: item.parentSubShelfId,
            type: item.type,
            deletedAt: null,
            updatedAt: item.at,
            createdAt: item.at,
          })
          .onConflictDoUpdate({
            target: Item.id,
            set: {
              name: item.name,
              rootShelfId: item.rootShelfId,
              parentSubShelfId: item.parentSubShelfId,
              type: item.type,
              updatedAt: item.at,
            },
            setWhere: sql`name is not excluded.name or root_shelf_id is not excluded.root_shelf_id or parent_sub_shelf_id is not excluded.parent_sub_shelf_id or type is not excluded.type or updated_at is not excluded.updated_at`,
          })
          .returning({ id: Item.id })
          .all();
        if (rows.length > 0) changed = true;
      }
      return changed;
    });
  }
}
