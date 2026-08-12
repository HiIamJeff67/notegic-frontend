import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import { useApolloClient } from "@apollo/client/react";
import {
  type SearchItemInput,
  SearchItemSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchItemsLazyQuery } from "@shared/api/graphql/hooks/useSearchItems";
import {
  useCreateBlockPack,
  useDeleteMyBlockPackById,
  useUpdateMyBlockPackById,
} from "@shared/api/hooks/blockPack.hook";
import {
  useCreateMyMaterial,
  useDeleteMyMaterialById,
  useUpdateMyMaterialById,
} from "@shared/api/hooks/material.hook";
import { MaxSearchLimit } from "@shared/constants";
import { AnalysisStatus } from "@shared/enums";
import { LRUCache } from "@shared/lib/LRUCache";
import { RootShelfManipulator } from "@shared/lib/rootShelfManipulator";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import type { UUID } from "crypto";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

interface UseItemLogicProps {
  expandedShelvesRef: RefObject<LRUCache<string, ShelfTreeSummary>>;
  inputRef: RefObject<HTMLInputElement | null>;
  setFocusedNode: Dispatch<
    SetStateAction<
      RootShelfNode | SubShelfNode | MaterialNode | BlockPackNode | undefined
    >
  >;
  forceUpdate: () => void;
}

export const useItemLogic = ({
  expandedShelvesRef,
  inputRef,
  setFocusedNode,
  forceUpdate,
}: UseItemLogicProps) => {
  const apolloClient = useApolloClient();
  const createMaterialMutator = useCreateMyMaterial();
  const updateMaterialMutator = useUpdateMyMaterialById();
  const deleteMaterialMutator = useDeleteMyMaterialById();

  const createBlockPackMutator = useCreateBlockPack();
  const updateBlockPackMutator = useUpdateMyBlockPackById();
  const deleteBlockPackMutator = useDeleteMyBlockPackById();

  const [searchItemsInput, setSearchItemsInput] = useState<SearchItemInput>({
    query: "",
    after: null,
    rootShelfId: null,
    parentSubShelfId: null,
  });
  const [editingItemNode, setEditingItemNode] = useState<
    MaterialNode | BlockPackNode | undefined
  >(undefined);
  const [editItemName, setEditItemName] = useState<string>("");
  const [originalItemName, setOriginalItemName] = useState<string>("");

  const [executeSearchItems, itemSearch] = useSearchItemsLazyQuery();

  const searchItems = useCallback(
    async (input?: Partial<SearchItemInput>): Promise<void> => {
      await executeSearchItems({
        variables: {
          input: {
            ...searchItemsInput,
            ...input,
            after: null,
            first: MaxSearchLimit,
            sortBy: SearchItemSortBy.Relevance,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();
    },
    [executeSearchItems, searchItemsInput]
  );

  const loadMoreItems = useCallback(async (): Promise<void> => {
    const connection = itemSearch.data?.searchItems;
    const pageInfo = connection?.searchPageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endEncodedSearchCursor) return;

    const input = itemSearch.variables?.input ?? searchItemsInput;
    await itemSearch.fetchMore({
      variables: {
        input: {
          ...input,
          after: pageInfo.endEncodedSearchCursor,
          first: MaxSearchLimit,
          sortBy: SearchItemSortBy.Relevance,
          sortOrder: SearchSortOrder.Desc,
        },
      },
    });
  }, [itemSearch, searchItemsInput]);

  const isNewItemName = useCallback((): boolean => {
    return editItemName !== originalItemName && editItemName.trim() !== "";
  }, [editItemName, originalItemName]);

  const isItemNodeEditing = useCallback(
    (materialId: UUID): boolean => {
      return !!editingItemNode && editingItemNode.id === materialId;
    },
    [editingItemNode]
  );

  const startRenamingItemNode = useCallback(
    (itemNode: MaterialNode | BlockPackNode): void => {
      setEditingItemNode(itemNode);
      setOriginalItemName(itemNode.name);
      setEditItemName(itemNode.name);
    },
    [setEditingItemNode, setOriginalItemName, setEditItemName]
  );

  const cancelRenamingItemNode = useCallback((): void => {
    setEditingItemNode(undefined);
    setOriginalItemName("");
    setEditItemName("");
  }, [setEditingItemNode, setOriginalItemName, setEditItemName]);

  /* ==================== Materials ==================== */

  const toggleMaterial = (
    materialNode: MaterialNode,
    reset: boolean = false
  ) => {
    materialNode.isOpen = reset ? false : !materialNode.isOpen;
    setFocusedNode(materialNode);
    forceUpdate();
  };

  const createMaterial = useCallback(
    async (
      rootShelfId: UUID,
      parentSubShelfNode: SubShelfNode,
      name: string
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `The given rootShelfId is not exist in the expandedShelvesRef`
        );
      }

      const userAgent = navigator.userAgent;
      const responseOfCreatingMaterial =
        await createMaterialMutator.mutateAsync({
          header: getClientRequestHeaders(userAgent),
          body: {
            parentSubShelfId: parentSubShelfNode.id,
            name: name,
          },
          affected: {
            rootShelfId: rootShelfId,
            parentSubShelfId: parentSubShelfNode.id,
          },
        });
      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.root.itemCount++;
      if (parentSubShelfNode !== null) {
        shelfTreeSummary.maxDepth = Math.max(
          shelfTreeSummary.maxDepth,
          parentSubShelfNode.path.length + 1
        );
        shelfTreeSummary.maxWidth = Math.max(
          shelfTreeSummary.maxWidth,
          Object.entries(parentSubShelfNode.children).length +
            Object.entries(parentSubShelfNode.materialNodes).length +
            1
        );
        parentSubShelfNode.materialNodes[
          responseOfCreatingMaterial.data.id as UUID
        ] = {
          id: responseOfCreatingMaterial.data.id as UUID,
          parentSubShelfId: parentSubShelfNode.id,
          name: name,
          size: 0,
          contentType: "text/plain",
          parseMediaType: "",
          downloadURL: null,
          deletedAt: null,
          updatedAt: responseOfCreatingMaterial.data.createdAt,
          createdAt: responseOfCreatingMaterial.data.createdAt,
          isOpen: false,
          nodeType: "Material",
        };
        forceUpdate();
      }
    },
    [expandedShelvesRef, createMaterialMutator]
  );

  const renameEditingMaterial = useCallback(async (): Promise<void> => {
    try {
      if (
        !isNewItemName() ||
        !editingItemNode ||
        editingItemNode.nodeType !== "Material"
      ) {
        throw new Error("the name of the given material node is invalid");
      }

      const userAgent = navigator.userAgent;
      await updateMaterialMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          materialId: editingItemNode.id,
          values: {
            name: editItemName,
          },
        },
        affected: {
          parentSubShelfId: editingItemNode.parentSubShelfId,
        },
      });

      editingItemNode.name = editItemName;
      setEditingItemNode(prev =>
        prev ? { ...prev, name: editItemName } : undefined
      );
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setEditingItemNode(undefined);
      setEditItemName("");
      setOriginalItemName("");
    }
  }, [
    editingItemNode,
    editItemName,
    originalItemName,
    setEditingItemNode,
    setEditItemName,
    setOriginalItemName,
    updateMaterialMutator,
  ]);

  const deleteMaterial = useCallback(
    async (
      parentSubShelfNode: SubShelfNode,
      materialNode: MaterialNode
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(
        parentSubShelfNode.rootShelfId as UUID
      );
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `parentSubShelfNode not found in one of the children of rootShelfNode`
        );
      }

      const userAgent = navigator.userAgent;
      await deleteMaterialMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          materialId: materialNode.id,
        },
        affected: {
          rootShelfId: parentSubShelfNode.rootShelfId,
          parentSubShelfId: parentSubShelfNode.id,
        },
      });

      delete parentSubShelfNode.materialNodes[materialNode.id];
      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.estimatedByteSize = Math.max(
        0,
        RootShelfManipulator.estimateMaterialNode(materialNode)
      );
      // the maxWidth and maxDepth is unknown in this point
      shelfTreeSummary.analysisStatus = AnalysisStatus.OnlySubShelves;
      forceUpdate();
    },
    [expandedShelvesRef, deleteMaterialMutator, RootShelfManipulator]
  );

  /* ==================== BlockPack ==================== */

  const toggleBlockPack = useCallback(
    (blockPackNode: BlockPackNode, reset?: boolean) => {
      blockPackNode.isOpen = reset ? false : !blockPackNode.isOpen;
      setFocusedNode(blockPackNode);
      forceUpdate();
    },
    []
  );

  const createBlockPack = useCallback(
    async (
      rootShelfId: UUID,
      parentSubShelfNode: SubShelfNode,
      name: string
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `The given rootShelfId is not exist in the expandedShelvesRef`
        );
      }

      const userAgent = navigator.userAgent;
      const responseOfCreatingBlockPack =
        await createBlockPackMutator.mutateAsync({
          header: getClientRequestHeaders(userAgent),
          body: {
            parentSubShelfId: parentSubShelfNode.id,
            name: name,
            icon: null,
            headerBackgroundURL: null,
          },
          affected: {
            rootShelfId: rootShelfId,
            parentSubShelfId: parentSubShelfNode.id,
          },
        });

      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.root.itemCount++;
      if (parentSubShelfNode !== null) {
        shelfTreeSummary.maxDepth = Math.max(
          shelfTreeSummary.maxDepth,
          parentSubShelfNode.path.length + 1
        );
        shelfTreeSummary.maxWidth = Math.max(
          shelfTreeSummary.maxWidth,
          Object.entries(parentSubShelfNode.children).length +
            Object.entries(parentSubShelfNode.blockPackNodes).length +
            1
        );
        parentSubShelfNode.blockPackNodes[
          responseOfCreatingBlockPack.data.id as UUID
        ] = {
          id: responseOfCreatingBlockPack.data.id as UUID,
          parentSubShelfId: parentSubShelfNode.id,
          name: name,
          icon: null,
          headerBackgroundURL: null,
          blockCount: 0,
          updatedAt: responseOfCreatingBlockPack.data.createdAt,
          createdAt: responseOfCreatingBlockPack.data.createdAt,
          isOpen: false,
          nodeType: "BlockPack",
        };
        forceUpdate();
      }
    },
    [expandedShelvesRef, createBlockPackMutator]
  );

  const renameEditingBlockPack = useCallback(async (): Promise<void> => {
    try {
      if (
        !isNewItemName() ||
        !editingItemNode ||
        editingItemNode.nodeType !== "BlockPack"
      ) {
        throw new Error("the name of the given block pack node is invalid");
      }

      const userAgent = navigator.userAgent;
      await updateBlockPackMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          blockPackId: editingItemNode.id,
          values: {
            name: editItemName,
          },
        },
        affected: {
          parentSubShelfId: editingItemNode.parentSubShelfId,
        },
      });

      editingItemNode.name = editItemName;
      setEditingItemNode(prev =>
        prev ? { ...prev, name: editItemName } : undefined
      );
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setEditingItemNode(undefined);
      setEditItemName("");
      setOriginalItemName("");
    }
  }, [
    editItemName,
    originalItemName,
    setEditingItemNode,
    setEditItemName,
    setOriginalItemName,
    updateBlockPackMutator,
  ]);

  const removeBlockPackOptimistically = useCallback(
    (blockPackId: UUID) => {
      let didRemove = false;
      const removeFromSubShelf = (subShelf: SubShelfNode): boolean => {
        if (subShelf.blockPackNodes[blockPackId]) {
          delete subShelf.blockPackNodes[blockPackId];
          return true;
        }

        for (const child of Object.values(subShelf.children)) {
          if (removeFromSubShelf(child)) return true;
        }

        return false;
      };

      for (const summary of expandedShelvesRef.current.values()) {
        for (const subShelf of Object.values(summary.root.children)) {
          if (removeFromSubShelf(subShelf)) {
            summary.hasChanged = true;
            summary.root.itemCount = Math.max(0, summary.root.itemCount - 1);
            didRemove = true;
            break;
          }
        }
        if (didRemove) break;
      }

      setFocusedNode(prev => (prev?.id === blockPackId ? undefined : prev));
      apolloClient.cache.modify({
        fields: {
          searchItems(existing, { readField }) {
            if (!existing?.searchEdges) return existing;
            return {
              ...existing,
              searchEdges: existing.searchEdges.filter((edge: any) => {
                const node = readField("node", edge);
                return readField("id", node as any) !== blockPackId;
              }),
            };
          },
        },
      });
      apolloClient.cache.evict({
        id: apolloClient.cache.identify({
          __typename: "PrivateItem",
          id: blockPackId,
        }),
      });
      apolloClient.cache.gc();
      if (didRemove) forceUpdate();
    },
    [apolloClient, expandedShelvesRef, forceUpdate, setFocusedNode]
  );

  const deleteBlockPack = useCallback(
    async (
      parentSubShelfNode: SubShelfNode,
      blockPackNode: BlockPackNode
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(
        parentSubShelfNode.rootShelfId as UUID
      );
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `parentSubShelfNode not found in one of the children of rootShelfNode`
        );
      }

      const userAgent = navigator.userAgent;
      await deleteBlockPackMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          blockPackId: blockPackNode.id,
        },
        affected: {
          rootShelfId: parentSubShelfNode.rootShelfId,
          parentSubShelfId: parentSubShelfNode.id,
        },
      });

      removeBlockPackOptimistically(blockPackNode.id);
    },
    [deleteBlockPackMutator, expandedShelvesRef, removeBlockPackOptimistically]
  );

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingItemNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        switch (editingItemNode.nodeType) {
          case "Material":
            await renameEditingMaterial();
            break;
          case "BlockPack":
            await renameEditingBlockPack();
            break;
        }

        setEditingItemNode(undefined);
        setEditItemName("");
        setOriginalItemName("");
      }
    };

    if (editingItemNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingItemNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [
    editingItemNode,
    inputRef,
    renameEditingMaterial,
    renameEditingBlockPack,
  ]);

  return {
    searchItemsInput,
    setSearchItemsInput,
    itemSearch,
    searchItems,
    loadMoreItems,
    editItemName: editItemName,
    setEditItemName: setEditItemName,
    isNewItemName: isNewItemName,
    isItemNodeEditing: isItemNodeEditing,
    isAnyItemNodeEditing: editingItemNode !== undefined,
    startRenamingItemNode: startRenamingItemNode,
    cancelRenamingItemNode: cancelRenamingItemNode,
    toggleMaterial: toggleMaterial,
    createMaterial: createMaterial,
    renameEditingMaterial: renameEditingMaterial,
    deleteMaterial: deleteMaterial,
    toggleBlockPack: toggleBlockPack,
    createBlockPack: createBlockPack,
    renameEditingBlockPack: renameEditingBlockPack,
    deleteBlockPack: deleteBlockPack,
    removeBlockPackOptimistically: removeBlockPackOptimistically,
  };
};
