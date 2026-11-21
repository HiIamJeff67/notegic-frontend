import { ShelfItemProvider as SharedShelfItemProvider } from "@shared/api/hooks/react/ShelfItemProvider";
import { useUpsertLoggedInUser } from "@shared/api/hooks/user.hook";
import type { Client } from "@shared/api/local/client";
import type { ReactNode } from "react";
import { CreateBlockPack } from "../api/functions/blockPack.function";
import {
  CreateMyMaterial,
  DeleteMyMaterialById,
  UpdateMyMaterialById,
} from "../api/functions/material.function";
import {
  CreateRootShelf,
  DeleteMyRootShelfById,
  UpdateMyRootShelfById,
} from "../api/functions/rootShelf.function";
import {
  CreateSubShelfByRootShelfId,
  DeleteMySubShelfById,
  UpdateMySubShelfById,
} from "../api/functions/subShelf.function";

export const ShelfItemProvider = ({
  client,
  owner,
  children,
}: {
  client: Client;
  owner: {
    publicId: string;
    name: string;
    displayName: string;
    email: string;
  };
  children: ReactNode;
}) => {
  const ready = useUpsertLoggedInUser(client, owner);
  if (!ready) return null;
  return (
    <SharedShelfItemProvider
      ownerPublicId={owner.publicId}
      client={client}
      createRootShelf={CreateRootShelf}
      updateRootShelf={UpdateMyRootShelfById}
      deleteRootShelf={DeleteMyRootShelfById}
      createSubShelf={CreateSubShelfByRootShelfId}
      updateSubShelf={UpdateMySubShelfById}
      deleteSubShelf={DeleteMySubShelfById}
      createMaterial={CreateMyMaterial}
      updateMaterial={UpdateMyMaterialById}
      deleteMaterial={DeleteMyMaterialById}
      createBlockPack={CreateBlockPack}
    >
      {children}
    </SharedShelfItemProvider>
  );
};
