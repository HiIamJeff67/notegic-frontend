import {
  SearchRoutineTaskSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import {
  RoutinePhase,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import type { UpdateMyRoutineTaskByIdRequest } from "@shared/api/interfaces/routineTask.interface";
import type { RealtimeRoutineTaskLifecycleFrame } from "@shared/api/websocket";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import toast from "@shared/lib/toast";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSearchRoutineTasksLazyQuery } from "@/api/graphql/hooks/useSearchRoutineTasks";
import {
  useCreateRoutineTaskByRoutineId,
  useGetAllMyRoutineTasks,
  useGetMyRoutineTasksByRoutineId,
  useUpdateMyRoutineTaskById,
} from "@/api/hooks/routineTask.hook";
import { useGetMyRoutineTaskRecordsByRoutineTaskId } from "@/api/hooks/routineTaskRecord.hook";

interface UseRoutineTaskLogicProps {
  stationsRef: RefObject<LRUCache<UUID, StationNode>>;
  forceUpdate: () => void;
}

export const useRoutineTaskLogic = ({
  stationsRef,
  forceUpdate,
}: UseRoutineTaskLogicProps) => {
  const { t } = useTranslation();
  const createRoutineTaskMutator = useCreateRoutineTaskByRoutineId();
  const { fetch: fetchAllRoutineTasks } = useGetAllMyRoutineTasks();
  const { fetch: fetchMyRoutineTasksByRoutineId } =
    useGetMyRoutineTasksByRoutineId();
  const updateRoutineTaskMutator = useUpdateMyRoutineTaskById();
  const routineTaskRecordsQuerier = useGetMyRoutineTaskRecordsByRoutineTaskId();

  const [selectedRoutineTaskId, selectRoutineTask] = useState<UUID | null>(
    null
  );

  const [
    executeSearch,
    {
      data: searchRoutineTasksData,
      loading: isSearchingRoutineTasks,
      variables: searchRoutineTasksVariables,
      fetchMore: fetchMoreRoutineTasks,
    },
  ] = useSearchRoutineTasksLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const getMyRoutineTasksByRoutineIds = useCallback(
    async (routineIds: UUID[]): Promise<RoutineTaskNode[]> => {
      const routines = routineIds.flatMap(routineId => {
        for (const stationNode of stationsRef.current.values()) {
          const routineNode = stationNode.routines.find(
            routine => routine.id === routineId
          );
          if (routineNode) return [routineNode];
        }
        return [];
      });
      if (routines.length === 0) return [];
      const response =
        routineIds.length === 1
          ? await fetchMyRoutineTasksByRoutineId({
              header: getClientRequestHeaders(navigator.userAgent),
              param: {
                routineId: routineIds[0],
                areDeleted: false,
              },
            })
          : await fetchAllRoutineTasks({
              header: getClientRequestHeaders(navigator.userAgent),
              param: {
                areDeleted: false,
              },
            });
      if (response.success === false) throw response.exception;

      const routineIdSet = new Set(routineIds);
      const routineTasks = response.data.filter(routineTask =>
        routineIdSet.has(routineTask.routineId as UUID)
      );

      const routineById = new Map(
        routines.map(routine => [routine.id, routine])
      );
      const routineTaskNodes = routineTasks.flatMap(routineTask => {
        const routineNode = routineById.get(routineTask.routineId as UUID);
        if (!routineNode) return [];
        const stationNode = stationsRef.current.get(routineNode.stationId);
        if (!stationNode) return [];
        const existingRoutineTask =
          routineNode.routineTasks.find(
            stationRoutineTask => stationRoutineTask.id === routineTask.id
          ) ??
          stationNode.routineTasks.find(
            stationRoutineTask => stationRoutineTask.id === routineTask.id
          );
        const routineTaskNode: RoutineTaskNode = {
          id: routineTask.id as UUID,
          routineId: routineTask.routineId as UUID,
          stationId: routineNode.stationId,
          title: routineTask.title,
          purpose: routineTask.purpose,
          phase: routineTask.phase,
          costUnit: routineTask.costUnit,
          payload: routineTask.payload,
          priority: routineTask.priority,
          maxAttempts: routineTask.maxAttempts,
          previousRoutineTaskIds: routineTask.previousRoutineTaskIds as UUID[],
          updatedAt: routineTask.updatedAt,
          createdAt: routineTask.createdAt,
        };
        if (existingRoutineTask) {
          Object.assign(existingRoutineTask, routineTaskNode);
        } else {
          stationNode.routineTasks.push(routineTaskNode);
        }
        const persistedRoutineTask = existingRoutineTask ?? routineTaskNode;
        routineNode.routineTaskIds = Array.from(
          new Set([...routineNode.routineTaskIds, persistedRoutineTask.id])
        );
        routineNode.routineTasks = [
          ...routineNode.routineTasks.filter(
            routineTask => routineTask.id !== persistedRoutineTask.id
          ),
          persistedRoutineTask,
        ];
        routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
          leftRoutineTask.title.localeCompare(rightRoutineTask.title)
        );
        stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
          leftRoutineTask.title.localeCompare(rightRoutineTask.title)
        );
        return [persistedRoutineTask];
      });

      forceUpdate();
      return routineTaskNodes;
    },
    [
      fetchAllRoutineTasks,
      fetchMyRoutineTasksByRoutineId,
      forceUpdate,
      stationsRef,
    ]
  );

  const handleRealtimeRoutineTaskLifecycle = useCallback(
    async (frame: RealtimeRoutineTaskLifecycleFrame): Promise<void> => {
      const findRoutineTaskNodes = () => {
        const nodes = new Set<RoutineTaskNode>();
        for (const stationNode of stationsRef.current.values()) {
          const stationRoutineTask = stationNode.routineTasks.find(
            routineTask => routineTask.id === frame.routineTaskId
          );
          if (stationRoutineTask) nodes.add(stationRoutineTask);
          for (const routineNode of stationNode.routines) {
            const routineTask = routineNode.routineTasks.find(
              currentRoutineTask =>
                currentRoutineTask.id === frame.routineTaskId
            );
            if (routineTask) nodes.add(routineTask);
          }
        }
        return nodes;
      };

      const routineTaskNodes = findRoutineTaskNodes();
      if (routineTaskNodes.size === 0) return;

      if (frame.status === "running") {
        const occurredAt = new Date(frame.occurredAt);
        for (const routineTaskNode of routineTaskNodes) {
          routineTaskNode.executionStatus = RoutineTaskRecordStatus.Running;
          routineTaskNode.updatedAt = occurredAt;
        }
        forceUpdate();
        return;
      }

      await getMyRoutineTasksByRoutineIds([frame.routineId as UUID]);
      const recordResponse = await routineTaskRecordsQuerier.fetch({
        header: getClientRequestHeaders(navigator.userAgent),
        param: {
          routineTaskId: frame.routineTaskId as UUID,
          limit: 1,
        },
      });
      if (recordResponse.success === false) throw recordResponse.exception;

      const record =
        recordResponse.data.find(
          currentRecord => currentRecord.id === frame.routineTaskRecordId
        ) ?? recordResponse.data[0];
      for (const routineTaskNode of findRoutineTaskNodes()) {
        routineTaskNode.executionStatus = record?.status ?? null;
        routineTaskNode.updatedAt =
          record?.updatedAt ?? new Date(frame.occurredAt);
      }
      forceUpdate();
    },
    [
      forceUpdate,
      getMyRoutineTasksByRoutineIds,
      routineTaskRecordsQuerier,
      stationsRef,
    ]
  );

  const searchRoutineTasksByRoutineIds = useCallback(
    async (
      routineIds: UUID[],
      query: string = "",
      after?: string,
      preserveRoutineLinks: boolean = false
    ): Promise<{
      hasNextPage: boolean;
      endEncodedSearchCursor: string | null;
    }> => {
      const routines = routineIds.flatMap(routineId => {
        for (const stationNode of stationsRef.current.values()) {
          const routineNode = stationNode.routines.find(
            routine => routine.id === routineId
          );
          if (routineNode) return [routineNode];
        }
        return [];
      });
      if (routines.length === 0) {
        return {
          hasNextPage: false,
          endEncodedSearchCursor: null,
        };
      }
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        toast.error(t("workspace.notifications.routineTasksOnlineOnly"));
        return {
          hasNextPage: false,
          endEncodedSearchCursor: null,
        };
      }

      const result = await executeSearch({
        variables: {
          input: {
            query,
            after,
            first: MaxSearchLimit,
            routineIds,
            sortBy: SearchRoutineTaskSortBy.Title,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }).retain();
      const searchEdges = result.data?.searchRoutineTasks.searchEdges ?? [];
      const searchedRoutineTasks = searchEdges
        .map(edge => {
          const node = edge.node as unknown as {
            id: UUID;
            routineId: UUID;
            title: string;
            purpose: string;
            phase: RoutinePhase | null;
            costUnit: number;
            priority: number;
            maxAttempts: number;
            previousRoutineTaskIds: UUID[];
            updatedAt: Date | string | number;
            createdAt: Date | string | number;
          };
          const routineNode = routines.find(
            routine => routine.id === node.routineId
          );
          if (!routineNode) return null;
          const stationNode = stationsRef.current.get(routineNode.stationId);
          if (!stationNode) return null;
          const existingRoutineTask =
            routineNode.routineTasks.find(
              routineTask => routineTask.id === node.id
            ) ??
            stationNode.routineTasks.find(
              routineTask => routineTask.id === node.id
            );
          const routineTaskNode: RoutineTaskNode = {
            id: node.id,
            routineId: node.routineId,
            stationId: routineNode.stationId,
            title: node.title,
            purpose: node.purpose.replace(
              "RoutineTaskPurpose_",
              ""
            ) as RoutineTaskPurpose,
            phase: node.phase
              ? (node.phase.replace("RoutinePhase_", "") as RoutinePhase)
              : null,
            payload: existingRoutineTask?.payload ?? {},
            costUnit: node.costUnit,
            priority: node.priority,
            maxAttempts: node.maxAttempts,
            previousRoutineTaskIds: node.previousRoutineTaskIds,
            updatedAt: new Date(node.updatedAt),
            createdAt: new Date(node.createdAt),
          };
          if (existingRoutineTask) {
            Object.assign(existingRoutineTask, routineTaskNode);
            return existingRoutineTask;
          }
          return routineTaskNode;
        })
        .filter(
          (routineTask): routineTask is RoutineTaskNode => routineTask !== null
        );
      const searchedRoutineTaskIds = new Set(
        searchedRoutineTasks.map(routineTask => routineTask.id)
      );
      if (!preserveRoutineLinks) {
        for (const routineNode of routines) {
          routineNode.routineTasks = routineNode.routineTasks.filter(
            routineTask => !searchedRoutineTaskIds.has(routineTask.id)
          );
        }
        for (const searchedRoutineTask of searchedRoutineTasks) {
          const routineNode = routines.find(
            routine => routine.id === searchedRoutineTask.routineId
          );
          if (!routineNode) continue;
          const stationNode = stationsRef.current.get(routineNode.stationId);
          if (!stationNode) continue;
          stationNode.routineTasks = [
            ...stationNode.routineTasks.filter(
              routineTask => routineTask.id !== searchedRoutineTask.id
            ),
            searchedRoutineTask,
          ];
          stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
            leftRoutineTask.title.localeCompare(rightRoutineTask.title)
          );
          routineNode.routineTaskIds = Array.from(
            new Set([...routineNode.routineTaskIds, searchedRoutineTask.id])
          );
          routineNode.routineTasks = [
            ...routineNode.routineTasks.filter(
              routineTask => routineTask.id !== searchedRoutineTask.id
            ),
            searchedRoutineTask,
          ];
          routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
            leftRoutineTask.title.localeCompare(rightRoutineTask.title)
          );
        }
      }
      forceUpdate();
      return {
        hasNextPage:
          result.data?.searchRoutineTasks.searchPageInfo.hasNextPage ?? false,
        endEncodedSearchCursor:
          result.data?.searchRoutineTasks.searchPageInfo
            .endEncodedSearchCursor ?? null,
      };
    },
    [executeSearch, forceUpdate, stationsRef, t]
  );

  const loadMoreRoutineTaskCandidates = useCallback(async (): Promise<void> => {
    const connection = searchRoutineTasksData?.searchRoutineTasks;
    const pageInfo = connection?.searchPageInfo;
    const input = searchRoutineTasksVariables?.input;
    if (
      !pageInfo?.hasNextPage ||
      !pageInfo.endEncodedSearchCursor ||
      !input?.routineIds
    ) {
      return;
    }

    await searchRoutineTasksByRoutineIds(
      input.routineIds as UUID[],
      input.query,
      pageInfo.endEncodedSearchCursor,
      true
    );
  }, [
    searchRoutineTasksByRoutineIds,
    searchRoutineTasksData,
    searchRoutineTasksVariables,
  ]);

  const loadMoreRoutineTasks = useCallback(async (): Promise<void> => {
    const connection = searchRoutineTasksData?.searchRoutineTasks;
    const pageInfo = connection?.searchPageInfo;
    const input = searchRoutineTasksVariables?.input;
    if (
      !pageInfo?.hasNextPage ||
      !pageInfo.endEncodedSearchCursor ||
      !input?.routineIds
    ) {
      return;
    }

    await searchRoutineTasksByRoutineIds(
      input.routineIds as UUID[],
      input.query,
      pageInfo.endEncodedSearchCursor
    );
  }, [
    searchRoutineTasksByRoutineIds,
    searchRoutineTasksData,
    searchRoutineTasksVariables,
  ]);

  const createRoutineTask = useCallback(
    async (
      routineId: UUID,
      title: string,
      purpose: RoutineTaskPurpose,
      payload: unknown = {},
      priority: number = 0,
      maxAttempts: number = 1
    ): Promise<RoutineTaskNode> => {
      let stationNode: StationNode | undefined;
      let routineNode = undefined as
        | StationNode["routines"][number]
        | undefined;
      for (const currentStationNode of stationsRef.current.values()) {
        routineNode = currentStationNode.routines.find(
          routine => routine.id === routineId
        );
        if (routineNode) {
          stationNode = currentStationNode;
          break;
        }
      }
      if (!stationNode || !routineNode)
        throw new Error("routine does not exist");
      const response = await createRoutineTaskMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          routineId,
          title,
          purpose,
          payload,
          priority,
          maxAttempts,
        },
      });
      if (response.success === false) throw response.exception;

      const routineTaskNode: RoutineTaskNode = {
        id: response.data.id as UUID,
        routineId,
        stationId: routineNode.stationId,
        title,
        purpose,
        phase: null,
        costUnit: Math.ceil(
          new Blob([JSON.stringify(payload ?? {})]).size / 1024
        ),
        payload,
        priority,
        maxAttempts,
        previousRoutineTaskIds: [],
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      };
      stationNode.routineTasks.push(routineTaskNode);
      stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );
      routineNode.routineTaskIds = Array.from(
        new Set([...routineNode.routineTaskIds, routineTaskNode.id])
      );
      routineNode.routineTasks = [
        ...routineNode.routineTasks.filter(
          routineTask => routineTask.id !== routineTaskNode.id
        ),
        routineTaskNode,
      ];
      routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );
      forceUpdate();
      return routineTaskNode;
    },
    [createRoutineTaskMutator, forceUpdate, stationsRef]
  );

  const duplicateRoutineTask = useCallback(
    async (routineTaskId: UUID): Promise<RoutineTaskNode> => {
      let sourceRoutineTask: RoutineTaskNode | undefined;
      for (const stationNode of stationsRef.current.values()) {
        sourceRoutineTask = stationNode.routineTasks.find(
          routineTask => routineTask.id === routineTaskId
        );
        if (sourceRoutineTask) break;
      }
      if (!sourceRoutineTask) throw new Error("routine task does not exist");

      return await createRoutineTask(
        sourceRoutineTask.routineId,
        `${sourceRoutineTask.title} Copy`,
        sourceRoutineTask.purpose,
        sourceRoutineTask.payload,
        sourceRoutineTask.priority,
        sourceRoutineTask.maxAttempts
      );
    },
    [createRoutineTask, stationsRef]
  );

  const upsertRoutineTaskNode = useCallback(
    (routineTaskNode: RoutineTaskNode): RoutineTaskNode => {
      let stationNode: StationNode | undefined;
      let routineNode = undefined as
        | StationNode["routines"][number]
        | undefined;
      for (const currentStationNode of stationsRef.current.values()) {
        routineNode = currentStationNode.routines.find(
          routine => routine.id === routineTaskNode.routineId
        );
        if (routineNode) {
          stationNode = currentStationNode;
          break;
        }
      }
      if (!stationNode || !routineNode) return routineTaskNode;
      routineTaskNode.stationId = routineNode.stationId;

      const existingRoutineTask = stationNode.routineTasks.find(
        stationRoutineTask => stationRoutineTask.id === routineTaskNode.id
      );
      if (existingRoutineTask) {
        Object.assign(existingRoutineTask, routineTaskNode);
      } else {
        stationNode.routineTasks.push(routineTaskNode);
      }
      stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );

      const persistedRoutineTask = existingRoutineTask ?? routineTaskNode;
      routineNode.routineTaskIds = Array.from(
        new Set([...routineNode.routineTaskIds, persistedRoutineTask.id])
      );
      routineNode.routineTasks = [
        ...routineNode.routineTasks.filter(
          routineTask => routineTask.id !== persistedRoutineTask.id
        ),
        persistedRoutineTask,
      ];
      routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
        leftRoutineTask.title.localeCompare(rightRoutineTask.title)
      );

      forceUpdate();
      return persistedRoutineTask;
    },
    [forceUpdate, stationsRef]
  );

  const updateRoutineTask = useCallback(
    async (
      routineTaskId: UUID,
      values: UpdateMyRoutineTaskByIdRequest["body"]["values"],
      setNull?: UpdateMyRoutineTaskByIdRequest["body"]["setNull"]
    ): Promise<RoutineTaskNode> => {
      const routineTaskNodes = new Set<RoutineTaskNode>();
      for (const stationNode of stationsRef.current.values()) {
        const stationRoutineTaskNode = stationNode.routineTasks.find(
          stationRoutineTask => stationRoutineTask.id === routineTaskId
        );
        if (stationRoutineTaskNode) {
          routineTaskNodes.add(stationRoutineTaskNode);
        }
        for (const routineNode of stationNode.routines) {
          const routineTaskNode = routineNode.routineTasks.find(
            routineTask => routineTask.id === routineTaskId
          );
          if (routineTaskNode) routineTaskNodes.add(routineTaskNode);
        }
      }
      if (routineTaskNodes.size === 0) {
        throw new Error("routine task does not exist");
      }
      const response = await updateRoutineTaskMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          routineTaskId,
          values,
          setNull,
        },
      });
      if (response.success === false) throw response.exception;

      for (const routineTaskNode of routineTaskNodes) {
        Object.assign(routineTaskNode, values);
        if (values.payload !== undefined) {
          routineTaskNode.costUnit = Math.ceil(
            new Blob([JSON.stringify(values.payload ?? {})]).size / 1024
          );
        }
        routineTaskNode.updatedAt = response.data.updatedAt;
      }
      if (values.routineId !== undefined) {
        const movedRoutineTask = routineTaskNodes.values().next()
          .value as RoutineTaskNode;
        let nextStationNode: StationNode | undefined;
        let nextRoutineNode = undefined as
          | StationNode["routines"][number]
          | undefined;
        for (const stationNode of stationsRef.current.values()) {
          stationNode.routineTasks = stationNode.routineTasks.filter(
            routineTask => routineTask.id !== routineTaskId
          );
          for (const routineNode of stationNode.routines) {
            routineNode.routineTaskIds = routineNode.routineTaskIds.filter(
              id => id !== routineTaskId
            );
            routineNode.routineTasks = routineNode.routineTasks.filter(
              routineTask => routineTask.id !== routineTaskId
            );
          }
          nextRoutineNode ??= stationNode.routines.find(
            routine => routine.id === values.routineId
          );
          if (nextRoutineNode) nextStationNode ??= stationNode;
        }
        if (nextStationNode && nextRoutineNode) {
          movedRoutineTask.routineId = nextRoutineNode.id;
          movedRoutineTask.stationId = nextRoutineNode.stationId;
          nextStationNode.routineTasks.push(movedRoutineTask);
          nextRoutineNode.routineTaskIds.push(movedRoutineTask.id);
          nextRoutineNode.routineTasks.push(movedRoutineTask);
        }
      }
      for (const stationNode of stationsRef.current.values()) {
        stationNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
          leftRoutineTask.title.localeCompare(rightRoutineTask.title)
        );
        for (const routineNode of stationNode.routines) {
          routineNode.routineTasks.sort((leftRoutineTask, rightRoutineTask) =>
            leftRoutineTask.title.localeCompare(rightRoutineTask.title)
          );
        }
      }
      forceUpdate();
      return routineTaskNodes.values().next().value as RoutineTaskNode;
    },
    [forceUpdate, stationsRef, updateRoutineTaskMutator]
  );

  return {
    selectedRoutineTaskId,
    selectRoutineTask,
    executeSearchRoutineTasks: executeSearch,
    searchRoutineTasksData,
    isSearchingRoutineTasks,
    fetchMoreRoutineTasks,
    getMyRoutineTasksByRoutineIds,
    handleRealtimeRoutineTaskLifecycle,
    searchRoutineTasksByRoutineIds,
    loadMoreRoutineTaskCandidates,
    loadMoreRoutineTasks,
    createRoutineTask,
    duplicateRoutineTask,
    upsertRoutineTaskNode,
    isCreatingRoutineTask: createRoutineTaskMutator.isPending,
    updateRoutineTask,
    isUpdatingRoutineTask: updateRoutineTaskMutator.isPending,
  };
};
