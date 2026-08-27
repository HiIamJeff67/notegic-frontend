import { getClientRequestHeaders } from "@/api/clientHeaders";
import {
  useCreateSubShelfByRootShelfId,
  useDeleteMySubShelfById,
  useMoveMySubShelf,
  useUpdateMySubShelfById,
} from "@/api/hooks/subShelf.hook";
import { GetMyBlockPacksByParentSubShelfIdResponse } from "@shared/api/interfaces/blockPack.interface";
import { GetMyMaterialsByParentSubShelfIdResponse } from "@shared/api/interfaces/material.interface";
import { GetMySubShelvesByPrevSubShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import { queryFnGetMyBlockPacksByParentSubShelfId } from "@/api/invokers/blockPack.invoker";
import { queryFnGetMyMaterialsByParentSubShelfId } from "@/api/invokers/material.invoker";
import { queryFnGetMySubShelvesByPrevSubShelfId } from "@/api/invokers/subShelf.invoker";
import { LRUCache } from "@shared/lib/LRUCache";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import toast from "@shared/lib/toast";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import type { UUID } from "crypto";
import { RefObject, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateError } from "@shared/i18n/error";

interface UseSubShelfLogicProps {
  expandedShelvesRef: RefObject<LRUCache<string, ShelfTreeSummary>>;
  inputRef: RefObject<HTMLInputElement | null>;
  setFocusedNode: (
    node:
      | RootShelfNode
      | SubShelfNode
      | MaterialNode
      | BlockPackNode
      | undefined
  ) => void;
  forceUpdate: () => void;
}

export const useSubShelfLogic = ({
  expandedShelvesRef,
  inputRef,
  setFocusedNode,
  forceUpdate,
}: UseSubShelfLogicProps) => {
  const { t } = useTranslation();
  const createSubShelfMutator = useCreateSubShelfByRootShelfId();
  const updateSubShelfMutator = useUpdateMySubShelfById();
  const deleteSubShelfMutator = useDeleteMySubShelfById();
  const moveSubShelfMutator = useMoveMySubShelf();

  const [editingSubShelfNode, setEditingSubShelfNode] = useState<
    SubShelfNode | undefined
  >(undefined);
  const [editSubShelfName, setEditSubShelfName] = useState<string>("");
  const [originalSubShelfName, setOriginalSubShelfName] = useState<string>("");

  const expandSubShelf = useCallback(
    async (
      rootShelfNode: RootShelfNode,
      subShelfNode: SubShelfNode
    ): Promise<void> => {
      // the isExpanded may be modified if the user just drag and drop something in below the `subShelfNode`
      const userAgent = navigator.userAgent;
      const responseOfGettingSubShelves =
        (await queryFnGetMySubShelvesByPrevSubShelfId({
          header: getClientRequestHeaders(userAgent),
          param: {
            prevSubShelfId: subShelfNode.id,
          },
        })) as GetMySubShelvesByPrevSubShelfIdResponse;
      const responseOfGettingMaterials =
        (await queryFnGetMyMaterialsByParentSubShelfId({
          header: getClientRequestHeaders(userAgent),
          param: {
            parentSubShelfId: subShelfNode.id,
          },
        })) as GetMyMaterialsByParentSubShelfIdResponse;
      const responseOfGettingBlockPacks =
        (await queryFnGetMyBlockPacksByParentSubShelfId({
          header: getClientRequestHeaders(userAgent),
          param: {
            parentSubShelfId: subShelfNode.id,
          },
        })) as GetMyBlockPacksByParentSubShelfIdResponse;
      SubShelfManipulator.initializeSubShelfNodesByResponse(
        rootShelfNode,
        subShelfNode,
        responseOfGettingSubShelves.data
      );
      SubShelfManipulator.initializeMaterialNodesByResponse(
        subShelfNode,
        responseOfGettingMaterials.data
      );
      SubShelfManipulator.initializeBlockPackNodesByResponse(
        subShelfNode,
        responseOfGettingBlockPacks.data
      );
      subShelfNode.isExpanded = true;
      forceUpdate();
    },
    [
      SubShelfManipulator,
      queryFnGetMySubShelvesByPrevSubShelfId,
      queryFnGetMyMaterialsByParentSubShelfId,
      queryFnGetMyBlockPacksByParentSubShelfId,
    ]
  );

  const toggleSubShelf = (
    subShelfNode: SubShelfNode,
    reset: boolean = false
  ) => {
    subShelfNode.isOpen = reset ? false : !subShelfNode.isOpen;
    setFocusedNode(subShelfNode);
    forceUpdate();
  };

  const createSubShelf = useCallback(
    async (
      rootShelfId: UUID,
      prevSubShelfNode: SubShelfNode | null,
      name: string
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `The given rootShelfId is not exist in the expandedShelvesRef`
        );
      }

      const userAgent = navigator.userAgent;
      const responseOfCreatingSubShelf =
        await createSubShelfMutator.mutateAsync({
          header: getClientRequestHeaders(userAgent),
          body: {
            rootShelfId: rootShelfId,
            prevSubShelfId: prevSubShelfNode?.id ?? null,
            name: name,
          },
          affected: {
            rootShelfId: rootShelfId,
            prevSubShelfId: prevSubShelfNode?.id ?? null,
          },
        });

      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.root.subShelfCount++;
      if (prevSubShelfNode !== null) {
        shelfTreeSummary.maxDepth = Math.max(
          shelfTreeSummary.maxDepth,
          prevSubShelfNode.path.length + 1
        );
        shelfTreeSummary.maxWidth = Math.max(
          shelfTreeSummary.maxWidth,
          Object.entries(prevSubShelfNode.children).length +
            Object.entries(prevSubShelfNode.materialNodes).length +
            1
        );
        const newPath = prevSubShelfNode.path;
        newPath.push(prevSubShelfNode.id);
        prevSubShelfNode.children[responseOfCreatingSubShelf.data.id as UUID] =
          {
            id: responseOfCreatingSubShelf.data.id as UUID,
            rootShelfId: rootShelfId,
            prevSubShelfId: prevSubShelfNode.id as UUID,
            name: name,
            path: newPath,
            updatedAt: responseOfCreatingSubShelf.data.createdAt,
            createdAt: responseOfCreatingSubShelf.data.createdAt,
            isExpanded: true,
            children: {},
            materialNodes: {},
            blockPackNodes: {},
            isOpen: false,
            nodeType: "SubShelf",
          };
      } else {
        shelfTreeSummary.maxDepth = Math.max(shelfTreeSummary.maxDepth, 1);
        shelfTreeSummary.maxWidth = Math.max(shelfTreeSummary.maxWidth, 1);
        shelfTreeSummary.root.children[
          responseOfCreatingSubShelf.data.id as UUID
        ] = {
          id: responseOfCreatingSubShelf.data.id as UUID,
          rootShelfId: rootShelfId,
          prevSubShelfId: null,
          name: name,
          path: [],
          updatedAt: responseOfCreatingSubShelf.data.createdAt,
          createdAt: responseOfCreatingSubShelf.data.createdAt,
          isExpanded: true,
          children: {},
          materialNodes: {},
          blockPackNodes: {},
          isOpen: false,
          nodeType: "SubShelf",
        };
      }
      forceUpdate();
    },
    [expandedShelvesRef, createSubShelfMutator]
  );

  const isNewSubShelfName = useCallback((): boolean => {
    return (
      editSubShelfName !== originalSubShelfName &&
      editSubShelfName.trim() !== ""
    );
  }, [editSubShelfName, originalSubShelfName]);

  const isSubShelfNodeEditing = useCallback(
    (subShelfId: UUID): boolean => {
      return !!editingSubShelfNode && editingSubShelfNode.id === subShelfId;
    },
    [editingSubShelfNode]
  );

  const startRenamingSubShelfNode = useCallback(
    (subShelfNode: SubShelfNode): void => {
      setEditingSubShelfNode(subShelfNode);
      setOriginalSubShelfName(subShelfNode.name);
      setEditSubShelfName(subShelfNode.name);
    },
    [setEditingSubShelfNode, setOriginalSubShelfName, setEditSubShelfName]
  );

  const cancelRenamingSubShelfNode = useCallback((): void => {
    setEditingSubShelfNode(undefined);
    setOriginalSubShelfName("");
    setEditSubShelfName("");
  }, [setEditingSubShelfNode, setOriginalSubShelfName, setEditSubShelfName]);

  const renameEditingSubShelf = useCallback(async (): Promise<void> => {
    const editingNode = editingSubShelfNode;
    if (!editingNode) return;

    if (editSubShelfName === originalSubShelfName) {
      cancelRenamingSubShelfNode();
      return;
    }

    if (editSubShelfName.trim() === "") {
      toast.error(t("workspace.notifications.invalidSubShelfName"));
      cancelRenamingSubShelfNode();
      return;
    }

    const previousName = editingNode.name;
    editingNode.name = editSubShelfName;
    setEditingSubShelfNode(prev =>
      prev ? { ...prev, name: editSubShelfName } : undefined
    );
    forceUpdate();

    try {
      const response = await updateSubShelfMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          subShelfId: editingNode.id,
          values: {
            name: editSubShelfName,
          },
        },
        affected: {
          rootShelfId: editingNode.rootShelfId,
          prevSubShelfId: editingNode.prevSubShelfId,
        },
      });
      if (response.success === false) throw response.exception;
      toast.success(t("workspace.notifications.shelfRenamed"));
    } catch (error) {
      editingNode.name = previousName;
      forceUpdate();
      toast.error(translateError(error, t));
    } finally {
      cancelRenamingSubShelfNode();
    }
  }, [
    cancelRenamingSubShelfNode,
    editSubShelfName,
    editingSubShelfNode,
    forceUpdate,
    originalSubShelfName,
    setEditingSubShelfNode,
    t,
    updateSubShelfMutator,
  ]);

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingSubShelfNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingSubShelf();
      }
    };

    if (editingSubShelfNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingSubShelfNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingSubShelfNode, renameEditingSubShelf]);

  const deleteSubShelf = useCallback(
    async (
      prevSubShelfNode: SubShelfNode | null,
      subShelfNode: SubShelfNode
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(
        subShelfNode.rootShelfId
      );
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `subShelfNode not found in one of the children of rootShelfNode`
        );
      }

      const userAgent = navigator.userAgent;
      await deleteSubShelfMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          subShelfId: subShelfNode.id,
        },
        affected: {
          rootShelfId: subShelfNode.rootShelfId,
          prevSubShelfId: subShelfNode.prevSubShelfId,
        },
      });

      if (prevSubShelfNode === null) {
        delete shelfTreeSummary.root.children[subShelfNode.id];
      } else {
        delete prevSubShelfNode.children[subShelfNode.id];
      }
      shelfTreeSummary.hasChanged = true;
      forceUpdate();
    },
    [expandedShelvesRef, deleteSubShelfMutator]
  );

  const moveSubShelf = useCallback(
    async (
      prevSubShelfNode: SubShelfNode | null,
      sourceSubShelfNode: SubShelfNode,
      destinationRootShelfNode: RootShelfNode,
      destinationSubShelfNode: SubShelfNode | null
    ): Promise<void> => {
      const sourceSummary = expandedShelvesRef.current.get(
        sourceSubShelfNode.rootShelfId
      );
      if (sourceSummary === undefined) {
        throw new Error(
          `the sourceSubShelfNode does not belong to any valid root shelf node`
        );
      }
      const destinationSummary = expandedShelvesRef.current.get(
        destinationRootShelfNode.id
      );
      if (destinationSummary === undefined) {
        throw new Error(
          `the destinationSubShelfNode does not belong to any valid root shelf node or destinationRootShelfNode does not exist`
        );
      }

      if (
        destinationSubShelfNode !== null &&
        destinationSummary.root.id !== destinationSubShelfNode.rootShelfId
      ) {
        throw new Error(
          `the destinationSummary does not contain destinationSubShelfNode`
        );
      }
      if (
        sourceSubShelfNode !== null &&
        sourceSummary.root.id !== sourceSubShelfNode.rootShelfId
      ) {
        throw new Error(
          `the sourceSummary does not contain sourceSubShelfNode`
        );
      }

      const { childSubShelfNodes } =
        SubShelfManipulator.getAllChildSubShelfNodesAndMaterialNodes(
          sourceSubShelfNode
        );
      const childSubShelfIds = childSubShelfNodes.map(val => val.id);

      const userAgent = navigator.userAgent;
      await moveSubShelfMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          sourceRootShelfId: sourceSubShelfNode.rootShelfId,
          sourceSubShelfId: sourceSubShelfNode.id,
          destinationRootShelfId: destinationRootShelfNode.id,
          destinationSubShelfId: destinationSubShelfNode?.id ?? null,
        },
        affected: {
          rootShelfId: sourceSubShelfNode.rootShelfId,
          childSubShelfIds: childSubShelfIds,
        },
      });

      const deletedSubShelfNode = sourceSubShelfNode;
      SubShelfManipulator.deleteSubShelfNode(
        sourceSummary,
        prevSubShelfNode,
        sourceSubShelfNode
      );
      SubShelfManipulator.insertSubShelfNode(
        destinationSummary,
        destinationSubShelfNode,
        deletedSubShelfNode
      );
      if (sourceSubShelfNode.rootShelfId !== destinationRootShelfNode.id) {
        deletedSubShelfNode.rootShelfId = destinationRootShelfNode.id;
      }
      deletedSubShelfNode.prevSubShelfId = destinationSubShelfNode?.id ?? null;
      forceUpdate();
    },
    [expandedShelvesRef, SubShelfManipulator, moveSubShelfMutator]
  );

  return {
    expandSubShelf: expandSubShelf,
    toggleSubShelf: toggleSubShelf,
    createSubShelf: createSubShelf,
    editSubShelfName: editSubShelfName,
    setEditSubShelfName: setEditSubShelfName,
    isNewSubShelfName: isNewSubShelfName,
    isSubShelfNodeEditing: isSubShelfNodeEditing,
    isAnySubShelfNodeEditing: editingSubShelfNode !== undefined,
    startRenamingSubShelfNode: startRenamingSubShelfNode,
    cancelRenamingSubShelfNode: cancelRenamingSubShelfNode,
    renameEditingSubShelf: renameEditingSubShelf,
    deleteSubShelf: deleteSubShelf,
    moveSubShelf: moveSubShelf,
  };
};
