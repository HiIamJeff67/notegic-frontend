import { LocalDatabaseClientExceptions } from "@shared/api/exceptions/client/localDatabase.exception";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import {
  RootShelf,
  Transaction,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { inArray, sql } from "drizzle-orm";
import { OutboxStatus } from "./inputs/outbox.input";
import type {
  CreateManyRootShelvesInput,
  CreateRootShelfInput,
  DeleteManyRootShelvesInput,
  DeleteRootShelfInput,
  GetManyRootShelvesInput,
  GetRootShelfInput,
  RestoreManyRootShelvesInput,
  RestoreRootShelfInput,
  UpdateManyRootShelvesInput,
  UpdateRootShelfInput,
} from "./inputs/rootShelf.input";
import type { LocalDB } from "./localDB";
import type {
  CreateManyRootShelvesOutput,
  CreateRootShelfOutput,
  DeleteManyRootShelvesOutput,
  DeleteRootShelfOutput,
  GetManyRootShelvesOutput,
  GetRootShelfOutput,
  RestoreManyRootShelvesOutput,
  RestoreRootShelfOutput,
  UpdateManyRootShelvesOutput,
  UpdateRootShelfOutput,
} from "./outputs/rootShelf.output";

export class RootShelfRepository {
  static CreateOne(
    db: LocalDB,
    input: CreateRootShelfInput
  ): CreateRootShelfOutput {
    return RootShelfRepository.CreateMany(db, { shelves: [input] }).shelves[0];
  }

  static CreateMany(
    db: LocalDB,
    input: CreateManyRootShelvesInput
  ): CreateManyRootShelvesOutput {
    if (input.shelves.length === 0) return { shelves: [] };
    const at = new Date();
    const shelves = input.shelves.map(shelf => ({
      id: shelf.id,
      name: shelf.name,
      ownerPublicId: shelf.ownerPublicId,
      at: shelf.at ?? at,
    }));
    return db.transaction(tx => {
      tx.insert(RootShelf)
        .values(
          shelves.map(shelf => ({
            id: shelf.id,
            name: shelf.name,
            lastAnalyzedAt: shelf.at,
            updatedAt: shelf.at,
            createdAt: shelf.at,
          }))
        )
        .run();
      tx.insert(UsersToShelves)
        .values(
          shelves.map(shelf => ({
            userPublicId: shelf.ownerPublicId,
            rootShelfId: shelf.id,
            permission: AccessControlPermission.Owner,
          }))
        )
        .run();
      const outbox = tx
        .insert(Transaction)
        .values(
          shelves.map(shelf => ({
            ownerPublicId: shelf.ownerPublicId,
            entityType: TransactionEntityType.RootShelf,
            actionType: TransactionActionType.CREATE,
            body: { id: shelf.id, name: shelf.name },
            status: OutboxStatus.pending,
          }))
        )
        .returning({ sequence: Transaction.sequence })
        .all();
      return {
        shelves: shelves.map((shelf, index) => ({
          id: shelf.id,
          sequence: outbox[index].sequence,
        })),
      };
    });
  }

  static GetOne(db: LocalDB, input: GetRootShelfInput): GetRootShelfOutput {
    return RootShelfRepository.GetMany(db, { ids: [input.id] }).shelves[0];
  }

  static GetMany(
    db: LocalDB,
    input: GetManyRootShelvesInput
  ): GetManyRootShelvesOutput {
    if (input.ids.length === 0) return { shelves: [] };
    const rows = db
      .select({
        id: RootShelf.id,
        name: RootShelf.name,
        subShelfCount: RootShelf.subShelfCount,
        itemCount: RootShelf.itemCount,
        lastAnalyzedAt: RootShelf.lastAnalyzedAt,
        deletedAt: RootShelf.deletedAt,
        updatedAt: RootShelf.updatedAt,
        createdAt: RootShelf.createdAt,
      })
      .from(RootShelf)
      .where(inArray(RootShelf.id, input.ids))
      .all();
    const shelvesById = new Map(rows.map(row => [row.id, row]));
    return {
      shelves: input.ids.flatMap(id => {
        const row = shelvesById.get(id);
        if (row === undefined) return [];
        return [{ ...row, deletedAt: row.deletedAt ?? null }];
      }),
    };
  }

  static UpdateOne(
    db: LocalDB,
    input: UpdateRootShelfInput
  ): UpdateRootShelfOutput {
    return RootShelfRepository.UpdateMany(db, { shelves: [input] }).shelves[0];
  }

  static UpdateMany(
    db: LocalDB,
    input: UpdateManyRootShelvesInput
  ): UpdateManyRootShelvesOutput {
    const allowedPermissions = new Set<string>([
      AccessControlPermission.Owner,
      AccessControlPermission.Admin,
      AccessControlPermission.Write,
    ]);
    if (input.shelves.length === 0) return { shelves: [] };
    const at = new Date();
    const shelves = input.shelves.map(shelf => ({
      id: shelf.id,
      name: shelf.name,
      ownerPublicId: shelf.ownerPublicId,
      at: shelf.at ?? at,
    }));
    return db.transaction(tx => {
      RootShelfRepository.requirePermissions(tx, shelves, allowedPermissions);
      const nameCase = sql.join(
        shelves.map(shelf => sql`when ${shelf.id} then ${shelf.name}`),
        sql` `
      );
      const updatedAtCase = sql.join(
        shelves.map(
          shelf =>
            sql`when ${shelf.id} then ${Math.floor(shelf.at.getTime() / 1000)}`
        ),
        sql` `
      );
      const updated = tx
        .update(RootShelf)
        .set({
          name: sql`case ${RootShelf.id} ${nameCase} else ${RootShelf.name} end`,
          updatedAt: sql`case ${RootShelf.id} ${updatedAtCase} else ${RootShelf.updatedAt} end`,
        })
        .where(
          inArray(
            RootShelf.id,
            shelves.map(shelf => shelf.id)
          )
        )
        .returning({ id: RootShelf.id })
        .all();
      if (updated.length !== shelves.length) {
        throw new NotegicLocalDatabaseError(
          LocalDatabaseClientExceptions.NotPermitted()
        );
      }
      const outbox = tx
        .insert(Transaction)
        .values(
          shelves.map(shelf => ({
            ownerPublicId: shelf.ownerPublicId,
            entityType: TransactionEntityType.RootShelf,
            actionType: TransactionActionType.UPDATE,
            body: {
              rootShelfId: shelf.id,
              values: { name: shelf.name },
            },
            status: OutboxStatus.pending,
          }))
        )
        .returning({ sequence: Transaction.sequence })
        .all();
      return {
        shelves: shelves.map((shelf, index) => ({
          id: shelf.id,
          sequence: outbox[index].sequence,
        })),
      };
    });
  }

  static DeleteOne(
    db: LocalDB,
    input: DeleteRootShelfInput
  ): DeleteRootShelfOutput {
    return RootShelfRepository.DeleteMany(db, { shelves: [input] }).shelves[0];
  }

  static DeleteMany(
    db: LocalDB,
    input: DeleteManyRootShelvesInput
  ): DeleteManyRootShelvesOutput {
    const allowedPermissions = new Set<string>([
      AccessControlPermission.Owner,
      AccessControlPermission.Admin,
    ]);
    if (input.shelves.length === 0) return { shelves: [] };
    const at = new Date();
    const shelves = input.shelves.map(shelf => ({
      id: shelf.id,
      ownerPublicId: shelf.ownerPublicId,
      at: shelf.at ?? at,
    }));
    return db.transaction(tx => {
      RootShelfRepository.requirePermissions(tx, shelves, allowedPermissions);
      const deletedAtCase = sql.join(
        shelves.map(
          shelf =>
            sql`when ${shelf.id} then ${Math.floor(shelf.at.getTime() / 1000)}`
        ),
        sql` `
      );
      const deleted = tx
        .update(RootShelf)
        .set({
          deletedAt: sql`case ${RootShelf.id} ${deletedAtCase} else ${RootShelf.deletedAt} end`,
          updatedAt: sql`case ${RootShelf.id} ${deletedAtCase} else ${RootShelf.updatedAt} end`,
        })
        .where(
          inArray(
            RootShelf.id,
            shelves.map(shelf => shelf.id)
          )
        )
        .returning({ id: RootShelf.id })
        .all();
      if (deleted.length !== shelves.length) {
        throw new NotegicLocalDatabaseError(
          LocalDatabaseClientExceptions.NotPermitted()
        );
      }
      const outbox = tx
        .insert(Transaction)
        .values(
          shelves.map(shelf => ({
            ownerPublicId: shelf.ownerPublicId,
            entityType: TransactionEntityType.RootShelf,
            actionType: TransactionActionType.DELETE,
            body: { rootShelfId: shelf.id },
            status: OutboxStatus.pending,
          }))
        )
        .returning({ sequence: Transaction.sequence })
        .all();
      return {
        shelves: shelves.map((shelf, index) => ({
          id: shelf.id,
          sequence: outbox[index].sequence,
        })),
      };
    });
  }

  static RestoreOne(
    db: LocalDB,
    input: RestoreRootShelfInput
  ): RestoreRootShelfOutput {
    return RootShelfRepository.RestoreMany(db, { shelves: [input] }).shelves[0];
  }

  static RestoreMany(
    db: LocalDB,
    input: RestoreManyRootShelvesInput
  ): RestoreManyRootShelvesOutput {
    const allowedPermissions = new Set<string>([
      AccessControlPermission.Owner,
      AccessControlPermission.Admin,
      AccessControlPermission.Write,
    ]);
    if (input.shelves.length === 0) return { shelves: [] };
    const at = new Date();
    const shelves = input.shelves.map(shelf => ({
      id: shelf.id,
      ownerPublicId: shelf.ownerPublicId,
      at: shelf.at ?? at,
    }));
    return db.transaction(tx => {
      RootShelfRepository.requirePermissions(tx, shelves, allowedPermissions);
      const updatedAtCase = sql.join(
        shelves.map(
          shelf =>
            sql`when ${shelf.id} then ${Math.floor(shelf.at.getTime() / 1000)}`
        ),
        sql` `
      );
      const restored = tx
        .update(RootShelf)
        .set({
          deletedAt: null,
          updatedAt: sql`case ${RootShelf.id} ${updatedAtCase} else ${RootShelf.updatedAt} end`,
        })
        .where(
          inArray(
            RootShelf.id,
            shelves.map(shelf => shelf.id)
          )
        )
        .returning({ id: RootShelf.id })
        .all();
      if (restored.length !== shelves.length) {
        throw new NotegicLocalDatabaseError(
          LocalDatabaseClientExceptions.NotPermitted()
        );
      }
      const outbox = tx
        .insert(Transaction)
        .values(
          shelves.map(shelf => ({
            ownerPublicId: shelf.ownerPublicId,
            entityType: TransactionEntityType.RootShelf,
            actionType: TransactionActionType.RESTORE,
            body: { rootShelfId: shelf.id },
            status: OutboxStatus.pending,
          }))
        )
        .returning({ sequence: Transaction.sequence })
        .all();
      return {
        shelves: shelves.map((shelf, index) => ({
          id: shelf.id,
          sequence: outbox[index].sequence,
        })),
      };
    });
  }

  private static requirePermissions(
    db: LocalDB,
    shelves: { id: string; ownerPublicId: string }[],
    allowedPermissions: ReadonlySet<string>
  ) {
    const memberships = db
      .select({
        rootShelfId: UsersToShelves.rootShelfId,
        userPublicId: UsersToShelves.userPublicId,
        permission: UsersToShelves.permission,
      })
      .from(UsersToShelves)
      .where(
        inArray(
          UsersToShelves.rootShelfId,
          shelves.map(shelf => shelf.id)
        )
      )
      .all();
    const permissionByMembership = new Map(
      memberships.map(membership => [
        `${membership.userPublicId}:${membership.rootShelfId}`,
        membership.permission,
      ])
    );
    const permitted = shelves.every(shelf =>
      allowedPermissions.has(
        permissionByMembership.get(`${shelf.ownerPublicId}:${shelf.id}`) ?? ""
      )
    );
    if (!permitted) {
      throw new NotegicLocalDatabaseError(
        LocalDatabaseClientExceptions.NotPermitted()
      );
    }
  }
}
