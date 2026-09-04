import {
  addEdge,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  MarkerType,
  type NodeChange,
  Position,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NotegicAPIError } from "@shared/api/exceptions";
import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import {
  getRoutineTaskDependencyEdgeId,
  getRoutineTaskDependencyEdges,
  hasRoutineTaskDependencyCycle,
  hasRoutineTaskDependencyEdge,
  isRoutineTaskDependencyInRoutine,
  mergePendingRoutineTaskDependencyEdges,
} from "@shared/graph";
import { translateError } from "@shared/i18n/error";
import { translateRoutinePhase } from "@shared/i18n/workspace";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyRoutineById } from "@/api/hooks/routine.hook";
import { useGetMyRoutineTasksByRoutineId } from "@/api/hooks/routineTask.hook";
import {
  useCreateRoutineTaskDependencyByRoutineId,
  useDeleteRoutineTaskDependencyByRoutineId,
  useGetRoutineTaskDependenciesByRoutineId,
  useUpdateRoutineTaskDependencyByRoutineId,
} from "@/api/hooks/routineTaskDependency.hook";
import {
  loadRoutineTaskDependencyGraphDraft,
  saveRoutineTaskDependencyGraphDraft,
} from "@/api/local/routine-task-dependency-graph-draft";
import type { RoutineTaskDependencyGraphDraftEdge } from "@/api/local/schemas";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useModal, useStationRoutine, useTheme } from "@/hooks";
import RoutineTaskDependencyGraphCanvas from "./RoutineTaskDependencyGraphCanvas";
import RoutineTaskDependencyGraphToolbar from "./RoutineTaskDependencyGraphToolbar";
import RoutineTaskDependencyInspector from "./RoutineTaskDependencyInspector";
import type { RoutineTaskGraphNode as RoutineTaskGraphNodeType } from "./RoutineTaskGraphNode";

interface RoutineTaskDependencyGraphEditorProps {
  routineId: UUID;
}

const RoutineTaskDependencyGraphEditor = ({
  routineId,
}: RoutineTaskDependencyGraphEditorProps) => {
  const { t } = useTranslation();
  const modalManager = useModal();
  const sidebarManager = useSidebar();
  const themeManager = useTheme();
  const stationRoutineManager = useStationRoutine();
  const routineQuery = useGetMyRoutineById();
  const routineTasksQuery = useGetMyRoutineTasksByRoutineId();
  const routineTaskDependenciesQuery =
    useGetRoutineTaskDependenciesByRoutineId();
  const createDependency = useCreateRoutineTaskDependencyByRoutineId();
  const deleteDependency = useDeleteRoutineTaskDependencyByRoutineId();
  const updateDependency = useUpdateRoutineTaskDependencyByRoutineId();
  const routine = stationRoutineManager.getRoutineById(routineId);
  const [routineTasks, setRoutineTasks] = useState<
    Awaited<ReturnType<typeof routineTasksQuery.fetch>>["data"]
  >([]);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<RoutineTaskGraphNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [routineTaskDependencies, setRoutineTaskDependencies] = useState<
    RoutineTaskDependency[] | undefined
  >(undefined);
  const [isRetryingSync, setIsRetryingSync] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [localDraft, setLocalDraft] = useState<
    Awaited<ReturnType<typeof loadRoutineTaskDependencyGraphDraft>> | undefined
  >(undefined);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [dependencyDescription, setDependencyDescription] = useState("");
  const [dependencyProgress, setDependencyProgress] = useState(0);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMiniMapVisible, setIsMiniMapVisible] = useState(true);
  const [isCreatingDependency, setIsCreatingDependency] = useState(false);
  const [dependencySourceNodeId, setDependencySourceNodeId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    const loadRoutineTasks = async () => {
      setIsLoading(true);
      setRoutineTasks([]);
      setLocalDraft(undefined);
      setSelectedEdgeId(null);
      try {
        await stationRoutineManager.initializeStationRoutineData();
        const routineResponse = await routineQuery.fetch({
          header: getClientRequestHeaders(navigator.userAgent),
          param: { routineId },
        });
        if (!routineResponse.data) {
          throw new Error("routine does not exist");
        }
        await stationRoutineManager.searchRoutines("", [
          routineResponse.data.stationId as UUID,
        ]);
        if (!stationRoutineManager.getRoutineById(routineId)) {
          throw new Error("routine does not exist");
        }
        const routineTasksResponse = await routineTasksQuery.fetch({
          header: getClientRequestHeaders(navigator.userAgent),
          param: { routineId },
        });
        const response = await routineTaskDependenciesQuery.fetch({
          header: getClientRequestHeaders(navigator.userAgent),
          param: { routineId },
        });
        const fetchedDependencies: RoutineTaskDependency[] = response.data;
        const draft = await loadRoutineTaskDependencyGraphDraft(routineId);
        if (!cancelled) {
          setRoutineTasks(routineTasksResponse.data);
          setRoutineTaskDependencies(fetchedDependencies);
          setLocalDraft(draft);
          const invalidDraftEdge = draft?.edges.find(
            edge => edge.syncStatus === "invalid"
          );
          if (invalidDraftEdge?.errorMessage) {
            toast.error(invalidDraftEdge.errorMessage);
          }
        }
      } catch (error) {
        if (!cancelled) {
          const translatedMessage = translateError(error, t);
          const unknownErrorMessage = t("error.encounterUnknownError");
          const errorDetails =
            error instanceof Error ? error.message : String(error);
          const message =
            translatedMessage === unknownErrorMessage && errorDetails
              ? `${unknownErrorMessage}: ${errorDetails}`
              : translatedMessage || errorDetails || unknownErrorMessage;
          console.error("failed to load routine task dependency graph", error);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadRoutineTasks();
    return () => {
      cancelled = true;
    };
  }, [routineId, reloadVersion]);

  const graphNodes = useMemo<RoutineTaskGraphNodeType[]>(
    () =>
      routineTasks.map((task, index) => ({
        id: task.id,
        type: "routineTask" as const,
        position: {
          x: (index % 3) * 320,
          y: Math.floor(index / 3) * 180,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          title: task.title,
          purpose: task.purpose,
          executionStatus: routine?.routineTasks.find(
            routineTask => routineTask.id === task.id
          )?.executionStatus,
          routinePhase: routine?.phase,
          onDeleted: async () => {
            await stationRoutineManager.refresh();
            setReloadVersion(version => version + 1);
          },
        },
      })) ?? [],
    [routine?.phase, routineTasks, stationRoutineManager.refresh]
  );
  const graphEdges = useMemo(
    () =>
      routineTaskDependencies
        ? getRoutineTaskDependencyEdges(routineTaskDependencies)
        : [],
    [routineTaskDependencies]
  );
  const graphEdgesWithPending = useMemo(() => {
    return mergePendingRoutineTaskDependencyEdges(
      graphEdges,
      localDraft?.edges
    );
  }, [graphEdges, localDraft?.edges]);
  const selectedDependency = useMemo(
    () =>
      routineTaskDependencies?.find(
        dependency =>
          `${dependency.previousRoutineTaskId}->${dependency.routineTaskId}` ===
          selectedEdgeId
      ) ?? null,
    [routineTaskDependencies, selectedEdgeId]
  );

  useEffect(() => {
    setDependencyDescription(selectedDependency?.description ?? "");
    setDependencyProgress(selectedDependency?.progress ?? 0);
  }, [selectedDependency]);

  useEffect(() => {
    if (!routine || localDraft === undefined) return;

    const routineTaskIds = new Set<string>(routineTasks.map(task => task.id));
    const draftNodePositions = new Map(
      localDraft?.nodes.map(node => [node.id, node.position])
    );
    const draftEdges = localDraft
      ? localDraft.edges
          .filter(
            edge =>
              edge.operation !== "delete" &&
              routineTaskIds.has(edge.source) &&
              routineTaskIds.has(edge.target)
          )
          .map(edge => ({
            ...edge,
            type: "smoothstep" as const,
            markerEnd: { type: MarkerType.ArrowClosed },
          }))
      : [];

    setNodes(
      graphNodes.map(node => ({
        ...node,
        position: draftNodePositions.get(node.id) ?? node.position,
      }))
    );
    setEdges(
      routineTaskDependencies !== undefined ? graphEdgesWithPending : draftEdges
    );
    setIsDirty(false);
  }, [
    graphEdges,
    graphEdgesWithPending,
    graphNodes,
    localDraft,
    routine,
    routineTaskDependencies,
    setEdges,
    setNodes,
  ]);

  const handleConnect = async (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (connection.source === connection.target) {
      const message = t("workspace.validation.dependencyCycle");
      toast.error(message);
      return;
    }
    const routineTaskIds = new Set(nodes.map(node => node.id));
    if (
      !isRoutineTaskDependencyInRoutine(
        routineTaskIds,
        connection.source,
        connection.target
      )
    ) {
      const message = t("workspace.validation.dependencyOutsideRoutine");
      toast.error(message);
      return;
    }
    if (
      hasRoutineTaskDependencyEdge(edges, connection.source, connection.target)
    ) {
      const message = t("workspace.validation.dependencyDuplicate");
      toast.error(message);
      return;
    }

    if (
      hasRoutineTaskDependencyCycle(edges, connection.source, connection.target)
    ) {
      const message = t("workspace.validation.dependencyCycle");
      toast.error(message);
      return;
    }

    const nextEdge: Edge = {
      ...connection,
      id: getRoutineTaskDependencyEdgeId(connection.source, connection.target),
      type: "smoothstep" as const,
      markerEnd: { type: MarkerType.ArrowClosed },
    };
    const nextEdges = addEdge(nextEdge, edges);
    setEdges(nextEdges);
    setIsCreatingDependency(false);
    setDependencySourceNodeId(null);

    try {
      const response = await createDependency.mutateAsync({
        param: { routineId },
        body: {
          routineTaskId: connection.target as UUID,
          previousRoutineTaskId: connection.source as UUID,
        },
      });
      setRoutineTaskDependencies(currentDependencies => {
        if (currentDependencies === undefined) return undefined;
        return [
          ...currentDependencies.filter(
            dependency =>
              !(
                dependency.routineTaskId === response.data.routineTaskId &&
                dependency.previousRoutineTaskId ===
                  response.data.previousRoutineTaskId
              )
          ),
          response.data,
        ];
      });
      const syncedEdges: RoutineTaskDependencyGraphDraftEdge[] = nextEdges.map(
        edge => {
          const edgeData = edge.data as
            | { description?: string; progress?: number }
            | undefined;
          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            description: edgeData?.description ?? "",
            progress: edgeData?.progress ?? 0,
            ...(edge.id === nextEdge.id && !response.success
              ? { syncStatus: "pending" as const, operation: "create" as const }
              : { syncStatus: "synced" as const }),
          };
        }
      );
      await saveRoutineTaskDependencyGraphDraft(routineId, {
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: syncedEdges,
      });
      setLocalDraft({
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: syncedEdges,
        updatedAt: new Date(),
      });
    } catch (error) {
      const message =
        translateError(error, t) ||
        t("workspace.notifications.routineDependencyGraphSaveFailed");
      const syncStatus =
        error instanceof NotegicAPIError ? ("invalid" as const) : "pending";
      const failedDraftEdges: RoutineTaskDependencyGraphDraftEdge[] =
        nextEdges.map(edge => {
          const existingDraftEdge = localDraft?.edges.find(
            draftEdge => draftEdge.id === edge.id
          );
          const edgeData = edge.data as
            | { description?: string; progress?: number }
            | undefined;
          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            description: edgeData?.description ?? "",
            progress: edgeData?.progress ?? 0,
            syncStatus:
              edge.id === nextEdge.id
                ? syncStatus
                : (existingDraftEdge?.syncStatus ?? "synced"),
            ...(edge.id === nextEdge.id
              ? { operation: "create" as const, errorMessage: message }
              : existingDraftEdge?.operation
                ? { operation: existingDraftEdge.operation }
                : {}),
          };
        });
      const nextDraft = {
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: failedDraftEdges,
        updatedAt: new Date(),
      };
      setEdges(nextEdges);
      setLocalDraft(nextDraft);
      try {
        await saveRoutineTaskDependencyGraphDraft(routineId, nextDraft);
      } catch {
        // Keep the attempted edge visible so the user can correct it in place.
      }
      toast.error(message);
    }
  };

  const handleEdgesChange = async (changes: EdgeChange[]) => {
    const removedEdges = changes
      .filter(change => change.type === "remove")
      .map(change => edges.find(edge => edge.id === change.id))
      .filter((edge): edge is Edge => edge !== undefined);
    const nextEdges = applyEdgeChanges(changes, edges);
    onEdgesChange(changes);
    if (removedEdges.length === 0) return;

    for (const edge of removedEdges) {
      try {
        const response = await deleteDependency.mutateAsync({
          param: { routineId },
          body: {
            routineTaskId: edge.target as UUID,
            previousRoutineTaskId: edge.source as UUID,
          },
        });
        setRoutineTaskDependencies(currentDependencies =>
          currentDependencies?.filter(
            dependency =>
              !(
                dependency.routineTaskId === edge.target &&
                dependency.previousRoutineTaskId === edge.source
              )
          )
        );
        const syncedEdges: RoutineTaskDependencyGraphDraftEdge[] =
          nextEdges.map(nextEdge => {
            const edgeData = nextEdge.data as
              | { description?: string; progress?: number }
              | undefined;
            return {
              id: nextEdge.id,
              source: nextEdge.source,
              target: nextEdge.target,
              description: edgeData?.description ?? "",
              progress: edgeData?.progress ?? 0,
              syncStatus: "synced" as const,
            };
          });
        if (!response.success) {
          syncedEdges.push({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            syncStatus: "pending",
            operation: "delete",
          });
        }
        await saveRoutineTaskDependencyGraphDraft(routineId, {
          nodes: nodes.map(node => ({
            id: node.id,
            position: node.position,
          })),
          edges: syncedEdges,
        });
        setLocalDraft({
          nodes: nodes.map(node => ({
            id: node.id,
            position: node.position,
          })),
          edges: syncedEdges,
          updatedAt: new Date(),
        });
      } catch (error) {
        const message =
          translateError(error, t) ||
          t("workspace.notifications.routineDependencyGraphSaveFailed");
        const syncStatus =
          error instanceof NotegicAPIError ? ("invalid" as const) : "pending";
        const failedDraftEdges: RoutineTaskDependencyGraphDraftEdge[] =
          nextEdges.map(nextEdge => {
            const edgeData = nextEdge.data as
              | { description?: string; progress?: number }
              | undefined;
            return {
              id: nextEdge.id,
              source: nextEdge.source,
              target: nextEdge.target,
              description: edgeData?.description ?? "",
              progress: edgeData?.progress ?? 0,
              syncStatus: "synced" as const,
            };
          });
        failedDraftEdges.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          syncStatus,
          operation: "delete",
          errorMessage: message,
        });
        const nextDraft = {
          nodes: nodes.map(node => ({
            id: node.id,
            position: node.position,
          })),
          edges: failedDraftEdges,
          updatedAt: new Date(),
        };
        setEdges(nextEdges);
        setLocalDraft(nextDraft);
        try {
          await saveRoutineTaskDependencyGraphDraft(routineId, nextDraft);
        } catch {
          // Keep the edge removed so the user can continue correcting the graph.
        }
        toast.error(message);
      }
    }
  };

  const handleNodesChange = (
    changes: NodeChange<RoutineTaskGraphNodeType>[]
  ) => {
    onNodesChange(changes);
    if (changes.some(change => change.type !== "select")) setIsDirty(true);
  };

  const handleRetryPendingSync = async () => {
    if (!routine || !localDraft || isRetryingSync) return;

    setIsRetryingSync(true);
    let failedCount = 0;
    let terminalErrorMessage: string | null = null;
    let nextDraftEdges = [...localDraft.edges];

    for (const pendingEdge of localDraft.edges.filter(
      edge => edge.syncStatus === "pending"
    )) {
      try {
        if (pendingEdge.operation === "update") {
          const response = await updateDependency.mutateAsync({
            param: { routineId },
            body: {
              routineTaskId: pendingEdge.target as UUID,
              previousRoutineTaskId: pendingEdge.source as UUID,
              description: pendingEdge.description ?? "",
              progress: pendingEdge.progress ?? 0,
            },
          });
          if (!response.success) {
            failedCount += 1;
            continue;
          }
          nextDraftEdges = nextDraftEdges.map(edge =>
            edge.id === pendingEdge.id
              ? {
                  ...edge,
                  description: response.data.description,
                  progress: response.data.progress,
                  syncStatus: "synced",
                  operation: undefined,
                }
              : edge
          );
          setRoutineTaskDependencies(currentDependencies =>
            currentDependencies?.map(dependency =>
              dependency.routineTaskId === response.data.routineTaskId &&
              dependency.previousRoutineTaskId ===
                response.data.previousRoutineTaskId
                ? response.data
                : dependency
            )
          );
          continue;
        }

        if (pendingEdge.operation === "delete") {
          const response = await deleteDependency.mutateAsync({
            param: { routineId },
            body: {
              routineTaskId: pendingEdge.target as UUID,
              previousRoutineTaskId: pendingEdge.source as UUID,
            },
          });
          if (!response.success) {
            failedCount += 1;
            continue;
          }
          nextDraftEdges = nextDraftEdges.filter(
            edge => edge.id !== pendingEdge.id
          );
          setRoutineTaskDependencies(currentDependencies =>
            currentDependencies?.filter(
              dependency =>
                !(
                  dependency.routineTaskId === pendingEdge.target &&
                  dependency.previousRoutineTaskId === pendingEdge.source
                )
            )
          );
          continue;
        }

        const response = await createDependency.mutateAsync({
          param: { routineId },
          body: {
            routineTaskId: pendingEdge.target as UUID,
            previousRoutineTaskId: pendingEdge.source as UUID,
          },
        });
        if (!response.success) {
          failedCount += 1;
          continue;
        }
        nextDraftEdges = nextDraftEdges.map(edge =>
          edge.id === pendingEdge.id
            ? {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                syncStatus: "synced",
              }
            : edge
        );
        setRoutineTaskDependencies(currentDependencies => {
          if (currentDependencies === undefined) return undefined;
          return [
            ...currentDependencies.filter(
              dependency =>
                !(
                  dependency.routineTaskId === response.data.routineTaskId &&
                  dependency.previousRoutineTaskId ===
                    response.data.previousRoutineTaskId
                )
            ),
            response.data,
          ];
        });
      } catch (error) {
        failedCount += 1;
        if (error instanceof NotegicAPIError) {
          terminalErrorMessage =
            translateError(error, t) ||
            t("workspace.notifications.routineDependencyGraphSaveFailed");
          nextDraftEdges = nextDraftEdges.map(edge =>
            edge.id === pendingEdge.id
              ? {
                  ...edge,
                  syncStatus: "invalid" as const,
                  errorMessage: terminalErrorMessage ?? undefined,
                }
              : edge
          );
        }
      }
    }

    try {
      await saveRoutineTaskDependencyGraphDraft(routine.id, {
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: nextDraftEdges,
      });
      setLocalDraft({
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: nextDraftEdges,
        updatedAt: new Date(),
      });
      toast[failedCount === 0 ? "success" : "error"](
        t(
          failedCount === 0
            ? "workspace.notifications.routineDependencyGraphSaved"
            : "workspace.notifications.routineDependencyGraphSaveFailed"
        )
      );
    } catch {
      toast.error(
        t("workspace.notifications.routineDependencyGraphSaveFailed")
      );
    } finally {
      setIsRetryingSync(false);
    }
  };

  const handleReset = () => {
    if (!routine) return;
    setNodes(graphNodes);
    setEdges(graphEdges);
    setIsDirty(false);
  };

  const handleExport = () => {
    if (!routine) return;

    const graph = {
      version: 1,
      routine: {
        id: routine.id,
        title: routine.title,
      },
      nodes: nodes.map(node => ({
        id: node.id,
        position: node.position,
        data: {
          title: node.data.title,
          purpose: node.data.purpose,
        },
      })),
      edges: edges.map(edge => {
        const edgeData = edge.data as
          | { description?: string; progress?: number }
          | undefined;
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: {
            description: edgeData?.description ?? "",
            progress: edgeData?.progress ?? 0,
          },
        };
      }),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName =
      routine.title.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-") || "routine";
    link.href = url;
    link.download = `${fileName}-dependency-graph.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("workspace.notifications.exported"));
  };

  const handleUpdateDependency = async () => {
    if (!selectedDependency || !selectedEdgeId) return;
    try {
      const response = await updateDependency.mutateAsync({
        param: { routineId },
        body: {
          routineTaskId: selectedDependency.routineTaskId as UUID,
          previousRoutineTaskId:
            selectedDependency.previousRoutineTaskId as UUID,
          description: dependencyDescription,
          progress: dependencyProgress,
        },
      });
      setRoutineTaskDependencies(currentDependencies =>
        currentDependencies?.map(dependency =>
          dependency.routineTaskId === selectedDependency.routineTaskId &&
          dependency.previousRoutineTaskId ===
            selectedDependency.previousRoutineTaskId
            ? response.data
            : dependency
        )
      );
      setEdges(currentEdges =>
        currentEdges.map(edge =>
          edge.id === selectedEdgeId
            ? {
                ...edge,
                data: {
                  description: response.data.description,
                  progress: response.data.progress,
                },
              }
            : edge
        )
      );

      const draftEdges: RoutineTaskDependencyGraphDraftEdge[] = edges.map(
        edge => {
          const existingDraftEdge = localDraft?.edges.find(
            draftEdge => draftEdge.id === edge.id
          );
          const edgeData =
            edge.id === selectedEdgeId
              ? {
                  description: response.data.description,
                  progress: response.data.progress,
                }
              : {
                  description: existingDraftEdge?.description ?? "",
                  progress: existingDraftEdge?.progress ?? 0,
                };

          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            ...edgeData,
            syncStatus:
              edge.id === selectedEdgeId && !response.success
                ? "pending"
                : (existingDraftEdge?.syncStatus ?? "synced"),
            ...(edge.id === selectedEdgeId && !response.success
              ? { operation: "update" as const }
              : existingDraftEdge?.operation
                ? { operation: existingDraftEdge.operation }
                : {}),
          };
        }
      );
      await saveRoutineTaskDependencyGraphDraft(routineId, {
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: draftEdges,
      });
      setLocalDraft({
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: draftEdges,
        updatedAt: new Date(),
      });
    } catch (error) {
      const message =
        translateError(error, t) ||
        t("workspace.notifications.routineDependencyGraphSaveFailed");
      const syncStatus =
        error instanceof NotegicAPIError ? ("invalid" as const) : "pending";
      const failedDraftEdges: RoutineTaskDependencyGraphDraftEdge[] = edges.map(
        edge => {
          const existingDraftEdge = localDraft?.edges.find(
            draftEdge => draftEdge.id === edge.id
          );
          const edgeData =
            edge.id === selectedEdgeId
              ? {
                  description: dependencyDescription,
                  progress: dependencyProgress,
                }
              : {
                  description: existingDraftEdge?.description ?? "",
                  progress: existingDraftEdge?.progress ?? 0,
                };
          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            ...edgeData,
            syncStatus:
              edge.id === selectedEdgeId
                ? syncStatus
                : (existingDraftEdge?.syncStatus ?? "synced"),
            ...(edge.id === selectedEdgeId
              ? { operation: "update" as const, errorMessage: message }
              : existingDraftEdge?.operation
                ? { operation: existingDraftEdge.operation }
                : {}),
          };
        }
      );
      const nextDraft = {
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: failedDraftEdges,
        updatedAt: new Date(),
      };
      setEdges(currentEdges =>
        currentEdges.map(edge =>
          edge.id === selectedEdgeId
            ? {
                ...edge,
                data: {
                  description: dependencyDescription,
                  progress: dependencyProgress,
                },
              }
            : edge
        )
      );
      setLocalDraft(nextDraft);
      try {
        await saveRoutineTaskDependencyGraphDraft(routineId, nextDraft);
      } catch {
        // Keep the edited values visible so the user can correct them in place.
      }
      toast.error(message);
    }
  };

  const openCreateRoutineTaskDialog = () => {
    if (!routine) return;
    const station = stationRoutineManager.getStationById(routine.stationId);
    if (!station) return;

    modalManager.open("CreateRoutineTaskDialog", {
      routineId: routine.id,
      routineTitle: routine.title,
      stationName: station.name,
      onCreated: async () => {
        await stationRoutineManager.refresh();
        setReloadVersion(version => version + 1);
      },
    });
  };

  const graphSummary = useMemo(
    () => `${nodes.length} nodes · ${edges.length} edges`,
    [edges.length, nodes.length]
  );
  const pendingSyncCount =
    localDraft?.edges.filter(edge => edge.syncStatus === "pending").length ?? 0;
  const invalidMutationCount =
    localDraft?.edges.filter(edge => edge.syncStatus === "invalid").length ?? 0;
  const isSaving =
    isRetryingSync ||
    createDependency.isPending ||
    deleteDependency.isPending ||
    updateDependency.isPending;

  if (isLoading) return <StrictLoadingCover />;

  if (!routine) {
    return (
      <main className="flex h-full min-h-0 flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          {t("workspace.scope.noRoutines")}
        </p>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-inset/75 px-3 py-1.5 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{routine.title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {t("workspace.table.routineTasks")} · {graphSummary}
              {routine.phase
                ? ` · ${translateRoutinePhase(routine.phase, t)}`
                : ""}
              {isSaving
                ? ` · ${t("workspace.fields.saving")}`
                : isDirty
                  ? ` · ${t("workspace.fields.localDraft")}`
                  : invalidMutationCount > 0
                    ? ` · ${t("workspace.fields.validationError")} (${invalidMutationCount})`
                    : pendingSyncCount > 0
                      ? ` · ${t("workspace.fields.pendingSync")} (${pendingSyncCount})`
                      : localDraft
                        ? ` · ${t("workspace.fields.saved")}`
                        : ""}
            </p>
          </div>
        </div>

        <RoutineTaskDependencyGraphToolbar
          isAddMenuOpen={isAddMenuOpen}
          isDirty={isDirty}
          isLoading={isLoading}
          isRetryingSync={isRetryingSync}
          isSaving={isSaving}
          pendingSyncCount={pendingSyncCount}
          onAddMenuOpenChange={setIsAddMenuOpen}
          onOpenCreateRoutineTaskDialog={openCreateRoutineTaskDialog}
          onReset={handleReset}
          onRetryPendingSync={() => void handleRetryPendingSync()}
          onExport={handleExport}
          onStartCreatingDependency={() => {
            setIsCreatingDependency(true);
            setDependencySourceNodeId(null);
            toast.info(t("workspace.notifications.dependencyCreationHint"));
          }}
          onRefresh={() => setReloadVersion(version => version + 1)}
        />
      </header>

      <section
        className={`routine-task-dependency-graph relative min-h-0 flex-1 ${isCreatingDependency ? "cursor-crosshair" : ""}`}
      >
        {selectedDependency && (
          <RoutineTaskDependencyInspector
            dependency={selectedDependency}
            description={dependencyDescription}
            isSaving={updateDependency.isPending}
            progress={dependencyProgress}
            onDescriptionChange={setDependencyDescription}
            onProgressChange={setDependencyProgress}
            onSave={() => void handleUpdateDependency()}
          />
        )}
        <RoutineTaskDependencyGraphCanvas
          colorMode={themeManager.currentTheme.isDark ? "dark" : "light"}
          edges={edges}
          isMiniMapVisible={isMiniMapVisible}
          nodes={nodes}
          onConnect={handleConnect}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onEdgesChange={handleEdgesChange}
          onMiniMapVisibilityChange={setIsMiniMapVisible}
          onNodeClick={(_, node) => {
            if (isCreatingDependency) {
              if (!dependencySourceNodeId) {
                setDependencySourceNodeId(node.id);
                return;
              }

              void handleConnect({
                source: dependencySourceNodeId,
                target: node.id,
                sourceHandle: null,
                targetHandle: null,
              });
              return;
            }

            stationRoutineManager.openInspector({
              type: "routineTask",
              id: node.id as UUID,
            });
          }}
          onNodesChange={handleNodesChange}
          onPaneClick={() => {
            setSelectedEdgeId(null);
            setIsCreatingDependency(false);
            setDependencySourceNodeId(null);
          }}
        />
      </section>
    </main>
  );
};

export default RoutineTaskDependencyGraphEditor;
