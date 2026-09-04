import {
  SupportedIcon as GraphQLSupportedIcon,
  SearchSortOrder,
  SearchStationSortBy,
} from "@shared/api/graphql/generated/graphql";
import {
  AccessControlPermission,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import type { UpdateMyStationByIdRequest } from "@shared/api/interfaces/station.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useEffect, useState } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSearchStationsLazyQuery } from "@/api/graphql/hooks/useSearchStations";
import {
  useCreateStation,
  useDeleteMyStationById,
  useLeaveMyStation,
  useTransferMyStationOwnership,
  useUpdateMyStationById,
} from "@/api/hooks/station.hook";

interface UseStationLogicProps {
  inputRef: RefObject<HTMLInputElement | null>;
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  routineTagsRef: RefObject<LRUCache<UUID, RoutineTagNode>>;
  forceUpdate: () => void;
  expandRoutinesByStationId: (stationId: UUID) => Promise<void>;
  getMyRoutineTasksByRoutineIds: (routineIds: UUID[]) => Promise<unknown>;
  selectedRoutineId: UUID | null;
  selectRoutine: (routineId: UUID | null) => void;
}

export const useStationLogic = ({
  inputRef,
  stationsRef,
  routineTagsRef,
  forceUpdate,
  expandRoutinesByStationId,
  getMyRoutineTasksByRoutineIds,
  selectedRoutineId,
  selectRoutine,
}: UseStationLogicProps) => {
  const createStationMutator = useCreateStation();
  const deleteStationMutator = useDeleteMyStationById();
  const updateStationMutator = useUpdateMyStationById();
  const leaveStationMutator = useLeaveMyStation();
  const transferStationOwnershipMutator = useTransferMyStationOwnership();

  const [selectedStationId, selectStation] = useState<UUID | null>(null);
  const [editingStationNode, setEditingStationNode] =
    useState<StationNode | null>(null);
  const [editStationName, setEditStationName] = useState<string>("");
  const [originalStationName, setOriginalStationName] = useState<string>("");
  const [searchStationsInput, setSearchStationsInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });

  const [
    executeSearch,
    {
      data: searchStationsData,
      loading: isSearchingStations,
      fetchMore: fetchMoreStations,
    },
  ] = useSearchStationsLazyQuery();

  const toggleStation = useCallback(
    async (stationId: UUID, reset: boolean = false) => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      if (reset || stationNode.isOpen) {
        stationNode.isOpen = false;
        forceUpdate();
        return;
      }

      stationNode.isOpen = true;
      forceUpdate();
      if (!stationNode.isExpanded) {
        await expandRoutinesByStationId(stationId);
        await getMyRoutineTasksByRoutineIds(
          stationNode.routines.map(routine => routine.id)
        );
        stationNode.isExpanded = true;
        forceUpdate();
      }
    },
    [
      expandRoutinesByStationId,
      forceUpdate,
      getMyRoutineTasksByRoutineIds,
      stationsRef,
    ]
  );

  const createStation = useCallback(
    async (
      name: string,
      description: string = "",
      icon: SupportedIcon | null = null,
      headerBackgroundURL: string | null = null
    ): Promise<StationNode> => {
      const response = await createStationMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          name,
          description,
          icon,
          headerBackgroundURL,
        },
      });
      if (response.success === false) throw response.exception;

      const stationNode: StationNode = {
        id: response.data.id as UUID,
        name,
        description,
        icon,
        headerBackgroundURL,
        permission: AccessControlPermission.Owner,
        routineCount: 0,
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
        isOpen: false,
        isExpanded: true,
        routines: [],
        routineTasks: [],
      };
      stationsRef.current.set(stationNode.id, stationNode);
      forceUpdate();
      return stationNode;
    },
    [createStationMutator, forceUpdate, stationsRef]
  );

  const upsertStationNode = useCallback(
    (stationNode: StationNode): StationNode => {
      const existingStation = stationsRef.current.get(stationNode.id);
      if (existingStation) {
        Object.assign(existingStation, {
          ...stationNode,
          isOpen: existingStation.isOpen,
          isExpanded: existingStation.isExpanded,
          routines: existingStation.routines,
          routineTasks: existingStation.routineTasks,
        });
      } else {
        stationsRef.current.set(stationNode.id, stationNode);
      }

      forceUpdate();
      return existingStation ?? stationNode;
    },
    [forceUpdate, stationsRef]
  );

  const updateStation = useCallback(
    async (
      stationId: UUID,
      values: UpdateMyStationByIdRequest["body"]["values"],
      setNull?: UpdateMyStationByIdRequest["body"]["setNull"]
    ): Promise<StationNode> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");
      const response = await updateStationMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          stationId,
          values,
          setNull,
        },
      });
      if (response.success === false) throw response.exception;

      Object.assign(stationNode, values);
      if (setNull?.icon) stationNode.icon = null;
      if (setNull?.headerBackgroundURL) {
        stationNode.headerBackgroundURL = null;
      }
      stationNode.updatedAt = response.data.updatedAt;
      forceUpdate();
      return stationNode;
    },
    [forceUpdate, stationsRef, updateStationMutator]
  );

  const removeStationOptimistically = useCallback(
    (stationId: UUID) => {
      const stationNode = stationsRef.current.get(stationId);
      if (stationNode) {
        const deletedRoutineIds = new Set(
          stationNode.routines.map(routine => routine.id)
        );
        for (const routineTagNode of routineTagsRef.current.values()) {
          const previousRoutineCount = routineTagNode.routines.length;
          routineTagNode.routines = routineTagNode.routines.filter(
            routine => !deletedRoutineIds.has(routine.id)
          );
          routineTagNode.routineCount = Math.max(
            0,
            routineTagNode.routineCount -
              (previousRoutineCount - routineTagNode.routines.length)
          );
        }
      }

      stationsRef.current.delete(stationId);
      if (selectedStationId === stationId) selectStation(null);
      if (
        stationNode?.routines.some(routine => routine.id === selectedRoutineId)
      ) {
        selectRoutine(null);
      }
      forceUpdate();
    },
    [
      forceUpdate,
      routineTagsRef,
      selectRoutine,
      selectedRoutineId,
      selectedStationId,
      stationsRef,
    ]
  );

  const deleteStation = useCallback(
    async (stationId: UUID) => {
      const response = await deleteStationMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: { stationId },
      });
      if (response.success === false) throw response.exception;
      removeStationOptimistically(stationId);
      return response;
    },
    [deleteStationMutator, removeStationOptimistically]
  );

  const canDeleteStation = useCallback(
    (stationId: UUID) => {
      const permission = stationsRef.current.get(stationId)?.permission;
      return (
        permission === AccessControlPermission.Owner ||
        permission === AccessControlPermission.Admin
      );
    },
    [stationsRef]
  );

  const canTransferStationOwnership = useCallback(
    (stationId: UUID) =>
      stationsRef.current.get(stationId)?.permission ===
      AccessControlPermission.Owner,
    [stationsRef]
  );

  const transferStationOwnership = useCallback(
    async (stationId: UUID, targetUserPublicId: UUID) => {
      await transferStationOwnershipMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        param: { stationId },
        body: { targetUserPublicId },
      });
      const station = stationsRef.current.get(stationId);
      if (station) station.permission = AccessControlPermission.Admin;
      forceUpdate();
    },
    [forceUpdate, stationsRef, transferStationOwnershipMutator]
  );

  const leaveStation = useCallback(
    async (stationId: UUID, targetUserPublicId?: UUID) => {
      await leaveStationMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        param: { stationId },
        body: targetUserPublicId ? { targetUserPublicId } : {},
      });
      removeStationOptimistically(stationId);
    },
    [leaveStationMutator, removeStationOptimistically]
  );

  const isStationEditing = useCallback(
    (stationId: UUID) =>
      !!editingStationNode && editingStationNode.id === stationId,
    [editingStationNode]
  );

  const isNewStationName = useCallback(
    () =>
      editStationName.trim().length > 0 &&
      editStationName.trim() !== originalStationName,
    [editStationName, originalStationName]
  );

  const startRenamingStation = useCallback((stationNode: StationNode) => {
    setEditingStationNode(stationNode);
    setOriginalStationName(stationNode.name);
    setEditStationName(stationNode.name);
  }, []);

  const cancelRenamingStation = useCallback(() => {
    setEditingStationNode(null);
    setOriginalStationName("");
    setEditStationName("");
  }, []);

  const renameEditingStation = useCallback(async (): Promise<void> => {
    if (!editingStationNode) return;

    try {
      if (!isNewStationName()) return;

      const name = editStationName.trim();
      await updateStation(editingStationNode.id, { name });
    } finally {
      setEditingStationNode(null);
      setOriginalStationName("");
      setEditStationName("");
    }
  }, [editStationName, editingStationNode, isNewStationName, updateStation]);

  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingStationNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingStation();
      }
    };

    if (editingStationNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingStationNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingStationNode, renameEditingStation]);

  const mergeSearchedStations = useCallback(
    (
      searchEdges: Array<{
        node?: unknown;
      } | null>
    ): void => {
      for (const edge of searchEdges) {
        if (!edge?.node) continue;

        const node = edge.node as unknown as {
          id: UUID;
          name: string;
          icon: GraphQLSupportedIcon | null;
          headerBackgroundURL: string | null;
          permission: AccessControlPermission;
          routineCount: number;
          deletedAt: Date | string | number | null;
          updatedAt: Date | string | number;
          createdAt: Date | string | number;
        };
        const existingStation = stationsRef.current.get(node.id);
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

        stationsRef.current.set(node.id, {
          id: node.id,
          name: node.name,
          description: existingStation?.description ?? "",
          icon,
          headerBackgroundURL: node.headerBackgroundURL,
          permission: node.permission as unknown as AccessControlPermission,
          routineCount: node.routineCount,
          deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt),
          updatedAt: new Date(node.updatedAt),
          createdAt: new Date(node.createdAt),
          isOpen: existingStation?.isOpen ?? false,
          isExpanded: existingStation?.isExpanded ?? false,
          routines: existingStation?.routines ?? [],
          routineTasks: existingStation?.routineTasks ?? [],
        });
      }
      if (searchEdges.length > 0) forceUpdate();
    },
    [forceUpdate, stationsRef]
  );

  useEffect(() => {
    mergeSearchedStations(
      searchStationsData?.searchStations?.searchEdges ?? []
    );
  }, [mergeSearchedStations, searchStationsData]);

  const searchStations = useCallback(
    async (query: string = searchStationsInput.query): Promise<void> => {
      const result = await executeSearch({
        variables: {
          input: {
            query,
            first: MaxSearchLimit,
            sortBy: SearchStationSortBy.Name,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }).retain();
      mergeSearchedStations(result.data?.searchStations?.searchEdges ?? []);
    },
    [executeSearch, mergeSearchedStations, searchStationsInput.query]
  );

  const loadMoreStations = useCallback(async (): Promise<void> => {
    const connection = searchStationsData?.searchStations;
    const pageInfo = connection?.searchPageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endEncodedSearchCursor) return;

    await fetchMoreStations({
      variables: {
        input: {
          query: searchStationsInput.query,
          first: MaxSearchLimit,
          after: pageInfo.endEncodedSearchCursor,
          sortBy: SearchStationSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
      updateQuery: (previousData, { fetchMoreResult }) => ({
        ...fetchMoreResult,
        searchStations: {
          ...fetchMoreResult.searchStations,
          searchEdges: [
            ...(previousData.searchStations?.searchEdges ?? []),
            ...(fetchMoreResult.searchStations?.searchEdges ?? []),
          ],
        },
      }),
    });
  }, [fetchMoreStations, searchStationsData, searchStationsInput.query]);

  return {
    selectedStationId,
    selectStation,
    editStationName,
    setEditStationName,
    isStationEditing,
    isAnyStationEditing: editingStationNode !== null,
    isNewStationName,
    startRenamingStation,
    cancelRenamingStation,
    renameEditingStation,
    searchStationsInput,
    setSearchStationsInput,
    executeSearchStations: executeSearch,
    searchStationsData,
    isSearchingStations,
    fetchMoreStations,
    searchStations,
    loadMoreStations,
    toggleStation,
    createStation,
    upsertStationNode,
    isCreatingStation: createStationMutator.isPending,
    updateStation,
    isUpdatingStation: updateStationMutator.isPending,
    deleteStation,
    canDeleteStation,
    canTransferStationOwnership,
    transferStationOwnership,
    leaveStation,
    removeStationOptimistically,
    isDeletingStation: deleteStationMutator.isPending,
  };
};
