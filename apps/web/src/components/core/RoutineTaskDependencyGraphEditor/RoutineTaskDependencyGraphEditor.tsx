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
import { eq } from "drizzle-orm";
import { localDB } from "@/api/local/db";
import { Routine } from "@/api/local/schemas";
import { RoutineTaskLocalSimulator } from "@/api/local/simulators/routineTask.simulator";
import { useTransactionSynchronizer } from "@/hooks/useTransactionSynchronizer";
import "@xyflow/react/dist/style.css";
import "./graph.css";
import { NotegicAPIError } from "@shared/api/exceptions";
import { RoutineTaskRecordStatus } from "@shared/api/interfaces/enums";
import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import {
  getRoutineTaskDependencyEdgeId,
  getRoutineTaskDependencyEdges,
  hasRoutineTaskDependencyCycle,
  hasRoutineTaskDependencyEdge,
  isRoutineTaskDependencyInRoutine,
  mergePendingRoutineTaskDependencyEdges,
} from "@shared/graph";
import { routinePhaseTKeys } from "@shared/i18n/enums/routinePhase.tKey";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { ChevronDownIcon, SquarePen, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyRoutineById } from "@/api/hooks/routine.hook";
import {
  useCreateRoutineTaskByRoutineId,
  useGetMyRoutineTasksByRoutineId,
  useUpdateMyRoutineTaskById,
} from "@/api/hooks/routineTask.hook";
import {
  useCreateRoutineTaskDependencyByRoutineId,
  useDeleteRoutineTaskDependencyByRoutineId,
  useGetRoutineTaskDependenciesByRoutineId,
  useUpdateRoutineTaskDependencyByRoutineId,
} from "@/api/hooks/routineTaskDependency.hook";
import type { RoutineTaskDependencyGraphDraftEdge } from "@/api/local/schemas";
import RoutineTaskStatusDot from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  useModal,
  useRoutineTaskDependencyGraphDraft,
  useStationRoutine,
  useTheme,
} from "@/hooks";
import { useLoading } from "@/hooks/useLoading";
import { getDependencyDraftErrorKey } from "./dependency-draft-error";
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
  const { startAsyncTransactionLoading } = useLoading();
  const stationRoutineManager = useStationRoutine();
  const transactionSynchronizer = useTransactionSynchronizer();
  const {
    draft: localDraft,
    loadDraft,
    saveDraft,
  } = useRoutineTaskDependencyGraphDraft();
  const routineQuery = useGetMyRoutineById({
    header: getClientRequestHeaders(),
    param: { routineId },
  });
  const createNode = useCreateRoutineTaskByRoutineId();
  const updateNode = useUpdateMyRoutineTaskById();
  const [pendingNodeCount, setPendingNodeCount] = useState(0);
  const [definitionVersion, setDefinitionVersion] = useState(1);
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
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [dependencyDescription, setDependencyDescription] = useState("");
  const [dependencyProgress, setDependencyProgress] = useState(0);
  const [isRoutineMenuOpen, setIsRoutineMenuOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMiniMapVisible, setIsMiniMapVisible] = useState(true);
  const [edgeMenu, setEdgeMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const hasLoaded = useRef(false);
  const pendingPositions = useRef(
    new Map<
      string,
      {
        x: number;
        y: number;
        expectedDefinitionVersion: number;
      }
    >()
  );
  const positionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const savingPositions = useRef(false);
  const [isSavingPositions, setIsSavingPositions] = useState(false);

  const saveNodePositions = useCallback(async () => {
    if (savingPositions.current || pendingPositions.current.size === 0) return;
    savingPositions.current = true;
    setIsSavingPositions(true);
    try {
      while (pendingPositions.current.size > 0) {
        const [id, position] = pendingPositions.current.entries().next().value!;
        const response = await updateNode.mutateAsync({
          header: getClientRequestHeaders(navigator.userAgent),
          body: {
            routineTaskId: id as UUID,
            values: { x: position.x, y: position.y },
            expectedDefinitionVersion: position.expectedDefinitionVersion,
          },
        });
        setRoutineTasks(current =>
          current.map(task =>
            task.id === id ? { ...task, x: position.x, y: position.y } : task
          )
        );
        if (pendingPositions.current.get(id) === position)
          pendingPositions.current.delete(id);
        if (!response.success) {
          setPendingNodeCount(count => count + 1);
          toast.info(t("workspace.fields.pendingSync"));
        }
      }
      setIsDirty(false);
    } catch (error) {
      toast.error(tError(error, t));
    } finally {
      savingPositions.current = false;
      setIsSavingPositions(false);
    }
  }, [updateNode.mutateAsync, t]);

  useEffect(
    () => () => {
      clearTimeout(positionTimer.current);
      void saveNodePositions();
    },
    [saveNodePositions]
  );
  useEffect(() => {
    setReloadVersion(version => version + 1);
  }, [transactionSynchronizer.synchronizationRevision]);

  useEffect(() => {
    let cancelled = false;

    const loadRoutineTasks = async () => {
      if (!hasLoaded.current) setIsLoading(true);
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
        const draft = await loadDraft();
        const pending = await RoutineTaskLocalSimulator.getPendingMutations();
        const pendingCount = pending.filter(transaction => {
          const body = transaction.body as { routineId?: string };
          const affected = transaction.affected as {
            routineId?: string;
          } | null;
          return (body.routineId ?? affected?.routineId) === routineId;
        }).length;
        if (!cancelled) {
          setPendingNodeCount(pendingCount);
          setRoutineTasks(routineTasksResponse.data);
          setDefinitionVersion(routineResponse.data.definitionVersion);
          setRoutineTaskDependencies(fetchedDependencies);
          hasLoaded.current = true;
          const invalidDraftEdge = draft?.edges.find(
            edge => edge.syncStatus === "invalid"
          );
          if (invalidDraftEdge?.errorKey || invalidDraftEdge?.errorMessage) {
            // Legacy drafts contain translated text; use a localized fallback.
            toast.error(
              t(
                (invalidDraftEdge.errorKey ??
                  "error.encounterUnknownError") as never,
                { defaultValue: t("error.encounterUnknownError") }
              )
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          const translatedMessage = tError(error, t);
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

    if (hasLoaded.current) void loadRoutineTasks();
    else void startAsyncTransactionLoading(loadRoutineTasks);
    return () => {
      cancelled = true;
    };
  }, [
    loadDraft,
    reloadVersion,
    routineId,
    routineQuery.data?.data?.definitionVersion,
    startAsyncTransactionLoading,
  ]);

  const graphNodes = useMemo<RoutineTaskGraphNodeType[]>(
    () =>
      routineTasks.map((task, index) => ({
        id: task.id,
        type: "routineTask" as const,
        position: {
          x: task.x ?? (index % 3) * 320,
          y: task.y ?? Math.floor(index / 3) * 180,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          kind: task.kind,
          payload: task.payload ?? {},
          expectedDefinitionVersion: definitionVersion,
          onEdit: () =>
            stationRoutineManager.openInspector({
              type: "routineTask",
              id: task.id as UUID,
              onUpdated: () => setReloadVersion(version => version + 1),
            }),
          onUpdated: async values => {
            try {
              const response = await updateNode.mutateAsync({
                header: getClientRequestHeaders(navigator.userAgent),
                body: {
                  routineTaskId: task.id,
                  values,
                  expectedDefinitionVersion: definitionVersion,
                },
              });
              if (!response.success) {
                setPendingNodeCount(count => count + 1);
                toast.info(t("workspace.fields.pendingSync"));
              }
              setRoutineTasks(current =>
                current.map(node =>
                  node.id === task.id ? { ...node, ...values } : node
                )
              );
            } catch (error) {
              toast.error(tError(error, t));
            }
          },
          title: task.title,
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
    [
      definitionVersion,
      routine?.phase,
      routineTasks,
      stationRoutineManager.refresh,
      updateNode.mutateAsync,
      t,
    ]
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

    setNodes(current =>
      graphNodes.map(node => {
        const existing = current.find(value => value.id === node.id);
        const pending = pendingPositions.current.get(node.id);
        return {
          ...existing,
          ...node,
          ...(existing?.dragging || pending
            ? { position: existing?.position ?? pending! }
            : {}),
        };
      })
    );
    setEdges(
      routineTaskDependencies !== undefined ? graphEdgesWithPending : draftEdges
    );
    if (pendingPositions.current.size === 0) setIsDirty(false);
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
    if (
      nodes.find(node => node.id === connection.target)?.data.kind === "Start"
    ) {
      toast.error(t("workspace.validation.startingNodeIncoming"));
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

    try {
      const response = await createDependency.mutateAsync({
        param: { routineId },
        body: {
          expectedDefinitionVersion: definitionVersion,
          routineTaskId: connection.target as UUID,
          previousRoutineTaskId: connection.source as UUID,
        },
      });
      if (response.success) setDefinitionVersion(version => version + 1);
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
              ? {
                  syncStatus: "pending" as const,
                  operation: "create" as const,
                  expectedDefinitionVersion: definitionVersion,
                }
              : { syncStatus: "synced" as const }),
          };
        }
      );
      await saveDraft({
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: syncedEdges,
      });
    } catch (error) {
      const errorKey = getDependencyDraftErrorKey(error);
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
              ? { operation: "create" as const, errorKey }
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
      };
      setEdges(nextEdges);
      try {
        await saveDraft(nextDraft);
      } catch {
        // Keep the attempted edge visible so the user can correct it in place.
      }
      toast.error(tError(error, t));
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

    let nextDefinitionVersion = definitionVersion;
    for (const edge of removedEdges) {
      try {
        const response = await deleteDependency.mutateAsync({
          param: { routineId },
          body: {
            expectedDefinitionVersion: nextDefinitionVersion,
            routineTaskId: edge.target as UUID,
            previousRoutineTaskId: edge.source as UUID,
          },
        });
        if (response.success) {
          setDefinitionVersion(++nextDefinitionVersion);
        }
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
            expectedDefinitionVersion: definitionVersion,
            operation: "delete",
          });
        }
        await saveDraft({
          nodes: nodes.map(node => ({
            id: node.id,
            position: node.position,
          })),
          edges: syncedEdges,
        });
      } catch (error) {
        const errorKey = getDependencyDraftErrorKey(error);
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
          errorKey,
        });
        const nextDraft = {
          nodes: nodes.map(node => ({
            id: node.id,
            position: node.position,
          })),
          edges: failedDraftEdges,
        };
        setEdges(nextEdges);
        try {
          await saveDraft(nextDraft);
        } catch {
          // Keep the edge removed so the user can continue correcting the graph.
        }
        toast.error(tError(error, t));
      }
    }
  };

  const handleNodesChange = async (
    changes: NodeChange<RoutineTaskGraphNodeType>[]
  ) => {
    onNodesChange(changes);
    if (
      changes.some(
        change => change.type === "position" && change.dragging === true
      )
    )
      setIsDirty(true);
    const stopped = changes.filter(
      change => change.type === "position" && change.dragging === false
    );
    if (stopped.length > 0) {
      const positions = new Map(nodes.map(node => [node.id, node.position]));
      for (const change of stopped) {
        if (change.type !== "position" || !change.position) continue;
        positions.set(change.id, change.position);
        pendingPositions.current.set(change.id, {
          ...change.position,
          expectedDefinitionVersion: definitionVersion,
        });
      }
      setIsDirty(true);
      clearTimeout(positionTimer.current);
      positionTimer.current = setTimeout(() => void saveNodePositions(), 750);
      try {
        await saveDraft({
          nodes: [...positions].map(([id, position]) => ({ id, position })),
          edges: localDraft?.edges ?? [],
        });
      } catch (error) {
        toast.error(tError(error, t));
      }
    }
  };

  const handleRetryPendingSync = async () => {
    if (!routine || isRetryingSync) return;

    setIsRetryingSync(true);
    let failedCount = 0;
    let nextDraftEdges = [...(localDraft?.edges ?? [])];
    let nextDefinitionVersion = definitionVersion;
    try {
      await saveNodePositions();
      await RoutineTaskLocalSimulator.resetPendingRetries(routineId);
      await transactionSynchronizer.synchronizeTransactions();
      const pending = await RoutineTaskLocalSimulator.getPendingMutations();
      const remaining = pending.filter(transaction => {
        const body = transaction.body as { routineId?: string };
        const affected = transaction.affected as { routineId?: string } | null;
        return (body.routineId ?? affected?.routineId) === routineId;
      }).length;
      setPendingNodeCount(remaining);
      if (remaining > 0) {
        toast.info(t("workspace.fields.pendingSync"));
        setIsRetryingSync(false);
        return;
      }
      // Only locally acknowledged writes may advance the draft conflict boundary.
      const acknowledgedDraft = await loadDraft();
      nextDraftEdges = [...(acknowledgedDraft?.edges ?? [])];
      const [cached] = await localDB
        .select()
        .from(Routine)
        .where(eq(Routine.id, routineId));
      nextDefinitionVersion = cached?.definitionVersion ?? definitionVersion;
      setDefinitionVersion(nextDefinitionVersion);
    } catch (error) {
      toast.error(tError(error, t));
      setIsRetryingSync(false);
      return;
    }

    for (const pendingEdge of [...nextDraftEdges].filter(
      edge => edge.syncStatus === "pending"
    )) {
      try {
        if (pendingEdge.expectedDefinitionVersion === undefined) {
          nextDraftEdges = nextDraftEdges.map(edge =>
            edge.id === pendingEdge.id
              ? {
                  ...edge,
                  syncStatus: "invalid",
                  errorKey: "server.error.DefinitionConflict",
                }
              : edge
          );
          failedCount++;
          continue;
        }
        nextDefinitionVersion =
          nextDraftEdges.find(edge => edge.id === pendingEdge.id)
            ?.expectedDefinitionVersion ??
          pendingEdge.expectedDefinitionVersion;
        if (pendingEdge.operation === "update") {
          const response = await updateDependency.mutateAsync({
            param: { routineId },
            body: {
              expectedDefinitionVersion: nextDefinitionVersion,
              routineTaskId: pendingEdge.target as UUID,
              previousRoutineTaskId: pendingEdge.source as UUID,
              description: pendingEdge.description ?? "",
              progress: pendingEdge.progress ?? 0,
            },
          });
          if (response.success) {
            setDefinitionVersion(++nextDefinitionVersion);
            nextDraftEdges = nextDraftEdges.map(edge =>
              edge.expectedDefinitionVersion === nextDefinitionVersion - 1
                ? { ...edge, expectedDefinitionVersion: nextDefinitionVersion }
                : edge
            );
          }
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
              expectedDefinitionVersion: nextDefinitionVersion,
              routineTaskId: pendingEdge.target as UUID,
              previousRoutineTaskId: pendingEdge.source as UUID,
            },
          });
          if (response.success) {
            setDefinitionVersion(++nextDefinitionVersion);
            nextDraftEdges = nextDraftEdges.map(edge =>
              edge.expectedDefinitionVersion === nextDefinitionVersion - 1
                ? { ...edge, expectedDefinitionVersion: nextDefinitionVersion }
                : edge
            );
          }
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
            expectedDefinitionVersion: nextDefinitionVersion,
            routineTaskId: pendingEdge.target as UUID,
            previousRoutineTaskId: pendingEdge.source as UUID,
          },
        });
        if (response.success) {
          setDefinitionVersion(++nextDefinitionVersion);
          nextDraftEdges = nextDraftEdges.map(edge =>
            edge.expectedDefinitionVersion === nextDefinitionVersion - 1
              ? { ...edge, expectedDefinitionVersion: nextDefinitionVersion }
              : edge
          );
        }
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
          const errorKey = getDependencyDraftErrorKey(error);
          nextDraftEdges = nextDraftEdges.map(edge =>
            edge.id === pendingEdge.id
              ? {
                  ...edge,
                  syncStatus: "invalid" as const,
                  errorKey,
                }
              : edge
          );
        }
      }
    }

    try {
      await saveDraft({
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: nextDraftEdges,
      });
      setReloadVersion(version => version + 1);
      if (failedCount === 0) toast.success(t("workspace.fields.saved"));
      else
        toast.error(
          t("workspace.notifications.routineDependencyGraphSaveFailed")
        );
    } catch {
      toast.error(
        t("workspace.notifications.routineDependencyGraphSaveFailed")
      );
    } finally {
      setIsRetryingSync(false);
    }
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
          kind: node.data.kind,
          payload: node.data.payload,
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
          expectedDefinitionVersion: definitionVersion,
          routineTaskId: selectedDependency.routineTaskId as UUID,
          previousRoutineTaskId:
            selectedDependency.previousRoutineTaskId as UUID,
          description: dependencyDescription,
          progress: dependencyProgress,
        },
      });
      if (response.success) setDefinitionVersion(version => version + 1);
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
      await saveDraft({
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position,
        })),
        edges: draftEdges,
      });
    } catch (error) {
      const errorKey = getDependencyDraftErrorKey(error);
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
              ? { operation: "update" as const, errorKey }
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
      try {
        await saveDraft(nextDraft);
      } catch {
        // Keep the edited values visible so the user can correct them in place.
      }
      toast.error(tError(error, t));
    }
  };

  const openCreateRoutineTaskDialog = () => {
    if (!routine) return;
    const station = stationRoutineManager.getStationById(routine.stationId);
    if (!station) return;

    modalManager.open("CreateRoutineTaskDialog", {
      routineId: routine.id,
      expectedDefinitionVersion: definitionVersion,
      routineTitle: routine.title,
      stationName: station.name,
      onCreated: async () => {
        setReloadVersion(version => version + 1);
      },
    });
  };

  const pendingSyncCount =
    pendingNodeCount +
    (localDraft?.edges.filter(edge => edge.syncStatus === "pending").length ??
      0);
  const invalidMutationCount =
    localDraft?.edges.filter(edge => edge.syncStatus === "invalid").length ?? 0;
  const isSaving =
    isSavingPositions ||
    isRetryingSync ||
    createDependency.isPending ||
    deleteDependency.isPending ||
    updateDependency.isPending;
  const station = routine
    ? stationRoutineManager.getStationById(routine.stationId)
    : undefined;
  const storageStatus = isSaving
    ? t("workspace.fields.saving")
    : isDirty
      ? t("workspace.fields.localDraft")
      : invalidMutationCount > 0
        ? `${t("workspace.fields.validationError")} (${invalidMutationCount})`
        : pendingSyncCount > 0
          ? `${t("workspace.fields.pendingSync")} (${pendingSyncCount})`
          : t("workspace.fields.saved");
  const routineTaskStatusCounts = Object.values(RoutineTaskRecordStatus)
    .map(status => ({
      status,
      count:
        routine?.routineTasks.filter(
          routineTask => routineTask.executionStatus === status
        ).length ?? 0,
    }))
    .filter(
      statusCount =>
        statusCount.count > 0 &&
        statusCount.status !== RoutineTaskRecordStatus.Running
    );
  const activeRoutineTaskCount =
    routine?.routineTasks.filter(
      routineTask =>
        routineTask.executionStatus === RoutineTaskRecordStatus.Running
    ).length ?? 0;

  if (isLoading) return <LoadingCover />;

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
      <header className="flex h-[var(--app-toolbar-height)] w-full shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-inset/75 px-3 py-1.5 backdrop-blur-md">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <DropdownMenu
            open={isRoutineMenuOpen}
            onOpenChange={setIsRoutineMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 max-w-full gap-2 border-none px-2 text-xl font-semibold select-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <TruncatedText width="240px">{routine.title}</TruncatedText>
                <ChevronDownIcon
                  className={`transition ${isRoutineMenuOpen ? "-rotate-180" : ""}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              <DropdownMenuLabel className="flex items-center justify-between gap-6 font-normal text-muted-foreground">
                <span>{t("workspace.fields.nodeCount")}</span>
                <span className="text-foreground">{nodes.length}</span>
              </DropdownMenuLabel>
              <DropdownMenuLabel className="flex items-center justify-between gap-6 font-normal text-muted-foreground">
                <span>{t("workspace.fields.edgeCount")}</span>
                <span className="text-foreground">{edges.length}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center justify-between gap-6 font-normal text-muted-foreground">
                <span>{t("workspace.fields.storage")}</span>
                <span className="text-foreground">{storageStatus}</span>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <RoutineTaskDependencyGraphToolbar
          isAddMenuOpen={isAddMenuOpen}
          isRetryingSync={isRetryingSync}
          isSaving={isSaving}
          pendingSyncCount={pendingSyncCount}
          onAddMenuOpenChange={setIsAddMenuOpen}
          onOpenCreateRoutineTaskDialog={openCreateRoutineTaskDialog}
          canAddStartingNode={
            routineTasks.filter(task => task.kind === "Start").length < 16 &&
            !createNode.isPending
          }
          onAddStartingNode={() => {
            void (async () => {
              try {
                const response = await createNode.mutateAsync({
                  header: getClientRequestHeaders(navigator.userAgent),
                  body: {
                    routineId,
                    kind: "Start",
                    title: t("workspace.fields.startingNode"),
                    payload: {
                      schemaVersion: 1,
                      isActive: true,
                      description: "",
                    },
                    x: 0,
                    y: 0,
                    expectedDefinitionVersion: definitionVersion,
                  },
                });
                if (!response.success)
                  toast.info(t("workspace.fields.pendingSync"));
                setReloadVersion(version => version + 1);
              } catch (error) {
                toast.error(tError(error, t));
              }
            })();
          }}
          onRetryPendingSync={() => void handleRetryPendingSync()}
          onExport={handleExport}
        />
      </header>
      {station && (
        <div className="flex h-[calc(var(--app-navigation-height)-var(--app-toolbar-height))] w-full shrink-0 items-center gap-3 overflow-x-auto whitespace-nowrap border-b border-sidebar-border bg-inset px-4 text-sm [&>span]:shrink-0">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-secondary-foreground/80">
            <span className="max-w-64 truncate">{station.name}</span>
          </span>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
          <span className="text-muted-foreground">
            {routine.phase ? t(routinePhaseTKeys[routine.phase]) : "—"}
          </span>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <RoutineTaskStatusDot status={RoutineTaskRecordStatus.Running} />
            <span>
              {t(routineTaskRecordStatusTKeys[RoutineTaskRecordStatus.Running])}
              : {activeRoutineTaskCount}
            </span>
          </span>
          {routineTaskStatusCounts.map(({ status, count }) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 text-muted-foreground"
            >
              <RoutineTaskStatusDot status={status} />
              <span>
                {t(routineTaskRecordStatusTKeys[status])}: {count}
              </span>
            </span>
          ))}
        </div>
      )}

      <section className="routine-task-dependency-graph relative min-h-0 flex-1">
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
          onEdgeClick={(event, edge) => {
            const bounds = event.currentTarget
              .closest("section")
              ?.getBoundingClientRect();
            if (!bounds) return;
            setEdgeMenu({
              id: edge.id,
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            });
          }}
          onEdgesChange={handleEdgesChange}
          onMiniMapVisibilityChange={setIsMiniMapVisible}
          onNodesChange={handleNodesChange}
          onPaneClick={() => {
            setSelectedEdgeId(null);
            setEdgeMenu(null);
          }}
        />
        <DropdownMenu
          open={edgeMenu !== null}
          onOpenChange={open => {
            if (!open) setEdgeMenu(null);
          }}
        >
          {/* SVG edge clicks are anchored outside the zoomed viewport. */}
          <DropdownMenuTrigger
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none absolute size-px opacity-0"
            style={{ left: edgeMenu?.x ?? 0, top: edgeMenu?.y ?? 0 }}
          />
          <DropdownMenuContent
            align="start"
            onClick={event => event.stopPropagation()}
            onCloseAutoFocus={event => event.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={() => {
                if (edgeMenu) setSelectedEdgeId(edgeMenu.id);
              }}
            >
              <SquarePen />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (!edgeMenu) return;
                if (selectedEdgeId === edgeMenu.id) setSelectedEdgeId(null);
                void handleEdgesChange([{ type: "remove", id: edgeMenu.id }]);
              }}
            >
              <Trash2 />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </main>
  );
};

export default RoutineTaskDependencyGraphEditor;
