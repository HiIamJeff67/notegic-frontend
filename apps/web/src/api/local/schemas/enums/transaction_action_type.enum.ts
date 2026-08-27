export enum TransactionActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  MOVE = "MOVE",
  RESTORE = "RESTORE",
  DELETE = "DELETE",
  HARD_DELETE = "HARD_DELETE",
}

export const AllTransactionActionTypes = Object.values(TransactionActionType);
