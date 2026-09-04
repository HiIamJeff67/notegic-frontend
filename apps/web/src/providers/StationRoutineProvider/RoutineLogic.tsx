import { fromGraphQLRoutinePhase } from "@shared/api/graphql/conversions";
import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutinePhase as GraphQLRoutinePhase,
  RoutineStatus as GraphQLRoutineStatus,
  SearchRoutineSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import {
  ItemType,
  RoutinePeriod,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import type { UpdateMyRoutineByIdRequest } from "@shared/api/interfaces/routine.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useEffect, useState } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSearchRoutinesLazyQuery } from "@/api/graphql/hooks/useSearchRoutines";
import {
  useCreateRoutineByStationId,
  useDeleteMyRoutineById,
  useLinkRoutineItemById,
  useLinkRoutineTagById,
  useUpdateMyRoutineById,
} from "@/api/hooks/routine.hook";

interface UseRoutineLogicProps {
  inputRef: RefObject<HTMLInputElement | null>;
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  routineTagsRef: RefObject<LRUCache<UUID, RoutineTagNode>>;
  forceUpdate: () => void;
  getMyRoutineTasksByRoutineIds: (routineIds: UUID[]) => Promise<unknown>;
}

export const useRoutineLogic = ({
  inputRef,
  stationsRef,
  routineTagsRef,
  forceUpdate,
  getMyRoutineTasksByRoutineIds,
}: UseRoutineLogicProps) => {
  const createRoutineMutator = useCreateRoutineByStationId();
  const deleteRoutineMutator = useDeleteMyRoutineById();
  const updateRoutineMutator = useUpdateMyRoutineById();
  const linkRoutineTagMutator = useLinkRoutineTagById();
  const linkRoutineItemMutator = useLinkRoutineItemById();

  const [selectedRoutineId, selectRoutine] = useState<UUID | null>(null);
  const [editingRoutineNode, setEditingRoutineNode] =
    useState<RoutineNode | null>(null);
  const [originalRoutineTitle, setOriginalRoutineTitle] = useState<string>("");
  const [editRoutineTitle, setEditRoutineTitle] = useState<string>("");

  const [
    executeSearch,
    {
      data: searchRoutinesData,
      loading: isSearchingRoutines,
      variables: searchRoutinesVariables,
      fetchMore: fetchMoreRoutines,
    },
  ] = useSearchRoutinesLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const searchRoutines = useCallback(
    async (
      query: string = "",
      stationIds: UUID[] = [],
      after?: string,
      tagIds: UUID[] = [],
      first: number = MaxSearchLimit
    ): Promise<{
      hasNextPage: boolean;
      endEncodedSearchCursor: string | null;
      routineIds: UUID[];
      routines: RoutineNode[];
      totalCount: number;
    }> => {
      const result = await executeSearch({
        variables: {
          input: {
            query,
            after,
            first,
            stationIds,
            tagIds,
            sortBy: SearchRoutineSortBy.Title,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }).retain();
      const searchEdges = result.data?.searchRoutines.searchEdges ?? [];
      const searchedRoutinesByStationId = new Map<UUID, RoutineNode[]>();
      const searchedRoutineIds: UUID[] = [];
      const searchedRoutines: RoutineNode[] = [];

      for (const edge of searchEdges) {
        const node = edge.node as unknown as {
          id: UUID;
          stationId: UUID;
          title: string;
          status: GraphQLRoutineStatus;
          phase?: GraphQLRoutinePhase | null;
          isPinned: boolean;
          scheduledStartAt: Date | string | number;
          scheduledEndAt: Date | string | number;
          period: GraphQLRoutinePeriod | null;
          timezone: string;
          deletedAt: Date | string | number | null;
          updatedAt: Date | string | number;
          createdAt: Date | string | number;
          tagIds?: UUID[];
          taskIds?: UUID[];
          itemIds?: UUID[];
        };

        const stationNode = stationsRef.current.get(node.stationId);

        const existingRoutine = stationNode?.routines.find(
          routine => routine.id === node.id
        );
        const routineTagIds = [...(node.tagIds ?? [])];
        for (const tagId of tagIds) {
          if (!routineTagIds.includes(tagId)) routineTagIds.push(tagId);
        }
        const routineTaskIds = node.taskIds ?? [];
        const routineItemIds = node.itemIds ?? [];
        const routineTasks = routineTaskIds.flatMap(taskId => {
          for (const cachedStationNode of stationsRef.current.values()) {
            const routineTaskNode = cachedStationNode.routineTasks.find(
              routineTask => routineTask.id === taskId
            );
            if (routineTaskNode) return [routineTaskNode];
          }
          return [];
        });
        const routineNode: RoutineNode = {
          id: node.id,
          stationId: node.stationId,
          title: node.title,
          description: existingRoutine?.description ?? "",
          status:
            node.status === GraphQLRoutineStatus.RoutineStatusCompleted
              ? RoutineStatus.Completed
              : node.status === GraphQLRoutineStatus.RoutineStatusInProgress
                ? RoutineStatus.InProgress
                : node.status === GraphQLRoutineStatus.RoutineStatusOverDue
                  ? RoutineStatus.OverDue
                  : RoutineStatus.Scheduled,
          phase: fromGraphQLRoutinePhase(node.phase),
          isPinned: node.isPinned,
          scheduledStartAt: new Date(node.scheduledStartAt),
          scheduledEndAt: new Date(node.scheduledEndAt),
          period:
            node.period === GraphQLRoutinePeriod.RoutinePeriodDaily
              ? RoutinePeriod.Daily
              : node.period === GraphQLRoutinePeriod.RoutinePeriodWeekly
                ? RoutinePeriod.Weekly
                : node.period === GraphQLRoutinePeriod.RoutinePeriodMonthly
                  ? RoutinePeriod.Monthly
                  : null,
          timezone: node.timezone,
          deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt),
          updatedAt: new Date(node.updatedAt),
          createdAt: new Date(node.createdAt),
          isOpen: existingRoutine?.isOpen ?? false,
          isExpanded:
            existingRoutine?.isExpanded ??
            routineTasks.length >= routineTaskIds.length,
          routineTagIds,
          routineTaskIds,
          itemIds: routineItemIds,
          routineTasks,
        };

        if (existingRoutine) {
          Object.assign(existingRoutine, routineNode);
        }
        const currentRoutine = existingRoutine ?? routineNode;
        searchedRoutineIds.push(currentRoutine.id);
        searchedRoutines.push(currentRoutine);

        if (stationNode) {
          const stationRoutines =
            searchedRoutinesByStationId.get(node.stationId) ?? [];
          stationRoutines.push(currentRoutine);
          searchedRoutinesByStationId.set(node.stationId, stationRoutines);
        }

        for (const routineTagId of routineTagIds) {
          const routineTagNode = routineTagsRef.current.get(routineTagId);
          if (!routineTagNode) continue;
          const wasLinked = routineTagNode.routines.some(
            routine => routine.id === currentRoutine.id
          );
          if (!wasLinked) {
            routineTagNode.routines.push(currentRoutine);
            routineTagNode.routines.sort((leftRoutine, rightRoutine) =>
              leftRoutine.title.localeCompare(rightRoutine.title)
            );
          }
          if (tagIds.length === 0 && !wasLinked) {
            routineTagNode.routineCount++;
          }
        }
      }

      for (const [
        searchedStationId,
        searchedRoutines,
      ] of searchedRoutinesByStationId) {
        const stationNode = stationsRef.current.get(searchedStationId);
        if (!stationNode) continue;

        if (stationIds.includes(searchedStationId) && after === undefined) {
          stationNode.routines = [
            ...searchedRoutines,
            ...stationNode.routines.filter(
              routine =>
                !searchedRoutines.some(
                  searchedRoutine => searchedRoutine.id === routine.id
                )
            ),
          ];
        } else {
          for (const searchedRoutine of searchedRoutines) {
            if (
              !stationNode.routines.some(
                routine => routine.id === searchedRoutine.id
              )
            ) {
              stationNode.routines.push(searchedRoutine);
            }
          }
        }
        stationNode.routines.sort((leftRoutine, rightRoutine) =>
          leftRoutine.title.localeCompare(rightRoutine.title)
        );
        if (stationIds.length === 1 && stationIds[0] === searchedStationId) {
          stationNode.routineCount =
            result.data?.searchRoutines.totalCount ?? searchedRoutines.length;
        }
      }

      if (tagIds.length === 1) {
        const tagId = tagIds[0];
        const routineTagNode = routineTagsRef.current.get(tagId);
        if (routineTagNode) {
          const searchedRoutines = Array.from(
            searchedRoutinesByStationId.values()
          ).flat();
          routineTagNode.routines =
            after === undefined
              ? searchedRoutines
              : [
                  ...routineTagNode.routines.filter(
                    routine =>
                      !searchedRoutines.some(
                        searchedRoutine => searchedRoutine.id === routine.id
                      )
                  ),
                  ...searchedRoutines,
                ];
          routineTagNode.routines.sort((leftRoutine, rightRoutine) =>
            leftRoutine.title.localeCompare(rightRoutine.title)
          );
          routineTagNode.routineCount =
            result.data?.searchRoutines.totalCount ?? searchedRoutines.length;
        }
      }
      forceUpdate();
      return {
        hasNextPage:
          result.data?.searchRoutines.searchPageInfo.hasNextPage ?? false,
        endEncodedSearchCursor:
          result.data?.searchRoutines.searchPageInfo.endEncodedSearchCursor ??
          null,
        routineIds: searchedRoutineIds,
        routines: searchedRoutines,
        totalCount:
          result.data?.searchRoutines.totalCount ?? searchedRoutineIds.length,
      };
    },
    [executeSearch, forceUpdate, routineTagsRef, stationsRef]
  );

  const loadMoreRoutines = useCallback(async (): Promise<void> => {
    const connection = searchRoutinesData?.searchRoutines;
    const pageInfo = connection?.searchPageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo.endEncodedSearchCursor) return;

    const input = searchRoutinesVariables?.input;
    await searchRoutines(
      input?.query ?? "",
      (input?.stationIds ?? []) as UUID[],
      pageInfo.endEncodedSearchCursor,
      (input?.tagIds ?? []) as UUID[]
    );
  }, [searchRoutines, searchRoutinesData, searchRoutinesVariables]);

  const expandRoutinesByStationId = useCallback(
    async (stationId: UUID): Promise<void> => {
      if (!stationsRef.current.has(stationId)) {
        throw new Error("station does not exist");
      }
      await searchRoutines("", [stationId]);
    },
    [searchRoutines, stationsRef]
  );

  const expandRoutinesByTagId = useCallback(
    async (tagId: UUID): Promise<void> => {
      if (!routineTagsRef.current.has(tagId)) {
        throw new Error("routine tag does not exist");
      }
      await searchRoutines("", [], undefined, [tagId]);
    },
    [routineTagsRef, searchRoutines]
  );

  const toggleRoutine = useCallback(
    async (stationId: UUID, routineId: UUID, reset = false) => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");

      const routineNode = stationNode.routines.find(
        routine => routine.id === routineId
      );
      if (!routineNode) throw new Error("routine does not exist");

      if (reset || routineNode.isOpen) {
        routineNode.isOpen = false;
        forceUpdate();
        return;
      }

      if (!routineNode.isExpanded) {
        routineNode.isOpen = true;
        forceUpdate();
        if (routineNode.routineTaskIds.length > 0) {
          await getMyRoutineTasksByRoutineIds([routineId]);
        }
      }

      routineNode.routineTasks = routineNode.routineTaskIds
        .map(routineTaskId =>
          stationNode.routineTasks.find(
            routineTask => routineTask.id === routineTaskId
          )
        )
        .filter(
          (routineTask): routineTask is RoutineTaskNode =>
            routineTask !== undefined
        );
      routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );
      routineNode.isOpen = true;
      routineNode.isExpanded = true;
      forceUpdate();
    },
    [forceUpdate, getMyRoutineTasksByRoutineIds, stationsRef]
  );

  const createRoutine = useCallback(
    async (
      stationId: UUID,
      values: {
        title: string;
        description: string;
        isPinned?: boolean;
        scheduledStartAt?: Date;
        scheduledEndAt?: Date;
        period?: RoutinePeriod | null;
        timezone?: string;
      }
    ): Promise<RoutineNode> => {
      const stationNode = stationsRef.current.get(stationId);
      if (!stationNode) throw new Error("station does not exist");
      const response = await createRoutineMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          stationId,
          title: values.title,
          description: values.description,
          isPinned: values.isPinned,
          scheduledStartAt: values.scheduledStartAt,
          scheduledEndAt: values.scheduledEndAt,
          period: values.period,
          timezone: values.timezone,
        },
      });
      if (response.success === false) throw response.exception;

      const scheduledStartAt =
        values.scheduledStartAt ?? new Date(response.data.createdAt);
      const routineNode: RoutineNode = {
        id: response.data.id as UUID,
        stationId,
        title: values.title,
        description: values.description,
        status: RoutineStatus.Scheduled,
        phase: null,
        isPinned: values.isPinned ?? false,
        scheduledStartAt,
        scheduledEndAt:
          values.scheduledEndAt ??
          new Date(scheduledStartAt.getTime() + 60 * 60 * 1000),
        period: values.period ?? null,
        timezone:
          values.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
        isOpen: false,
        isExpanded: true,
        routineTagIds: [],
        routineTaskIds: [],
        itemIds: [],
        routineTasks: [],
      };
      stationNode.routines.push(routineNode);
      await searchRoutines("", [stationId]);
      forceUpdate();
      return routineNode;
    },
    [createRoutineMutator, forceUpdate, searchRoutines, stationsRef]
  );

  const upsertRoutineNode = useCallback(
    (routineNode: RoutineNode): RoutineNode => {
      const stationNode = stationsRef.current.get(routineNode.stationId);
      if (!stationNode) return routineNode;

      const existingRoutine = stationNode.routines.find(
        stationRoutine => stationRoutine.id === routineNode.id
      );
      if (existingRoutine) {
        Object.assign(existingRoutine, {
          ...routineNode,
          isOpen: existingRoutine.isOpen,
          isExpanded: existingRoutine.isExpanded,
        });
      } else {
        stationNode.routines.push(routineNode);
      }
      stationNode.routines.sort((leftRoutine, rightRoutine) =>
        leftRoutine.title.localeCompare(rightRoutine.title)
      );

      const persistedRoutine = existingRoutine ?? routineNode;
      for (const routineTagNode of routineTagsRef.current.values()) {
        routineTagNode.routines = routineTagNode.routines.filter(
          tagRoutine => tagRoutine.id !== persistedRoutine.id
        );
        if (persistedRoutine.routineTagIds.includes(routineTagNode.id)) {
          routineTagNode.routines.push(persistedRoutine);
          routineTagNode.routines.sort((leftRoutine, rightRoutine) =>
            leftRoutine.title.localeCompare(rightRoutine.title)
          );
        }
      }

      forceUpdate();
      return persistedRoutine;
    },
    [forceUpdate, routineTagsRef, stationsRef]
  );

  const deleteRoutine = useCallback(
    async (routineId: UUID) => {
      const response = await deleteRoutineMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          routineId,
        },
      });
      if (response.success === false) throw response.exception;

      let routineNode: RoutineNode | undefined;
      for (const stationNode of stationsRef.current.values()) {
        routineNode = stationNode.routines.find(
          routine => routine.id === routineId
        );
        if (routineNode) break;
      }
      if (!routineNode) {
        for (const routineTagNode of routineTagsRef.current.values()) {
          routineNode = routineTagNode.routines.find(
            routine => routine.id === routineId
          );
          if (routineNode) break;
        }
      }

      for (const stationNode of stationsRef.current.values()) {
        stationNode.routines = stationNode.routines.filter(
          routine => routine.id !== routineId
        );
      }
      for (const routineTagNode of routineTagsRef.current.values()) {
        const wasLinked =
          routineNode?.routineTagIds.includes(routineTagNode.id) ??
          routineTagNode.routines.some(routine => routine.id === routineId);
        routineTagNode.routines = routineTagNode.routines.filter(
          routine => routine.id !== routineId
        );
        if (wasLinked) {
          routineTagNode.routineCount = Math.max(
            0,
            routineTagNode.routineCount - 1
          );
        }
      }

      if (selectedRoutineId === routineId) selectRoutine(null);
      if (routineNode) await searchRoutines("", [routineNode.stationId]);
      forceUpdate();
      return response;
    },
    [
      deleteRoutineMutator,
      forceUpdate,
      routineTagsRef,
      searchRoutines,
      selectedRoutineId,
      stationsRef,
    ]
  );

  const updateRoutine = useCallback(
    async (
      routineId: UUID,
      values: UpdateMyRoutineByIdRequest["body"]["values"],
      setNull?: UpdateMyRoutineByIdRequest["body"]["setNull"]
    ): Promise<RoutineNode> => {
      const routineNodes = new Set<RoutineNode>();
      for (const stationNode of stationsRef.current.values()) {
        const routineNode = stationNode.routines.find(
          stationRoutine => stationRoutine.id === routineId
        );
        if (routineNode) routineNodes.add(routineNode);
      }
      for (const routineTagNode of routineTagsRef.current.values()) {
        const routineNode = routineTagNode.routines.find(
          routine => routine.id === routineId
        );
        if (routineNode) routineNodes.add(routineNode);
      }
      if (routineNodes.size === 0) throw new Error("routine does not exist");

      const snapshots = [...routineNodes].map(routineNode => ({
        routineNode,
        snapshot: { ...routineNode },
      }));
      for (const routineNode of routineNodes) {
        Object.assign(routineNode, values);
        if (setNull?.period) routineNode.period = null;
        routineNode.updatedAt = new Date();
      }
      forceUpdate();
      try {
        const response = await updateRoutineMutator.mutateAsync({
          header: getClientRequestHeaders(navigator.userAgent),
          body: {
            routineId,
            values,
            setNull,
          },
        });
        if (response.success === false) throw response.exception;

        for (const routineNode of routineNodes) {
          routineNode.updatedAt = response.data.updatedAt;
        }
        forceUpdate();
        return routineNodes.values().next().value as RoutineNode;
      } catch (error) {
        for (const { routineNode, snapshot } of snapshots) {
          Object.assign(routineNode, snapshot);
        }
        forceUpdate();
        throw error;
      }
    },
    [forceUpdate, routineTagsRef, stationsRef, updateRoutineMutator]
  );

  const isRoutineEditing = useCallback(
    (routineId: UUID) => editingRoutineNode?.id === routineId,
    [editingRoutineNode]
  );

  const isNewRoutineTitle = useCallback(
    () =>
      editRoutineTitle.trim().length > 0 &&
      editRoutineTitle.trim() !== originalRoutineTitle,
    [editRoutineTitle, originalRoutineTitle]
  );

  const startRenamingRoutine = useCallback((routineNode: RoutineNode) => {
    setEditingRoutineNode(routineNode);
    setOriginalRoutineTitle(routineNode.title);
    setEditRoutineTitle(routineNode.title);
  }, []);

  const cancelRenamingRoutine = useCallback(() => {
    setEditingRoutineNode(null);
    setOriginalRoutineTitle("");
    setEditRoutineTitle("");
  }, []);

  const renameEditingRoutine = useCallback(async (): Promise<void> => {
    if (!editingRoutineNode) return;

    try {
      if (!isNewRoutineTitle()) return;

      const title = editRoutineTitle.trim();
      await updateRoutine(editingRoutineNode.id, { title });
    } finally {
      setEditingRoutineNode(null);
      setOriginalRoutineTitle("");
      setEditRoutineTitle("");
    }
  }, [editRoutineTitle, editingRoutineNode, isNewRoutineTitle, updateRoutine]);

  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingRoutineNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingRoutine();
      }
    };

    if (editingRoutineNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingRoutineNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingRoutineNode, renameEditingRoutine]);

  const linkRoutineTag = useCallback(
    async (routineId: UUID, routineTagId: UUID, isUnlink = false) => {
      let routineNode: RoutineNode | undefined;
      for (const stationNode of stationsRef.current.values()) {
        const matchingRoutine = stationNode.routines.find(
          routine => routine.id === routineId
        );
        if (matchingRoutine) {
          routineNode = matchingRoutine;
          break;
        }
      }
      if (!routineNode) throw new Error("routine does not exist");

      const routineTagNode = routineTagsRef.current.get(routineTagId);
      const previousRoutineTagIds = [...routineNode.routineTagIds];
      const previousUpdatedAt = routineNode.updatedAt;
      const previousTagRoutines = routineTagNode
        ? [...routineTagNode.routines]
        : [];
      const previousTagRoutineCount = routineTagNode?.routineCount ?? 0;
      routineNode.routineTagIds = isUnlink
        ? routineNode.routineTagIds.filter(id => id !== routineTagId)
        : Array.from(new Set([...routineNode.routineTagIds, routineTagId]));
      routineNode.updatedAt = new Date();

      if (routineTagNode) {
        const wasLinked = routineTagNode.routines.some(
          routine => routine.id === routineId
        );
        routineTagNode.routines = isUnlink
          ? routineTagNode.routines.filter(routine => routine.id !== routineId)
          : [
              ...routineTagNode.routines.filter(
                routine => routine.id !== routineId
              ),
              routineNode,
            ];
        if (isUnlink && wasLinked) {
          routineTagNode.routineCount = Math.max(
            0,
            routineTagNode.routineCount - 1
          );
        } else if (!isUnlink && !wasLinked) {
          routineTagNode.routineCount++;
        }
      }
      forceUpdate();
      try {
        const response = await linkRoutineTagMutator.mutateAsync({
          header: getClientRequestHeaders(navigator.userAgent),
          body: {
            routineId,
            routineTagId,
            isUnlink,
          },
        });
        if (response.success === false) throw response.exception;

        routineNode.updatedAt = response.data.updatedAt;
        forceUpdate();
        return response;
      } catch (error) {
        routineNode.routineTagIds = previousRoutineTagIds;
        routineNode.updatedAt = previousUpdatedAt;
        if (routineTagNode) {
          routineTagNode.routines = previousTagRoutines;
          routineTagNode.routineCount = previousTagRoutineCount;
        }
        forceUpdate();
        throw error;
      }
    },
    [forceUpdate, linkRoutineTagMutator, routineTagsRef, stationsRef]
  );

  const linkRoutineItem = useCallback(
    async (
      routineId: UUID,
      itemId: UUID,
      itemType: ItemType,
      isUnlink = false
    ) => {
      const routineNodes: RoutineNode[] = [];
      for (const stationNode of stationsRef.current.values()) {
        const routineNode = stationNode.routines.find(
          routine => routine.id === routineId
        );
        if (routineNode) routineNodes.push(routineNode);
      }
      if (routineNodes.length === 0) throw new Error("routine does not exist");

      const snapshots = routineNodes.map(routineNode => ({
        routineNode,
        itemIds: [...routineNode.itemIds],
        updatedAt: routineNode.updatedAt,
      }));
      for (const routineNode of routineNodes) {
        routineNode.itemIds = isUnlink
          ? routineNode.itemIds.filter(id => id !== itemId)
          : Array.from(new Set([...routineNode.itemIds, itemId]));
        routineNode.updatedAt = new Date();
      }
      forceUpdate();
      try {
        const response = await linkRoutineItemMutator.mutateAsync({
          header: getClientRequestHeaders(navigator.userAgent),
          body: {
            routineId,
            itemId,
            itemType,
            isUnlink,
          },
        });
        if (response.success === false) throw response.exception;

        for (const routineNode of routineNodes) {
          routineNode.updatedAt = response.data.updatedAt;
        }
        forceUpdate();
        return response;
      } catch (error) {
        for (const snapshot of snapshots) {
          snapshot.routineNode.itemIds = snapshot.itemIds;
          snapshot.routineNode.updatedAt = snapshot.updatedAt;
        }
        forceUpdate();
        throw error;
      }
    },
    [forceUpdate, linkRoutineItemMutator, stationsRef]
  );

  const duplicateRoutine = useCallback(
    async (routineId: UUID): Promise<RoutineNode> => {
      let sourceRoutine: RoutineNode | undefined;
      for (const stationNode of stationsRef.current.values()) {
        sourceRoutine = stationNode.routines.find(
          routine => routine.id === routineId
        );
        if (sourceRoutine) break;
      }
      if (!sourceRoutine) throw new Error("routine does not exist");

      const duplicatedRoutine = await createRoutine(sourceRoutine.stationId, {
        title: `${sourceRoutine.title} Copy`,
        description: sourceRoutine.description,
        isPinned: sourceRoutine.isPinned,
        scheduledStartAt: sourceRoutine.scheduledStartAt,
        scheduledEndAt: sourceRoutine.scheduledEndAt,
        period: sourceRoutine.period,
        timezone: sourceRoutine.timezone,
      });

      return duplicatedRoutine;
    },
    [createRoutine, stationsRef]
  );

  return {
    selectedRoutineId,
    selectRoutine,
    editRoutineTitle,
    setEditRoutineTitle,
    isRoutineEditing,
    isAnyRoutineEditing: editingRoutineNode !== null,
    isNewRoutineTitle,
    startRenamingRoutine,
    cancelRenamingRoutine,
    renameEditingRoutine,
    executeSearchRoutines: executeSearch,
    searchRoutinesData,
    isSearchingRoutines,
    fetchMoreRoutines,
    searchRoutines,
    loadMoreRoutines,
    expandRoutinesByStationId,
    expandRoutinesByTagId,
    toggleRoutine,
    createRoutine,
    duplicateRoutine,
    upsertRoutineNode,
    isCreatingRoutine: createRoutineMutator.isPending,
    deleteRoutine,
    isDeletingRoutine: deleteRoutineMutator.isPending,
    updateRoutine,
    isUpdatingRoutine: updateRoutineMutator.isPending,
    linkRoutineTag,
    linkRoutineItem,
  };
};
