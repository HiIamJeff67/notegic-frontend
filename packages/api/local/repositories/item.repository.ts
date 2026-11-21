import { LocalDatabaseClientExceptions } from "@shared/api/exceptions/client/localDatabase.exception";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import type { Client } from "@shared/api/local/client";
import { Item, Transaction, UsersToShelves } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { and, eq, inArray, isNull } from "drizzle-orm";
import type {
  CreateItemInput,
  DeleteItemInput,
  GetManyItemsInput,
  UpdateItemInput,
} from "./inputs/item.input";
import { OutboxStatus } from "./inputs/outbox.input";
import type {
  CreateItemOutput,
  DeleteItemOutput,
  GetManyItemsOutput,
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
}
