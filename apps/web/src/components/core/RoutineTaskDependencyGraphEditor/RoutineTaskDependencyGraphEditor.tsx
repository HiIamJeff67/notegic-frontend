import {
  addEdge,
  applyEdgeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MarkerType,
  MiniMap,
  type NodeChange,
  Panel,
  Position,
  ReactFlow,
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
import {
  AlertCircle,
  ChevronDown,
  GitBranch,
  Map as MapIcon,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyRoutineById } from "@/api/hooks/routine.hook";
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
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useModal, useStationRoutine, useTheme } from "@/hooks";
import RoutineTaskGraphNode, {
  type RoutineTaskGraphNode as RoutineTaskGraphNodeType,
} from "./RoutineTaskGraphNode";

interface RoutineTaskDependencyGraphEditorProps {
  routineId: UUID;
}

const nodeTypes = { routineTask: RoutineTaskGraphNode };

const RoutineTaskDependencyGraphEditor = ({
  routineId,
}: RoutineTaskDependencyGraphEditorProps) => {
  const { t } = useTranslation();
  const modalManager = useModal();
  const sidebarManager = useSidebar();
  const themeManager = useTheme();
  const stationRoutineManager = useStationRoutine();
  const routineQuery = useGetMyRoutineById();
  const routineTaskDependenciesQuery =
    useGetRoutineTaskDependenciesByRoutineId();
  const createDependency = useCreateRoutineTaskDependencyByRoutineId();
  const deleteDependency = useDeleteRoutineTaskDependencyByRoutineId();
  const updateDependency = useUpdateRoutineTaskDependencyByRoutineId();
  const routine = stationRoutineManager.getRoutineById(routineId);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<RoutineTaskGraphNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [routineTaskDependencies, setRoutineTaskDependencies] = useState<
    RoutineTaskDependency[] | undefined
  >(undefined);
  const [isRetryingSync, setIsRetryingSync] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [localDraft, setLocalDraft] = useState<
    Awaited<ReturnType<typeof loadRoutineTaskDependencyGraphDraft>> | undefined
  >(undefined);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [dependencyDescription, setDependencyDescription] = useState("");
  const [dependencyProgress, setDependencyProgress] = useState(0);
  const [dependencyError, setDependencyError] = useState<string | null>(null);
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
      setDependencyError(null);
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
        await stationRoutineManager.getAllRoutineTasksByRoutineIds([routineId]);
        const response = await routineTaskDependenciesQuery.fetch({
          param: { routineId },
        });
        const fetchedDependencies: RoutineTaskDependency[] = response.data;
        const draft = await loadRoutineTaskDependencyGraphDraft(routineId);
        if (!cancelled) {
          setRoutineTaskDependencies(fetchedDependencies);
          setLocalDraft(draft);
          const invalidDraftEdge = draft?.edges.find(
            edge => edge.syncStatus === "invalid"
          );
          if (invalidDraftEdge?.errorMessage) {
            setDependencyError(invalidDraftEdge.errorMessage);
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
          setDependencyError(message);
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
      routine?.routineTasks.map((task, index) => ({
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
          executionStatus: task.executionStatus,
          routinePhase: routine?.phase,
          onDeleted: async () => {
            await stationRoutineManager.refresh();
            setReloadVersion(version => version + 1);
          },
        },
      })) ?? [],
    [routine?.phase, routine?.routineTasks, stationRoutineManager.refresh]
  );
  const graphEdges = useMemo(
    () =>
      (routineTaskDependencies
        ? getRoutineTaskDependencyEdges(routineTaskDependencies)
        : undefined) ??
      routine?.routineTasks.flatMap(task =>
        task.previousRoutineTaskIds.map(previousRoutineTaskId => ({
          id: getRoutineTaskDependencyEdgeId(previousRoutineTaskId, task.id),
          source: previousRoutineTaskId,
          target: task.id,
          data: { description: "", progress: 0 },
          type: "smoothstep" as const,
          markerEnd: { type: MarkerType.ArrowClosed },
        }))
      ) ??
      [],
    [routine?.routineTasks, routineTaskDependencies]
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

    const routineTaskIds = new Set<string>(
      routine.routineTasks.map(task => task.id)
    );
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
    setDependencyError(null);
    if (connection.source === connection.target) {
      const message = t("workspace.validation.dependencyCycle");
      setDependencyError(message);
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
      setDependencyError(message);
      toast.error(message);
      return;
    }
    if (
      hasRoutineTaskDependencyEdge(edges, connection.source, connection.target)
    ) {
      const message = t("workspace.validation.dependencyDuplicate");
      setDependencyError(message);
      toast.error(message);
      return;
    }

    if (
      hasRoutineTaskDependencyCycle(edges, connection.source, connection.target)
    ) {
      const message = t("workspace.validation.dependencyCycle");
      setDependencyError(message);
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
      setDependencyError(message);
      toast.error(message);
    }
  };

  const handleEdgesChange = async (changes: EdgeChange[]) => {
    setDependencyError(null);
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
        setDependencyError(message);
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
      if (terminalErrorMessage) setDependencyError(terminalErrorMessage);
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

  const handleUpdateDependency = async () => {
    if (!selectedDependency || !selectedEdgeId) return;
    setDependencyError(null);

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
      setDependencyError(message);
      toast.error(message);
    }
  };

  const handleSave = async () => {
    if (!routine || !isDirty) return;
    setDependencyError(null);
    setIsSavingDraft(true);

    try {
      const draftEdges: RoutineTaskDependencyGraphDraftEdge[] = [
        ...edges.map(edge => {
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
            description:
              edgeData?.description ?? existingDraftEdge?.description ?? "",
            progress: edgeData?.progress ?? existingDraftEdge?.progress ?? 0,
            syncStatus: existingDraftEdge?.syncStatus ?? "synced",
            ...(existingDraftEdge?.operation
              ? { operation: existingDraftEdge.operation }
              : {}),
          };
        }),
        ...(localDraft?.edges.filter(
          edge =>
            edge.operation === "delete" &&
            !edges.some(currentEdge => currentEdge.id === edge.id)
        ) ?? []),
      ];
      await saveRoutineTaskDependencyGraphDraft(routine.id, {
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
      setIsDirty(false);
      toast.success(t("workspace.notifications.routineDependencyGraphSaved"));
    } catch (error) {
      const message =
        translateError(error, t) ||
        t("workspace.notifications.routineDependencyGraphSaveFailed");
      setDependencyError(message);
      toast.error(message);
    } finally {
      setIsSavingDraft(false);
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
        await stationRoutineManager.getAllRoutineTasksByRoutineIds([
          routine.id,
        ]);
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
    isSavingDraft ||
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

        <ButtonGroup className="shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-7 px-0 [&_svg]:size-3.5"
                disabled={isLoading}
                onClick={() => setReloadVersion(version => version + 1)}
                aria-label={t("workspace.viewer.refresh")}
              >
                <RefreshCw className={isLoading ? "animate-spin" : ""} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("workspace.viewer.refresh")}
            </TooltipContent>
          </Tooltip>

          <DropdownMenu open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-9 px-0 [&_svg]:size-3.5"
                    aria-label={t("workspace.fields.create")}
                  >
                    <div className="flex h-full w-full items-center justify-center gap-px">
                      <Plus className="shrink-0" />
                      <span
                        aria-hidden="true"
                        className="h-full w-px shrink-0 bg-border"
                      />
                      <ChevronDown
                        className={`!size-2 shrink-0 transition-transform ${isAddMenuOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("workspace.fields.create")}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onSelect={openCreateRoutineTaskDialog}>
                <Plus />
                {t("workspace.fields.routineTask")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setIsCreatingDependency(true);
                  setDependencySourceNodeId(null);
                  setDependencyError(null);
                  toast.info(
                    t("workspace.notifications.dependencyCreationHint")
                  );
                }}
              >
                <GitBranch />
                {t("workspace.fields.dependency")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {pendingSyncCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 px-0 [&_svg]:size-3.5"
                  disabled={isSaving}
                  onClick={() => void handleRetryPendingSync()}
                  aria-label={t("workspace.fields.retrySync")}
                >
                  <RefreshCw className={isRetryingSync ? "animate-spin" : ""} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("workspace.fields.retrySync")}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-7 px-0 [&_svg]:size-3.5"
                disabled={!isDirty || isSaving}
                onClick={() => void handleSave()}
                aria-label={t("common.save")}
              >
                {isSavingDraft ? <Spinner /> : <Save />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t("common.save")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-7 px-0 [&_svg]:size-3.5"
                disabled={!isDirty || isSaving}
                onClick={handleReset}
                aria-label={t("workspace.fields.reset")}
              >
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("workspace.fields.reset")}
            </TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </header>

      <section
        className={`routine-task-dependency-graph relative min-h-0 flex-1 ${isCreatingDependency ? "cursor-crosshair" : ""}`}
      >
        {dependencyError && (
          <div
            className="absolute top-3 left-3 z-20 flex max-w-md items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive shadow-sm"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 flex-1">{dependencyError}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-1 size-6 shrink-0 text-destructive hover:text-destructive"
              onClick={() => setDependencyError(null)}
              aria-label={t("common.close")}
              title={t("common.close")}
            >
              <X />
            </Button>
          </div>
        )}
        {selectedDependency && (
          <aside className="absolute top-3 right-3 z-20 flex w-72 flex-col gap-4 rounded-md border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="truncate text-sm font-semibold">
                {t("workspace.fields.update")}
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                {selectedDependency.previousRoutineTaskId} →{" "}
                {selectedDependency.routineTaskId}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="routine-dependency-description">
                {t("workspace.fields.description")}
              </Label>
              <Textarea
                id="routine-dependency-description"
                value={dependencyDescription}
                maxLength={128}
                className="min-h-20 resize-y"
                onChange={event =>
                  setDependencyDescription(event.currentTarget.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="routine-dependency-progress">
                {t("workspace.fields.progress")}
              </Label>
              <Input
                id="routine-dependency-progress"
                type="number"
                min={0}
                max={100}
                value={dependencyProgress}
                onChange={event =>
                  setDependencyProgress(
                    Math.min(
                      100,
                      Math.max(0, event.currentTarget.valueAsNumber || 0)
                    )
                  )
                }
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleUpdateDependency()}
              disabled={updateDependency.isPending}
            >
              {t("common.save")}
            </Button>
          </aside>
        )}
        <ReactFlow<RoutineTaskGraphNodeType, Edge>
          nodes={nodes}
          edges={edges as Edge[]}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => {
            setSelectedEdgeId(null);
            setIsCreatingDependency(false);
            setDependencySourceNodeId(null);
          }}
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
          fitView
          colorMode={themeManager.currentTheme.isDark ? "dark" : "light"}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          {isMiniMapVisible && (
            <Panel position="bottom-right" className="!m-0">
              <div className="relative m-[15px]">
                <MiniMap pannable zoomable className="!static !m-0" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 left-1 z-10 size-6 rounded-sm p-0 text-muted-foreground !shadow-none !bg-transparent hover:!bg-transparent hover:!text-foreground focus-visible:!bg-transparent focus-visible:!text-foreground [&_svg]:size-3.5"
                  onClick={() => setIsMiniMapVisible(false)}
                  aria-label={t("common.close")}
                  title={t("common.close")}
                >
                  <X />
                </Button>
              </div>
            </Panel>
          )}
          {!isMiniMapVisible && (
            <Panel position="bottom-right" className="!m-0">
              <div className="m-[15px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-md border border-foreground/30 bg-inset text-muted-foreground !shadow-none hover:bg-inset hover:text-foreground focus-visible:bg-inset focus-visible:text-foreground [&_svg]:size-3.5"
                  onClick={() => setIsMiniMapVisible(true)}
                  aria-label={t("workspace.viewer.overview")}
                  title={t("workspace.viewer.overview")}
                >
                  <MapIcon />
                </Button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </section>
    </main>
  );
};

export default RoutineTaskDependencyGraphEditor;
