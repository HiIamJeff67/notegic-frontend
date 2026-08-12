import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import {
  SupportedIcon as GraphQLSupportedIcon,
  SearchRoutineTagSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTagsLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutineTags";
import {
  useCreateRoutineTag,
  useHardDeleteMyRoutineTagById,
  useUpdateMyRoutineTagById,
} from "@shared/api/hooks/routineTag.hook";
import { SupportedIcon } from "@shared/api/interfaces/enums";
import type { UpdateMyRoutineTagByIdRequest } from "@shared/api/interfaces/routineTag.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useEffect, useState } from "react";

interface UseRoutineTagLogicProps {
  inputRef: RefObject<HTMLInputElement | null>;
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  routineTagsRef: RefObject<LRUCache<UUID, RoutineTagNode>>;
  forceUpdate: () => void;
  expandRoutinesByTagId: (routineTagId: UUID) => Promise<void>;
}

export const useRoutineTagLogic = ({
  inputRef,
  stationsRef,
  routineTagsRef,
  forceUpdate,
  expandRoutinesByTagId,
}: UseRoutineTagLogicProps) => {
  const createRoutineTagMutator = useCreateRoutineTag();
  const hardDeleteRoutineTagMutator = useHardDeleteMyRoutineTagById();
  const updateRoutineTagMutator = useUpdateMyRoutineTagById();

  const [selectedRoutineTagId, selectRoutineTag] = useState<UUID | null>(null);
  const [editingRoutineTagNode, setEditingRoutineTagNode] =
    useState<RoutineTagNode | null>(null);
  const [originalRoutineTagName, setOriginalRoutineTagName] =
    useState<string>("");
  const [editRoutineTagName, setEditRoutineTagName] = useState<string>("");
  const [searchRoutineTagsInput, setSearchRoutineTagsInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });

  const [
    executeSearch,
    {
      data: searchRoutineTagsData,
      loading: isSearchingRoutineTags,
      fetchMore: fetchMoreRoutineTags,
    },
  ] = useSearchRoutineTagsLazyQuery();

  const toggleRoutineTag = useCallback(
    async (routineTagId: UUID, reset = false) => {
      const routineTagNode = routineTagsRef.current.get(routineTagId);
      if (!routineTagNode) throw new Error("routine tag does not exist");

      if (reset || routineTagNode.isOpen) {
        routineTagNode.isOpen = false;
        forceUpdate();
        return;
      }

      routineTagNode.isOpen = true;
      forceUpdate();
      if (!routineTagNode.isExpanded) {
        await expandRoutinesByTagId(routineTagId);
        routineTagNode.isExpanded = true;
        forceUpdate();
      }
    },
    [expandRoutinesByTagId, forceUpdate, routineTagsRef]
  );

  const createRoutineTag = useCallback(
    async (
      name: string,
      color: string,
      icon: SupportedIcon | null
    ): Promise<RoutineTagNode> => {
      const response = await createRoutineTagMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          name,
          color,
          icon,
        },
      });
      if (response.success === false) throw response.exception;

      const routineTagNode: RoutineTagNode = {
        id: response.data.id as UUID,
        name,
        color,
        icon,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
        routines: [],
        routineCount: 0,
        isOpen: false,
        isExpanded: true,
      };
      routineTagsRef.current.set(routineTagNode.id, routineTagNode);
      forceUpdate();
      return routineTagNode;
    },
    [createRoutineTagMutator, forceUpdate, routineTagsRef]
  );

  const duplicateRoutineTag = useCallback(
    async (routineTagId: UUID): Promise<RoutineTagNode> => {
      const routineTagNode = routineTagsRef.current.get(routineTagId);
      if (!routineTagNode) throw new Error("routine tag does not exist");

      return await createRoutineTag(
        `${routineTagNode.name} Copy`,
        routineTagNode.color,
        routineTagNode.icon
      );
    },
    [createRoutineTag, routineTagsRef]
  );

  const upsertRoutineTagNode = useCallback(
    (routineTagNode: RoutineTagNode): RoutineTagNode => {
      const existingRoutineTag = routineTagsRef.current.get(routineTagNode.id);
      if (existingRoutineTag) {
        Object.assign(existingRoutineTag, {
          ...routineTagNode,
          isOpen: existingRoutineTag.isOpen,
          isExpanded: existingRoutineTag.isExpanded,
          routines: existingRoutineTag.routines,
          routineCount: existingRoutineTag.routineCount,
        });
      } else {
        routineTagsRef.current.set(routineTagNode.id, routineTagNode);
      }

      forceUpdate();
      return existingRoutineTag ?? routineTagNode;
    },
    [forceUpdate, routineTagsRef]
  );

  const updateRoutineTag = useCallback(
    async (
      routineTagId: UUID,
      values: UpdateMyRoutineTagByIdRequest["body"]["values"],
      setNull?: UpdateMyRoutineTagByIdRequest["body"]["setNull"]
    ): Promise<RoutineTagNode> => {
      const routineTagNode = routineTagsRef.current.get(routineTagId);
      if (!routineTagNode) throw new Error("routine tag does not exist");
      const response = await updateRoutineTagMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          routineTagId,
          values,
          setNull,
        },
      });
      if (response.success === false) throw response.exception;

      Object.assign(routineTagNode, values);
      if (setNull?.icon) routineTagNode.icon = null;
      routineTagNode.updatedAt = response.data.updatedAt;
      forceUpdate();
      return routineTagNode;
    },
    [forceUpdate, routineTagsRef, updateRoutineTagMutator]
  );

  const hardDeleteRoutineTag = useCallback(
    async (routineTagId: UUID) => {
      const response = await hardDeleteRoutineTagMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          routineTagId,
        },
      });
      if (response.success === false) throw response.exception;

      for (const stationNode of stationsRef.current.values()) {
        for (const routineNode of stationNode.routines) {
          routineNode.routineTagIds = routineNode.routineTagIds.filter(
            id => id !== routineTagId
          );
        }
      }
      for (const routineTagNode of routineTagsRef.current.values()) {
        for (const routineNode of routineTagNode.routines) {
          routineNode.routineTagIds = routineNode.routineTagIds.filter(
            id => id !== routineTagId
          );
        }
      }
      routineTagsRef.current.delete(routineTagId);
      if (selectedRoutineTagId === routineTagId) selectRoutineTag(null);
      forceUpdate();
      return response;
    },
    [
      forceUpdate,
      hardDeleteRoutineTagMutator,
      routineTagsRef,
      selectedRoutineTagId,
      stationsRef,
    ]
  );

  const isRoutineTagEditing = useCallback(
    (routineTagId: UUID) => editingRoutineTagNode?.id === routineTagId,
    [editingRoutineTagNode]
  );

  const isNewRoutineTagName = useCallback(
    () =>
      editRoutineTagName.trim().length > 0 &&
      editRoutineTagName.trim() !== originalRoutineTagName,
    [editRoutineTagName, originalRoutineTagName]
  );

  const startRenamingRoutineTag = useCallback(
    (routineTagNode: RoutineTagNode) => {
      setEditingRoutineTagNode(routineTagNode);
      setOriginalRoutineTagName(routineTagNode.name);
      setEditRoutineTagName(routineTagNode.name);
    },
    []
  );

  const cancelRenamingRoutineTag = useCallback(() => {
    setEditingRoutineTagNode(null);
    setOriginalRoutineTagName("");
    setEditRoutineTagName("");
  }, []);

  const renameEditingRoutineTag = useCallback(async (): Promise<void> => {
    if (!editingRoutineTagNode) return;

    try {
      if (!isNewRoutineTagName()) return;

      const name = editRoutineTagName.trim();
      await updateRoutineTag(editingRoutineTagNode.id, { name });
    } finally {
      setEditingRoutineTagNode(null);
      setOriginalRoutineTagName("");
      setEditRoutineTagName("");
    }
  }, [
    editRoutineTagName,
    editingRoutineTagNode,
    isNewRoutineTagName,
    updateRoutineTag,
  ]);

  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingRoutineTagNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingRoutineTag();
      }
    };

    if (editingRoutineTagNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingRoutineTagNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingRoutineTagNode, renameEditingRoutineTag]);

  const mergeSearchedRoutineTags = useCallback(
    (searchEdges: Array<{ node?: unknown } | null> = []) => {
      for (const edge of searchEdges) {
        if (!edge?.node) continue;

        const node = edge.node as unknown as {
          id: UUID;
          name: string;
          color: string;
          icon: GraphQLSupportedIcon | null;
          updatedAt: Date | string | number;
          createdAt: Date | string | number;
        };
        const existingRoutineTag = routineTagsRef.current.get(node.id);
        const icon = (() => {
          switch (node.icon) {
            case GraphQLSupportedIcon.SupportedIconBooks:
              return SupportedIcon.Books;
            case GraphQLSupportedIcon.SupportedIconCalendar:
              return SupportedIcon.Calendar;
            case GraphQLSupportedIcon.SupportedIconCheckMark:
              return SupportedIcon.CheckMark;
            case GraphQLSupportedIcon.SupportedIconClock:
              return SupportedIcon.Clock;
            case GraphQLSupportedIcon.SupportedIconFire:
              return SupportedIcon.Fire;
            case GraphQLSupportedIcon.SupportedIconFolderOpen:
              return SupportedIcon.FolderOpen;
            case GraphQLSupportedIcon.SupportedIconGrinningFace:
              return SupportedIcon.GrinningFace;
            case GraphQLSupportedIcon.SupportedIconLightbulb:
              return SupportedIcon.Lightbulb;
            case GraphQLSupportedIcon.SupportedIconNotebook:
              return SupportedIcon.Notebook;
            case GraphQLSupportedIcon.SupportedIconPencilPaper:
              return SupportedIcon.PencilPaper;
            case GraphQLSupportedIcon.SupportedIconPin:
              return SupportedIcon.Pin;
            case GraphQLSupportedIcon.SupportedIconRedHeart:
              return SupportedIcon.RedHeart;
            case GraphQLSupportedIcon.SupportedIconRocket:
              return SupportedIcon.Rocket;
            case GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes:
              return SupportedIcon.SmilingFaceWithSmilingEyes;
            case GraphQLSupportedIcon.SupportedIconStar:
              return SupportedIcon.Star;
            default:
              return null;
          }
        })();
        routineTagsRef.current.set(node.id, {
          id: node.id,
          name: node.name,
          color: node.color,
          icon,
          updatedAt: new Date(node.updatedAt),
          createdAt: new Date(node.createdAt),
          routines: existingRoutineTag?.routines ?? [],
          routineCount: existingRoutineTag?.routineCount ?? 0,
          isOpen: existingRoutineTag?.isOpen ?? false,
          isExpanded: existingRoutineTag?.isExpanded ?? false,
        });
      }
      if (searchEdges.length > 0) forceUpdate();
    },
    [forceUpdate, routineTagsRef]
  );

  useEffect(() => {
    mergeSearchedRoutineTags(
      searchRoutineTagsData?.searchRoutineTags?.searchEdges ?? []
    );
  }, [mergeSearchedRoutineTags, searchRoutineTagsData]);

  const searchRoutineTags = useCallback(async (): Promise<void> => {
    const result = await executeSearch({
      variables: {
        input: {
          query: searchRoutineTagsInput.query,
          first: MaxSearchLimit,
          sortBy: SearchRoutineTagSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
    }).retain();
    mergeSearchedRoutineTags(result.data?.searchRoutineTags.searchEdges ?? []);
  }, [executeSearch, mergeSearchedRoutineTags, searchRoutineTagsInput.query]);

  const loadMoreRoutineTags = useCallback(async (): Promise<void> => {
    const connection = searchRoutineTagsData?.searchRoutineTags;
    const pageInfo = connection?.searchPageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endEncodedSearchCursor) return;

    await fetchMoreRoutineTags({
      variables: {
        input: {
          query: searchRoutineTagsInput.query,
          first: MaxSearchLimit,
          after: pageInfo.endEncodedSearchCursor,
          sortBy: SearchRoutineTagSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
      updateQuery: (previousData, { fetchMoreResult }) => ({
        ...fetchMoreResult,
        searchRoutineTags: {
          ...fetchMoreResult.searchRoutineTags,
          searchEdges: [
            ...(previousData.searchRoutineTags?.searchEdges ?? []),
            ...(fetchMoreResult.searchRoutineTags?.searchEdges ?? []),
          ],
        },
      }),
    });
  }, [
    fetchMoreRoutineTags,
    searchRoutineTagsData,
    searchRoutineTagsInput.query,
  ]);

  return {
    selectedRoutineTagId,
    selectRoutineTag,
    editRoutineTagName,
    setEditRoutineTagName,
    isRoutineTagEditing,
    isAnyRoutineTagEditing: editingRoutineTagNode !== null,
    isNewRoutineTagName,
    startRenamingRoutineTag,
    cancelRenamingRoutineTag,
    renameEditingRoutineTag,
    searchRoutineTagsInput,
    setSearchRoutineTagsInput,
    executeSearchRoutineTags: executeSearch,
    searchRoutineTagsData,
    isSearchingRoutineTags,
    fetchMoreRoutineTags,
    searchRoutineTags,
    loadMoreRoutineTags,
    expandRoutinesByTagId,
    toggleRoutineTag,
    createRoutineTag,
    duplicateRoutineTag,
    upsertRoutineTagNode,
    isCreatingRoutineTag: createRoutineTagMutator.isPending,
    updateRoutineTag,
    isUpdatingRoutineTag: updateRoutineTagMutator.isPending,
    hardDeleteRoutineTag,
    isHardDeletingRoutineTag: hardDeleteRoutineTagMutator.isPending,
  };
};
