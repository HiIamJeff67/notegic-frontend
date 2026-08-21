import { useApolloClient } from "@apollo/client/react";
import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import {
  PrivateRootShelf,
  SearchRootShelfEdge,
  SearchRootShelfSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRootShelvesLazyQuery } from "@shared/api/graphql/hooks/useSearchShelves";
import {
  useCreateRootShelf,
  useDeleteMyRootShelfById,
  useLeaveMyRootShelf,
  useTransferMyRootShelfOwnership,
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import { useGetAllMySubShelvesByRootShelfId } from "@shared/api/hooks/subShelf.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { MaxSearchLimit } from "@shared/constants";
import { AnalysisStatus } from "@shared/enums";
import { LRUCache } from "@shared/lib/LRUCache";
import { RootShelfManipulator } from "@shared/lib/rootShelfManipulator";
import toast from "@shared/lib/toast";
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
import { useTranslation } from "react-i18next";
import { translateError } from "@/i18n/error";

interface UseRootShelfLogicProps {
  expandedShelvesRef: RefObject<LRUCache<string, ShelfTreeSummary>>;
  inputRef: RefObject<HTMLInputElement | null>;
  setFocusedNode: Dispatch<
    SetStateAction<
      RootShelfNode | SubShelfNode | MaterialNode | BlockPackNode | undefined
    >
  >;
  forceUpdate: () => void;
}

export const useRootShelfLogic = ({
  expandedShelvesRef,
  inputRef,
  setFocusedNode,
  forceUpdate,
}: UseRootShelfLogicProps) => {
  const { t } = useTranslation();
  const apolloClient = useApolloClient();
  const getAllSubShelvesQuerier = useGetAllMySubShelvesByRootShelfId();
  const createRootShelfMutator = useCreateRootShelf();
  const updateRootShelfMutator = useUpdateMyRootShelfById();
  const deleteRootShelfMutator = useDeleteMyRootShelfById();
  const leaveRootShelfMutator = useLeaveMyRootShelf();
  const transferRootShelfOwnershipMutator = useTransferMyRootShelfOwnership();

  const [searchInput, setSearchInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });

  const [editingRootShelfNode, setEditingRootShelfNode] = useState<
    RootShelfNode | undefined
  >(undefined);
  const [editRootShelfName, setEditRootShelfName] = useState<string>("");
  const [originalRootShelfName, setOriginalRootShelfName] =
    useState<string>("");

  const [executeSearch, { data, loading, fetchMore }] =
    useSearchRootShelvesLazyQuery();

  // fetch some root shelves initially
  useEffect(() => {
    if (
      data !== undefined &&
      data.searchRootShelves !== undefined &&
      data.searchRootShelves.searchEdges !== undefined
    ) {
      for (const edge of data.searchRootShelves
        .searchEdges as SearchRootShelfEdge[]) {
        const existingSummary = expandedShelvesRef.current.get(edge.node.id);
        if (existingSummary === undefined) {
          const shelfTreeSummary: ShelfTreeSummary = {
            root: {
              id: edge.node.id,
              name: edge.node.name,
              subShelfCount: edge.node.subShelfCount,
              itemCount: edge.node.itemCount,
              lastAnalyzedAt: edge.node.lastAnalyzedAt,
              updatedAt: edge.node.updatedAt,
              createdAt: edge.node.createdAt,
              permission: edge.node.permission as AccessControlPermission,
              isExpanded: false,
              children: {},
              isOpen: false,
              nodeType: "RootShelf",
            },
            estimatedByteSize: 0, // may use some field to store the size of rootShelf,
            hasChanged: false,
            analysisStatus: AnalysisStatus.Unexplored,
            maxWidth: 0,
            maxDepth: 0,
          };
          expandedShelvesRef.current.set(edge.node.id, shelfTreeSummary);
        } else {
          existingSummary.root.name = edge.node.name;
          existingSummary.root.subShelfCount = edge.node.subShelfCount;
          existingSummary.root.itemCount = edge.node.itemCount;
          existingSummary.root.lastAnalyzedAt = edge.node.lastAnalyzedAt;
          existingSummary.root.updatedAt = edge.node.updatedAt;
          existingSummary.root.createdAt = edge.node.createdAt;
          existingSummary.root.permission = edge.node
            .permission as AccessControlPermission;
          expandedShelvesRef.current.set(edge.node.id, existingSummary);
        }
      }
      forceUpdate();
    }
  }, [data]);

  const searchRootShelves = useCallback(async (): Promise<void> => {
    await executeSearch({
      variables: {
        input: {
          ...searchInput,
          first: MaxSearchLimit,
          sortBy: SearchRootShelfSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
    }).retain();
  }, [executeSearch, searchInput]);

  const loadMoreRootShelves = useCallback(async (): Promise<void> => {
    const searchRootShelvesConnection = data?.searchRootShelves;
    const searchEdges = searchRootShelvesConnection?.searchEdges ?? [];

    if (!searchRootShelvesConnection || searchEdges.length === 0) return;

    const pageInfo = searchRootShelvesConnection?.searchPageInfo;
    if (!pageInfo || !pageInfo.hasNextPage) return;

    await fetchMore({
      variables: {
        input: {
          ...searchInput,
          first: MaxSearchLimit,
          sortBy: SearchRootShelfSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
          after: pageInfo.endEncodedSearchCursor,
        },
      },
    });
  }, [data, fetchMore, searchInput]);

  const expandRootShelf = async (
    rootShelf: PrivateRootShelf
  ): Promise<ShelfTreeSummary> => {
    const shelfTreeSummary = expandedShelvesRef.current.get(rootShelf.id);
    if (shelfTreeSummary === undefined) {
      throw new Error(`root shelf does not exist`);
    }

    const userAgent = navigator.userAgent;
    const responseOfGettingAllSubShelves = await getAllSubShelvesQuerier.fetch({
      header: getClientRequestHeaders(userAgent),
      param: {
        rootShelfId: rootShelf.id,
      },
    });

    const newRootShelfNode =
      RootShelfManipulator.initializeSubShelfNodeTreeByResponse(
        shelfTreeSummary.root,
        responseOfGettingAllSubShelves
      );
    shelfTreeSummary.root = newRootShelfNode;
    shelfTreeSummary.root.isExpanded = true;
    shelfTreeSummary.analysisStatus = AnalysisStatus.Unexplored;
    expandedShelvesRef.current.set(rootShelf.id, shelfTreeSummary);
    forceUpdate();
    return shelfTreeSummary;
  };

  const toggleRootShelf = (
    rootShelfNode: RootShelfNode,
    reset: boolean = false
  ) => {
    rootShelfNode.isOpen = reset ? false : !rootShelfNode.isOpen;
    setFocusedNode(rootShelfNode);
    forceUpdate();
  };

  const createRootShelf = useCallback(
    async (name: string): Promise<void> => {
      const userAgent = navigator.userAgent;
      const responseOfCreatingRootShelf =
        await createRootShelfMutator.mutateAsync({
          header: getClientRequestHeaders(userAgent),
          body: {
            name: name,
          },
        });

      const shelfTreeSummary: ShelfTreeSummary =
        RootShelfManipulator.analysisAndGenerateSummary({
          id: responseOfCreatingRootShelf.data.id as UUID,
          name: name,
          subShelfCount: 0,
          itemCount: 0,
          lastAnalyzedAt: responseOfCreatingRootShelf.data.lastAnalyzedAt,
          updatedAt: responseOfCreatingRootShelf.data.createdAt,
          createdAt: responseOfCreatingRootShelf.data.createdAt,
          permission: AccessControlPermission.Owner,
          isExpanded: true,
          children: {},
          isOpen: false,
          nodeType: "RootShelf",
        });
      expandedShelvesRef.current.set(
        responseOfCreatingRootShelf.data.id as UUID,
        shelfTreeSummary
      );
      forceUpdate();
    },
    [createRootShelfMutator, RootShelfManipulator, expandedShelvesRef]
  );

  const isNewRootShelfName = useCallback(() => {
    return (
      editRootShelfName !== originalRootShelfName &&
      editRootShelfName.trim() !== ""
    );
  }, [editRootShelfName, originalRootShelfName]);

  const isRootShelfNodeEditing = useCallback(
    (rootShelfId: UUID) => {
      return !!editingRootShelfNode && editingRootShelfNode.id === rootShelfId;
    },
    [editingRootShelfNode]
  );

  const startRenamingRootShelfNode = useCallback(
    (rootShelfNode: RootShelfNode) => {
      setEditingRootShelfNode(rootShelfNode);
      setOriginalRootShelfName(rootShelfNode.name);
      setEditRootShelfName(rootShelfNode.name);
    },
    [setEditingRootShelfNode, setOriginalRootShelfName, setEditRootShelfName]
  );

  const cancelRenamingRootShelfNode = useCallback(() => {
    setEditingRootShelfNode(undefined);
    setOriginalRootShelfName("");
    setEditRootShelfName("");
  }, [setEditingRootShelfNode, setOriginalRootShelfName, setEditRootShelfName]);

  const renameEditingRootShelf = useCallback(async (): Promise<void> => {
    const editingNode = editingRootShelfNode;
    if (!editingNode) return;

    if (editRootShelfName === originalRootShelfName) {
      cancelRenamingRootShelfNode();
      return;
    }

    if (editRootShelfName.trim() === "") {
      toast.error(t("workspace.notifications.invalidRootShelfName"));
      cancelRenamingRootShelfNode();
      return;
    }

    const shelfTreeSummary = expandedShelvesRef.current.get(editingNode.id);
    if (shelfTreeSummary === undefined) {
      cancelRenamingRootShelfNode();
      toast.error(
        translateError(
          new Error(
            `parentShelfNode not found in one of the children of editingRootShelfNode`
          ),
          t
        )
      );
      return;
    }

    const previousName = editingNode.name;
    shelfTreeSummary.root.name = editRootShelfName;
    editingNode.name = editRootShelfName;
    setEditingRootShelfNode(prev =>
      prev ? { ...prev, name: editRootShelfName } : undefined
    );
    forceUpdate();

    try {
      const response = await updateRootShelfMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          rootShelfId: editingNode.id,
          values: {
            name: editRootShelfName,
          },
        },
      });
      if (response.success === false) throw response.exception;
      toast.success(t("workspace.notifications.shelfRenamed"));
    } catch (error) {
      shelfTreeSummary.root.name = previousName;
      editingNode.name = previousName;
      forceUpdate();
      toast.error(translateError(error, t));
    } finally {
      cancelRenamingRootShelfNode();
    }
  }, [
    cancelRenamingRootShelfNode,
    editRootShelfName,
    editingRootShelfNode,
    expandedShelvesRef,
    forceUpdate,
    originalRootShelfName,
    setEditingRootShelfNode,
    t,
    updateRootShelfMutator,
  ]);

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingRootShelfNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingRootShelf();
      }
    };

    if (editingRootShelfNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingRootShelfNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingRootShelfNode, renameEditingRootShelf]);

  const removeRootShelfOptimistically = useCallback(
    (rootShelfId: UUID) => {
      expandedShelvesRef.current.delete(rootShelfId);
      setFocusedNode(prev => (prev?.id === rootShelfId ? undefined : prev));
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existing, { readField }) {
            if (!existing?.searchEdges) return existing;
            return {
              ...existing,
              searchEdges: existing.searchEdges.filter((edge: any) => {
                const node = readField("node", edge);
                return readField("id", node as any) !== rootShelfId;
              }),
            };
          },
        },
      });
      apolloClient.cache.evict({
        id: apolloClient.cache.identify({
          __typename: "PrivateRootShelf",
          id: rootShelfId,
        }),
      });
      apolloClient.cache.gc();
      forceUpdate();
    },
    [apolloClient, expandedShelvesRef, forceUpdate, setFocusedNode]
  );

  const deleteRootShelf = useCallback(
    async (rootShelfNode: RootShelfNode): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfNode.id);
      if (shelfTreeSummary === undefined) {
        throw new Error(`rootShelfNode not found in expandedShelves`);
      }

      const { childSubShelfNodes, materialNodes } =
        RootShelfManipulator.getAllChildSubShelfNodesAndMaterialNodes(
          rootShelfNode
        );
      const subShelfIds = childSubShelfNodes.map(val => val.id);
      const materialIds = materialNodes.map(val => val.id);

      const userAgent = navigator.userAgent;
      await deleteRootShelfMutator.mutateAsync({
        header: getClientRequestHeaders(userAgent),
        body: {
          rootShelfId: rootShelfNode.id,
        },
        affected: {
          subShelfIds: subShelfIds,
          materialIds: materialIds,
        },
      });
      removeRootShelfOptimistically(rootShelfNode.id);
    },
    [
      deleteRootShelfMutator,
      expandedShelvesRef,
      removeRootShelfOptimistically,
      RootShelfManipulator,
    ]
  );

  const getRootShelfPermission = useCallback(
    (rootShelfId: UUID) =>
      expandedShelvesRef.current.get(rootShelfId)?.root.permission,
    [expandedShelvesRef]
  );

  const canDeleteRootShelf = useCallback(
    (rootShelfId: UUID) => {
      const permission = getRootShelfPermission(rootShelfId);
      return (
        permission === AccessControlPermission.Owner ||
        permission === AccessControlPermission.Admin
      );
    },
    [getRootShelfPermission]
  );

  const canTransferRootShelfOwnership = useCallback(
    (rootShelfId: UUID) =>
      getRootShelfPermission(rootShelfId) === AccessControlPermission.Owner,
    [getRootShelfPermission]
  );

  const transferRootShelfOwnership = useCallback(
    async (rootShelfId: UUID, targetUserPublicId: UUID) => {
      await transferRootShelfOwnershipMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        param: { rootShelfId },
        body: { targetUserPublicId },
      });
      const summary = expandedShelvesRef.current.get(rootShelfId);
      if (summary) summary.root.permission = AccessControlPermission.Admin;
      forceUpdate();
    },
    [expandedShelvesRef, forceUpdate, transferRootShelfOwnershipMutator]
  );

  const leaveRootShelf = useCallback(
    async (rootShelfId: UUID, targetUserPublicId?: UUID) => {
      await leaveRootShelfMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        param: { rootShelfId },
        body: targetUserPublicId ? { targetUserPublicId } : {},
      });
      removeRootShelfOptimistically(rootShelfId);
    },
    [leaveRootShelfMutator, removeRootShelfOptimistically]
  );

  return {
    rootShelfEdges:
      (data?.searchRootShelves?.searchEdges as SearchRootShelfEdge[]) || [],
    searchRootShelvesInput: searchInput,
    setSearchRootShelvesInput: setSearchInput,
    searchRootShelves: searchRootShelves,
    loadMoreRootShelves: loadMoreRootShelves,
    isFetching: loading,
    expandRootShelf: expandRootShelf,
    toggleRootShelf: toggleRootShelf,
    createRootShelf: createRootShelf,
    editRootShelfName: editRootShelfName,
    setEditRootShelfName: setEditRootShelfName,
    isNewRootShelfName: isNewRootShelfName,
    isRootShelfNodeEditing: isRootShelfNodeEditing,
    isAnyRootShelfNodeEditing: editingRootShelfNode !== undefined,
    startRenamingRootShelfNode: startRenamingRootShelfNode,
    cancelRenamingRootShelfNode: cancelRenamingRootShelfNode,
    renameEditingRootShelf: renameEditingRootShelf,
    deleteRootShelf: deleteRootShelf,
    removeRootShelfOptimistically: removeRootShelfOptimistically,
    getRootShelfPermission,
    canDeleteRootShelf,
    canTransferRootShelfOwnership,
    transferRootShelfOwnership,
    leaveRootShelf,
  };
};
