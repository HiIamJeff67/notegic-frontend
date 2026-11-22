import { ShelfItemProvider as SharedShelfItemProvider } from "@shared/api/hooks/react/ShelfItemProvider";
import { useGetMe, useUpsertLoggedInUser } from "@shared/api/hooks/user.hook";
import type { Client } from "@shared/api/local/client";
import { type ReactNode, useEffect } from "react";

const meRequest = {};
import {
  CreateBlockPack,
  GetMyBlockPacksByRootShelfId,
} from "../api/functions/blockPack.function";
import {
  CreateMyMaterial,
  DeleteMyMaterialById,
  GetMyMaterialsByRootShelfId,
  UpdateMyMaterialById,
} from "../api/functions/material.function";
import {
  CreateRootShelf,
  DeleteMyRootShelfById,
  UpdateMyRootShelfById,
} from "../api/functions/rootShelf.function";
import { SearchRootShelves } from "../api/functions/search.function";
import {
  CreateSubShelfByRootShelfId,
  DeleteMySubShelfById,
  GetMySubShelvesByRootShelfId,
  UpdateMySubShelfById,
} from "../api/functions/subShelf.function";
import { GetMe } from "../api/functions/user.function";
import { readNetworkOnline } from "../invocations/network.invocation";

export const ShelfItemProvider = ({
  client,
  owner,
  children,
  onObservedUser,
}: {
  client: Client;
  owner: {
    publicId: string;
    name: string;
    displayName: string;
    email: string;
  };
  onObservedUser?: (owner: {
    publicId: string;
    name: string;
    displayName: string;
    email: string;
  }) => void;
  children: ReactNode;
}) => {
  useUpsertLoggedInUser(client, owner);
  const account = useGetMe(client, readNetworkOnline, GetMe, meRequest);
  useEffect(() => {
    const next = account.data;
    if (!next) return;
    if (
      next.publicId === owner.publicId &&
      next.name === owner.name &&
      next.displayName === owner.displayName &&
      next.email === owner.email
    ) {
      return;
    }
    onObservedUser?.(next);
  }, [account.data, onObservedUser, owner]);
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
      online={readNetworkOnline}
      searchRootShelves={SearchRootShelves}
      getSubShelves={GetMySubShelvesByRootShelfId}
      getMaterials={GetMyMaterialsByRootShelfId}
      getBlockPacks={GetMyBlockPacksByRootShelfId}
    >
      {children}
    </SharedShelfItemProvider>
  );
};
