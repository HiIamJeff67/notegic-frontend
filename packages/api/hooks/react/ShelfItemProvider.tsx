import {
  useCreateBlockPack,
  useCreateMyMaterial,
  useDeleteMyMaterialById,
  useUpdateMyMaterialById,
} from "@shared/api/hooks/item.hook";
import {
  useCreateRootShelf,
  useDeleteMyRootShelfById,
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import {
  useCreateSubShelfByRootShelfId,
  useDeleteMySubShelfById,
  useUpdateMySubShelfById,
} from "@shared/api/hooks/subShelf.hook";
import type {
  CreateBlockPackRequest,
  CreateBlockPackResponse,
} from "@shared/api/interfaces/blockPack.interface";
import { ItemType } from "@shared/api/interfaces/enums/itemType.enum";
import type {
  CreateMyMaterialRequest,
  CreateMyMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import type {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import type {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
} from "@shared/api/interfaces/subShelf.interface";
import type { Client } from "@shared/api/local/client";
import { ItemRepository } from "@shared/api/local/repositories/item.repository";
import { RootShelfRepository } from "@shared/api/local/repositories/rootShelf.repository";
import { SubShelfRepository } from "@shared/api/local/repositories/subShelf.repository";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

export type ShelfItemNode = {
  id: string;
  name: string;
  type: ItemType;
};

export type SubShelfTree = {
  id: string;
  name: string;
  items: ShelfItemNode[];
};

export type RootShelfTree = {
  id: string;
  name: string;
  open: boolean;
  subShelves: SubShelfTree[];
};

export type ShelfItemContextValue = {
  shelvesRef: RefObject<RootShelfTree[]>;
  editingId: string | undefined;
  editName: string;
  setEditName: (name: string) => void;
  startRenaming: (id: string, name: string) => void;
  cancelRenaming: () => void;
  toggleRootShelf: (id: string) => void;
  createRootShelf: (name: string) => Promise<void>;
  renameEditing: () => Promise<void>;
  deleteRootShelf: (id: string) => Promise<void>;
  createSubShelf: (rootShelfId: string, name: string) => Promise<void>;
  deleteSubShelf: (rootShelfId: string, id: string) => Promise<void>;
  createItem: (
    rootShelfId: string,
    parentSubShelfId: string,
    name: string,
    type: ItemType
  ) => Promise<void>;
  deleteItem: (
    rootShelfId: string,
    parentSubShelfId: string,
    id: string
  ) => Promise<void>;
};

export const ShelfItemContext = createContext<
  ShelfItemContextValue | undefined
>(undefined);

export const ShelfItemProvider = ({
  ownerPublicId,
  client,
  createRootShelf: createRootShelfFunc,
  updateRootShelf,
  deleteRootShelf: deleteRootShelfFunc,
  createSubShelf: createSubShelfFunc,
  updateSubShelf,
  deleteSubShelf: deleteSubShelfFunc,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  createBlockPack,
  children,
}: {
  ownerPublicId: string;
  client: Client;
  createRootShelf: (
    request: CreateRootShelfRequest
  ) => Promise<CreateRootShelfResponse>;
  updateRootShelf: (
    request: UpdateMyRootShelfByIdRequest
  ) => Promise<UpdateMyRootShelfByIdResponse>;
  deleteRootShelf: (
    request: DeleteMyRootShelfByIdRequest
  ) => Promise<DeleteMyRootShelfByIdResponse>;
  createSubShelf: (
    request: CreateSubShelfByRootShelfIdRequest
  ) => Promise<CreateSubShelfByRootShelfIdResponse>;
  updateSubShelf: (
    request: UpdateMySubShelfByIdRequest
  ) => Promise<UpdateMySubShelfByIdResponse>;
  deleteSubShelf: (
    request: DeleteMySubShelfByIdRequest
  ) => Promise<DeleteMySubShelfByIdResponse>;
  createMaterial: (
    request: CreateMyMaterialRequest
  ) => Promise<CreateMyMaterialResponse>;
  updateMaterial: (
    request: UpdateMyMaterialByIdRequest
  ) => Promise<UpdateMyMaterialByIdResponse>;
  deleteMaterial: (
    request: DeleteMyMaterialByIdRequest
  ) => Promise<DeleteMyMaterialByIdResponse>;
  createBlockPack: (
    request: CreateBlockPackRequest
  ) => Promise<CreateBlockPackResponse>;
  children: ReactNode;
}) => {
  const createRootShelfManager = useCreateRootShelf(
    client,
    ownerPublicId,
    createRootShelfFunc
  );
  const updateMyRootShelfById = useUpdateMyRootShelfById(
    client,
    ownerPublicId,
    updateRootShelf
  );
  const deleteMyRootShelfById = useDeleteMyRootShelfById(
    client,
    ownerPublicId,
    deleteRootShelfFunc
  );
  const createSubShelfByRootShelfId = useCreateSubShelfByRootShelfId(
    client,
    ownerPublicId,
    createSubShelfFunc
  );
  const updateMySubShelfById = useUpdateMySubShelfById(
    client,
    ownerPublicId,
    updateSubShelf
  );
  const deleteMySubShelfById = useDeleteMySubShelfById(
    client,
    ownerPublicId,
    deleteSubShelfFunc
  );
  const createMyMaterial = useCreateMyMaterial(
    client,
    ownerPublicId,
    createMaterial
  );
  const updateMyMaterialById = useUpdateMyMaterialById(
    client,
    ownerPublicId,
    updateMaterial
  );
  const deleteMyMaterialById = useDeleteMyMaterialById(
    client,
    ownerPublicId,
    deleteMaterial
  );
  const createBlockPackManager = useCreateBlockPack(
    client,
    ownerPublicId,
    createBlockPack
  );
  const shelvesRef = useRef<RootShelfTree[]>([]);
  const [, setRevision] = useState(0);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editName, setEditName] = useState("");

  const publish = (shelves: RootShelfTree[]) => {
    shelvesRef.current = shelves;
    setRevision(revision => revision + 1);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const roots = await RootShelfRepository.GetMany(client, {
        ownerPublicId,
      });
      const subs = await SubShelfRepository.GetMany(client, {
        rootShelfIds: roots.shelves.map(shelf => shelf.id),
      });
      const items = await ItemRepository.GetMany(client, {
        parentSubShelfIds: subs.shelves.map(shelf => shelf.id),
      });
      if (cancelled) return;
      publish(
        roots.shelves.map(shelf => ({
          id: shelf.id,
          name: shelf.name,
          open: false,
          subShelves: subs.shelves
            .filter(sub => sub.rootShelfId === shelf.id)
            .map(sub => ({
              id: sub.id,
              name: sub.name,
              items: items.items
                .filter(entry => entry.parentSubShelfId === sub.id)
                .map(entry => ({
                  id: entry.id,
                  name: entry.name,
                  type: entry.type,
                })),
            })),
        }))
      );
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [client, ownerPublicId]);

  const createRootShelf = async (name: string) => {
    const trimmed = name.trim();
    if (trimmed === "") return;
    const created = await createRootShelfManager.mutateAsync({
      body: { name: trimmed },
    });
    publish([
      ...shelvesRef.current,
      { id: created.local.id, name: trimmed, open: true, subShelves: [] },
    ]);
  };

  const renameEditing = async () => {
    const id = editingId;
    const name = editName.trim();
    if (id === undefined || name === "") {
      setEditingId(undefined);
      return;
    }
    const root = shelvesRef.current.find(shelf => shelf.id === id);
    const sub = shelvesRef.current
      .flatMap(shelf => shelf.subShelves.map(entry => ({ shelf, entry })))
      .find(entry => entry.entry.id === id);
    const foundItem = shelvesRef.current
      .flatMap(shelf =>
        shelf.subShelves.flatMap(entry =>
          entry.items.map(itemNode => ({ shelf, entry, itemNode }))
        )
      )
      .find(entry => entry.itemNode.id === id);
    if (root !== undefined) {
      await updateMyRootShelfById.mutateAsync({
        body: { rootShelfId: id, values: { name } },
      });
    } else if (sub !== undefined) {
      await updateMySubShelfById.mutateAsync({
        body: { subShelfId: id, values: { name } },
        affected: { rootShelfId: sub.shelf.id, prevSubShelfId: null },
      });
    } else if (
      foundItem !== undefined &&
      foundItem.itemNode.type === ItemType.Material
    ) {
      await updateMyMaterialById.mutateAsync({
        body: { materialId: id, values: { name } },
        affected: {
          rootShelfId: foundItem.shelf.id,
          parentSubShelfId: foundItem.entry.id,
        },
      });
    }
    publish(
      shelvesRef.current.map(shelf => ({
        ...shelf,
        name: shelf.id === id ? name : shelf.name,
        subShelves: shelf.subShelves.map(entry => ({
          ...entry,
          name: entry.id === id ? name : entry.name,
          items: entry.items.map(itemNode =>
            itemNode.id === id ? { ...itemNode, name } : itemNode
          ),
        })),
      }))
    );
    setEditingId(undefined);
    setEditName("");
  };

  const deleteRootShelf = async (id: string) => {
    await deleteMyRootShelfById.mutateAsync({
      body: { rootShelfId: id },
      affected: { subShelfIds: [], materialIds: [] },
    });
    publish(shelvesRef.current.filter(shelf => shelf.id !== id));
  };

  const createSubShelf = async (rootShelfId: string, name: string) => {
    const trimmed = name.trim();
    if (trimmed === "") return;
    const created = await createSubShelfByRootShelfId.mutateAsync({
      body: { name: trimmed, rootShelfId, prevSubShelfId: null },
      affected: { rootShelfId, prevSubShelfId: null },
    });
    publish(
      shelvesRef.current.map(shelf =>
        shelf.id === rootShelfId
          ? {
              ...shelf,
              open: true,
              subShelves: [
                ...shelf.subShelves,
                { id: created.local.id, name: trimmed, items: [] },
              ],
            }
          : shelf
      )
    );
  };

  const deleteSubShelf = async (rootShelfId: string, id: string) => {
    await deleteMySubShelfById.mutateAsync({
      body: { subShelfId: id },
      affected: { rootShelfId, prevSubShelfId: null },
    });
    publish(
      shelvesRef.current.map(shelf =>
        shelf.id === rootShelfId
          ? {
              ...shelf,
              subShelves: shelf.subShelves.filter(entry => entry.id !== id),
            }
          : shelf
      )
    );
  };

  const createItem = async (
    rootShelfId: string,
    parentSubShelfId: string,
    name: string,
    type: ItemType
  ) => {
    const trimmed = name.trim();
    if (trimmed === "") return;
    const created =
      type === ItemType.BlockPack
        ? await createBlockPackManager.mutateAsync({
            body: {
              name: trimmed,
              parentSubShelfId,
              icon: null,
              headerBackgroundURL: null,
            },
            affected: { rootShelfId, parentSubShelfId },
          })
        : await createMyMaterial.mutateAsync({
            body: { name: trimmed, parentSubShelfId },
            affected: { rootShelfId, parentSubShelfId },
          });
    publish(
      shelvesRef.current.map(shelf =>
        shelf.id === rootShelfId
          ? {
              ...shelf,
              subShelves: shelf.subShelves.map(entry =>
                entry.id === parentSubShelfId
                  ? {
                      ...entry,
                      items: [
                        ...entry.items,
                        { id: created.local.id, name: trimmed, type },
                      ],
                    }
                  : entry
              ),
            }
          : shelf
      )
    );
  };

  const deleteItem = async (
    rootShelfId: string,
    parentSubShelfId: string,
    id: string
  ) => {
    await deleteMyMaterialById.mutateAsync({
      body: { materialId: id },
      affected: { rootShelfId, parentSubShelfId },
    });
    publish(
      shelvesRef.current.map(shelf =>
        shelf.id === rootShelfId
          ? {
              ...shelf,
              subShelves: shelf.subShelves.map(entry =>
                entry.id === parentSubShelfId
                  ? {
                      ...entry,
                      items: entry.items.filter(itemNode => itemNode.id !== id),
                    }
                  : entry
              ),
            }
          : shelf
      )
    );
  };

  return (
    <ShelfItemContext.Provider
      value={{
        shelvesRef,
        editingId,
        editName,
        setEditName,
        startRenaming: (id, name) => {
          setEditingId(id);
          setEditName(name);
        },
        cancelRenaming: () => {
          setEditingId(undefined);
          setEditName("");
        },
        toggleRootShelf: id => {
          publish(
            shelvesRef.current.map(shelf =>
              shelf.id === id ? { ...shelf, open: !shelf.open } : shelf
            )
          );
        },
        createRootShelf,
        renameEditing,
        deleteRootShelf,
        createSubShelf,
        deleteSubShelf,
        createItem,
        deleteItem,
      }}
    >
      {children}
    </ShelfItemContext.Provider>
  );
};
