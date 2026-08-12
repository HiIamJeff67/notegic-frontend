import { getClientRequestHeaders } from "@shared/api/clientHeaders";
import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineTaskStatus as GraphQLRoutineTaskStatus,
  SearchRoutineTaskSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRoutineTasksLazyQuery } from "@shared/api/graphql/hooks/useSearchRoutineTasks";
import {
  useCreateRoutineTaskByRoutineId,
  useGetAllMyRoutineTasksByRoutineIds,
  usePauseMyRoutineTaskById,
  useResumeMyRoutineTaskById,
  useUpdateMyRoutineTaskById,
} from "@shared/api/hooks/routineTask.hook";
import {
  RoutinePeriod,
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import type { UpdateMyRoutineTaskByIdRequest } from "@shared/api/interfaces/routineTask.interface";
import { MaxSearchLimit } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import toast from "@shared/lib/toast";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import { type RefObject, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

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
  const getAllRoutineTasksByRoutineIdsQuerier =
    useGetAllMyRoutineTasksByRoutineIds();
  const updateRoutineTaskMutator = useUpdateMyRoutineTaskById();
  const pauseRoutineTaskMutator = usePauseMyRoutineTaskById();
  const resumeRoutineTaskMutator = useResumeMyRoutineTaskById();

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

  const getAllRoutineTasksByRoutineIds = useCallback(
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
      const response = await getAllRoutineTasksByRoutineIdsQuerier.fetch({
        header: getClientRequestHeaders(navigator.userAgent),
        param: {
          routineIds,
        },
      });
      if (response.success === false) throw response.exception;

      const routineById = new Map(
        routines.map(routine => [routine.id, routine])
      );
      const routineTaskNodes = response.data.flatMap(routineTask => {
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
          costUnit: routineTask.costUnit,
          payload: existingRoutineTask?.payload ?? {},
          priority: routineTask.priority,
          status: routineTask.status,
          attempts: routineTask.attempts,
          maxAttempts: routineTask.maxAttempts,
          period: routineTask.period,
          nextScheduledAt: routineTask.nextScheduledAt,
          scheduledAt: routineTask.scheduledAt,
          actualStartedAt: routineTask.actualStartedAt,
          actualEndedAt: routineTask.actualEndedAt,
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
    [forceUpdate, getAllRoutineTasksByRoutineIdsQuerier, stationsRef]
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
            costUnit: number;
            priority: number;
            status: GraphQLRoutineTaskStatus;
            attempts: number;
            maxAttempts: number;
            period: GraphQLRoutinePeriod | null;
            nextScheduledAt?: Date | string | number;
            scheduledAt: Date | string | number;
            actualStartedAt: Date | string | number | null;
            actualEndedAt: Date | string | number | null;
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
            payload: existingRoutineTask?.payload ?? {},
            costUnit: node.costUnit,
            priority: node.priority,
            status:
              node.status === GraphQLRoutineTaskStatus.RoutineTaskStatusWaiting
                ? RoutineTaskStatus.Waiting
                : node.status ===
                    GraphQLRoutineTaskStatus.RoutineTaskStatusRunning
                  ? RoutineTaskStatus.Running
                  : node.status ===
                      GraphQLRoutineTaskStatus.RoutineTaskStatusPause
                    ? RoutineTaskStatus.Pause
                    : RoutineTaskStatus.Idle,
            attempts: node.attempts,
            maxAttempts: node.maxAttempts,
            period:
              node.period === GraphQLRoutinePeriod.RoutinePeriodDaily
                ? RoutinePeriod.Daily
                : node.period === GraphQLRoutinePeriod.RoutinePeriodWeekly
                  ? RoutinePeriod.Weekly
                  : node.period === GraphQLRoutinePeriod.RoutinePeriodMonthly
                    ? RoutinePeriod.Monthly
                    : null,
            nextScheduledAt: new Date(node.nextScheduledAt ?? node.scheduledAt),
            scheduledAt: new Date(node.scheduledAt),
            actualStartedAt:
              node.actualStartedAt === null
                ? null
                : new Date(node.actualStartedAt),
            actualEndedAt:
              node.actualEndedAt === null ? null : new Date(node.actualEndedAt),
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
      nextScheduledAt: Date,
      period: RoutinePeriod | null = null,
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
          nextScheduledAt,
          period,
        },
      });
      if (response.success === false) throw response.exception;

      const routineTaskNode: RoutineTaskNode = {
        id: response.data.id as UUID,
        routineId,
        stationId: routineNode.stationId,
        title,
        purpose,
        costUnit: Math.ceil(
          new Blob([JSON.stringify(payload ?? {})]).size / 1024
        ),
        payload,
        priority,
        status: RoutineTaskStatus.Idle,
        attempts: 0,
        maxAttempts,
        period,
        nextScheduledAt,
        scheduledAt: nextScheduledAt,
        actualStartedAt: null,
        actualEndedAt: null,
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
        sourceRoutineTask.nextScheduledAt,
        sourceRoutineTask.period,
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
        if (
          values.nextScheduledAt !== undefined &&
          routineTaskNode.scheduledAt < values.nextScheduledAt
        ) {
          routineTaskNode.scheduledAt = values.nextScheduledAt;
        }
        if (values.payload !== undefined) {
          routineTaskNode.costUnit = Math.ceil(
            new Blob([JSON.stringify(values.payload ?? {})]).size / 1024
          );
        }
        if (setNull?.Period) routineTaskNode.period = null;
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

  const pauseRoutineTask = useCallback(
    async (routineTaskId: UUID): Promise<void> => {
      const routineTaskNodes = new Set<RoutineTaskNode>();
      for (const stationNode of stationsRef.current.values()) {
        const stationRoutineTaskNode = stationNode.routineTasks.find(
          stationRoutineTask => stationRoutineTask.id === routineTaskId
        );
        if (stationRoutineTaskNode)
          routineTaskNodes.add(stationRoutineTaskNode);
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

      const snapshots = [...routineTaskNodes].map(routineTaskNode => ({
        routineTaskNode,
        status: routineTaskNode.status,
        updatedAt: routineTaskNode.updatedAt,
      }));
      for (const routineTaskNode of routineTaskNodes) {
        routineTaskNode.status = RoutineTaskStatus.Pause;
        routineTaskNode.updatedAt = new Date();
      }
      forceUpdate();
      try {
        const response = await pauseRoutineTaskMutator.mutateAsync({
          header: getClientRequestHeaders(navigator.userAgent),
          body: { routineTaskId },
        });
        if (response.success === false) throw response.exception;

        for (const routineTaskNode of routineTaskNodes) {
          routineTaskNode.updatedAt = response.data.updatedAt;
        }
        forceUpdate();
      } catch (error) {
        for (const snapshot of snapshots) {
          snapshot.routineTaskNode.status = snapshot.status;
          snapshot.routineTaskNode.updatedAt = snapshot.updatedAt;
        }
        forceUpdate();
        throw error;
      }
    },
    [forceUpdate, pauseRoutineTaskMutator, stationsRef]
  );

  const resumeRoutineTask = useCallback(
    async (routineTaskId: UUID): Promise<void> => {
      const routineTaskNodes = new Set<RoutineTaskNode>();
      for (const stationNode of stationsRef.current.values()) {
        const stationRoutineTaskNode = stationNode.routineTasks.find(
          stationRoutineTask => stationRoutineTask.id === routineTaskId
        );
        if (stationRoutineTaskNode)
          routineTaskNodes.add(stationRoutineTaskNode);
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

      const snapshots = [...routineTaskNodes].map(routineTaskNode => ({
        routineTaskNode,
        status: routineTaskNode.status,
        updatedAt: routineTaskNode.updatedAt,
      }));
      for (const routineTaskNode of routineTaskNodes) {
        routineTaskNode.status = RoutineTaskStatus.Idle;
        routineTaskNode.updatedAt = new Date();
      }
      forceUpdate();
      try {
        const response = await resumeRoutineTaskMutator.mutateAsync({
          header: getClientRequestHeaders(navigator.userAgent),
          body: { routineTaskId },
        });
        if (response.success === false) throw response.exception;

        for (const routineTaskNode of routineTaskNodes) {
          routineTaskNode.updatedAt = response.data.updatedAt;
        }
        forceUpdate();
      } catch (error) {
        for (const snapshot of snapshots) {
          snapshot.routineTaskNode.status = snapshot.status;
          snapshot.routineTaskNode.updatedAt = snapshot.updatedAt;
        }
        forceUpdate();
        throw error;
      }
    },
    [forceUpdate, resumeRoutineTaskMutator, stationsRef]
  );

  return {
    selectedRoutineTaskId,
    selectRoutineTask,
    executeSearchRoutineTasks: executeSearch,
    searchRoutineTasksData,
    isSearchingRoutineTasks,
    fetchMoreRoutineTasks,
    getAllRoutineTasksByRoutineIds,
    searchRoutineTasksByRoutineIds,
    loadMoreRoutineTaskCandidates,
    loadMoreRoutineTasks,
    createRoutineTask,
    duplicateRoutineTask,
    upsertRoutineTaskNode,
    isCreatingRoutineTask: createRoutineTaskMutator.isPending,
    updateRoutineTask,
    isUpdatingRoutineTask: updateRoutineTaskMutator.isPending,
    pauseRoutineTask,
    isPausingRoutineTask: pauseRoutineTaskMutator.isPending,
    resumeRoutineTask,
    isResumingRoutineTask: resumeRoutineTaskMutator.isPending,
  };
};
