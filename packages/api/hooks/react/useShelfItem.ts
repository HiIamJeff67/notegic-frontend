import { LocalDatabaseClientExceptions } from "@shared/api/exceptions/client/localDatabase.exception";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { useContext } from "react";
import { ShelfItemContext } from "./ShelfItemProvider";

export const useShelfItem = () => {
  const shelfItem = useContext(ShelfItemContext);
  if (shelfItem === undefined) {
    throw new NotegicLocalDatabaseError(
      LocalDatabaseClientExceptions.LocalDatabaseUnavailable()
    );
  }
  return shelfItem;
};
