import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicError } from "@shared/api/exceptions/errors";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  RoutinePhase,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";
import {
  addEdge,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  MarkerType,
  type Node,
  type NodeChange,
  Position,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import type { UUID } from "crypto";
import { eq } from "drizzle-orm";
import {
  createContext,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { localDB } from "@/api/local/db";
import {
  Routine,
  RoutineTaskDependencyGraphDraft,
  type RoutineTaskDependencyGraphDraftEdge,
  type RoutineTaskDependencyGraphDraftNode,
} from "@/api/local/schemas";
import { RoutineTaskLocalSimulator } from "@/api/local/simulators/routineTask.simulator";
import { useLoading } from "@/hooks/useLoading";
import { useStationRoutine } from "@/hooks/useStationRoutine";
import { useTransactionSynchronizer } from "@/hooks/useTransactionSynchronizer";

export interface RoutineTaskGraphNodeData extends Record<string, unknown> {
  title: string;
  kind: "Start" | "Action";
  payload: Record<string, unknown>;
  expectedDefinitionVersion?: number;
  onUpdated?: (values: {
    title?: string;
    payload?: Record<string, unknown>;
  }) => Promise<void>;
  executionStatus?: RoutineTaskRecordStatus | null;
  routinePhase?: RoutinePhase | null;
  onEdit?: () => void;
  onDeleted?: () => void | Promise<void>;
}

export type RoutineTaskGraphNode = Node<
  RoutineTaskGraphNodeData,
  "routineTask"
>;

type GraphNode = Pick<
  RoutineTaskGraphNode,
  "id" | "position" | "measured" | "data"
>;

const getNodeBounds = (node: GraphNode) => {
  const width = node.measured?.width ?? 0;
  const height = node.measured?.height ?? 0;
  // Start titles extend outside the measured 5rem circle (12rem label, 1.75rem above).
  const labelWidth = node.data.kind === "Start" ? width * 2.4 : width;
  const labelHeight = node.data.kind === "Start" ? width * 0.35 : 0;
  return {
    x: node.position.x - (labelWidth - width) / 2,
    y: node.position.y - labelHeight,
    width: labelWidth,
    height: height + labelHeight,
    offsetX: (labelWidth - width) / 2,
    offsetY: labelHeight,
  };
};

export const hasGraphOverlap = (nodes: GraphNode[]): boolean => {
  const bounds = nodes.map(getNodeBounds);
  for (let index = 0; index < bounds.length; index++) {
    const left = bounds[index];
    for (let other = index + 1; other < bounds.length; other++) {
      const right = bounds[other];
      if (
        left.width > 0 &&
        left.height > 0 &&
        right.width > 0 &&
        right.height > 0 &&
        left.x < right.x + right.width &&
        left.x + left.width > right.x &&
        left.y < right.y + right.height &&
        left.y + left.height > right.y
      )
        return true;
    }
  }
  return false;
};

export const realignGraph = (
  nodes: GraphNode[],
  edges: Array<{ source: string; target: string }>
): Array<{ id: string; position: { x: number; y: number } }> | null => {
  if (nodes.length === 0) return [];
  if (nodes.some(node => !node.measured?.width || !node.measured?.height))
    return null;
  const graph = nodes.map(node => ({
    node,
    bounds: getNodeBounds(node),
    parents: new Set<string>(),
    children: new Set<string>(),
    rank: 0,
    order: 0,
  }));
  const entries = new Map(graph.map(entry => [entry.node.id, entry]));
  for (const edge of edges) {
    const source = entries.get(edge.source);
    const target = entries.get(edge.target);
    if (!source || !target) return null;
    source.children.add(edge.target);
    target.parents.add(edge.source);
  }
  const ids = [...entries.keys()].sort();
  const remaining = new Map(ids.map(id => [id, entries.get(id)!.parents.size]));
  const ready = ids.filter(id => remaining.get(id) === 0);
  for (let index = 0; index < ready.length; index++) {
    const current = entries.get(ready[index])!;
    for (const id of current.children) {
      const child = entries.get(id)!;
      child.rank = Math.max(child.rank, current.rank + 1);
      remaining.set(id, remaining.get(id)! - 1);
      if (remaining.get(id) === 0) ready.push(id);
    }
  }
  if (ready.length !== nodes.length) return null;

  let originY = 0;
  const placed = new Set<string>();
  const positions: Array<{ id: string; position: { x: number; y: number } }> =
    [];
  for (const id of ids) {
    if (placed.has(id)) continue;
    const component = [id];
    placed.add(id);
    for (let index = 0; index < component.length; index++) {
      const entry = entries.get(component[index])!;
      for (const neighbor of [...entry.parents, ...entry.children]) {
        if (placed.has(neighbor)) continue;
        placed.add(neighbor);
        component.push(neighbor);
      }
    }
    const layers = new Map<number, typeof graph>();
    for (const nodeId of component) {
      const entry = entries.get(nodeId)!;
      const layer = layers.get(entry.rank) ?? [];
      layer.push(entry);
      layers.set(entry.rank, layer);
    }
    const columns = [...layers.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, layer]) => layer);
    const componentHeight = Math.max(
      ...columns.map(
        column =>
          column.reduce((height, entry) => height + entry.bounds.height, 0) +
          (column.length - 1) * 48
      )
    );
    let x = 0;
    for (const column of columns) {
      for (const entry of column) {
        entry.order =
          entry.parents.size > 0
            ? [...entry.parents]
                .sort()
                .reduce((sum, parent) => sum + entries.get(parent)!.order, 0) /
              entry.parents.size
            : entry.node.data.kind === "Start"
              ? -1
              : 0;
      }
      column.sort(
        (left, right) =>
          left.order - right.order || (left.node.id < right.node.id ? -1 : 1)
      );
      const columnHeight =
        column.reduce((height, entry) => height + entry.bounds.height, 0) +
        (column.length - 1) * 48;
      let y = originY + (componentHeight - columnHeight) / 2;
      column.forEach((entry, index) => {
        positions.push({
          id: entry.node.id,
          position: {
            x: x + entry.bounds.offsetX,
            y: y + entry.bounds.offsetY,
          },
        });
        entry.order = (index + 0.5) / column.length;
        y += entry.bounds.height + 48;
      });
      x += Math.max(...column.map(entry => entry.bounds.width)) + 96;
    }
    originY += componentHeight + 96;
  }
  return positions.some(
    node => node.position.x > 1000000 || node.position.y > 1000000
  )
    ? null
    : positions;
};

export const getRoutineTaskDependencyEdgeId = (
  previousRoutineTaskId: string,
  routineTaskId: string
) => `${previousRoutineTaskId}->${routineTaskId}`;

export const getRoutineTaskDependencyEdges = (
  dependencies: RoutineTaskDependency[]
): Edge[] =>
  dependencies.map(dependency => ({
    id: getRoutineTaskDependencyEdgeId(
      dependency.previousRoutineTaskId,
      dependency.routineTaskId
    ),
    source: dependency.previousRoutineTaskId,
    target: dependency.routineTaskId,
    data: {
      description: dependency.description,
      progress: dependency.progress,
    },
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

export const hasRoutineTaskDependencyEdge = (
  edges: Edge[],
  source: string,
  target: string
) => edges.some(edge => edge.source === source && edge.target === target);

export const isRoutineTaskDependencyInRoutine = (
  routineTaskIds: ReadonlySet<string>,
  source: string,
  target: string
) => routineTaskIds.has(source) && routineTaskIds.has(target);

export const hasRoutineTaskDependencyCycle = (
  edges: Edge[],
  source: string,
  target: string
): boolean => {
  if (source === target) return true;

  const pendingTaskIds = [target];
  const visitedTaskIds = new Set<string>();
  while (pendingTaskIds.length > 0) {
    const taskId = pendingTaskIds.pop();
    if (!taskId || visitedTaskIds.has(taskId)) continue;
    if (taskId === source) return true;
    visitedTaskIds.add(taskId);

    for (const edge of edges) {
      if (edge.source === taskId) pendingTaskIds.push(edge.target);
    }
  }

  return false;
};

export const mergePendingRoutineTaskDependencyEdges = (
  edges: Edge[],
  draftEdges: RoutineTaskDependencyGraphDraftEdge[] | undefined
): Edge[] => {
  const unsyncedEdges = draftEdges?.filter(
    edge => edge.syncStatus === "pending" || edge.syncStatus === "invalid"
  );
  if (!unsyncedEdges || unsyncedEdges.length === 0) return edges;

  const edgeMap = new Map(edges.map(edge => [edge.id, edge]));
  for (const unsyncedEdge of unsyncedEdges) {
    if (unsyncedEdge.operation === "delete") {
      edgeMap.delete(unsyncedEdge.id);
      continue;
    }

    const existingEdge = edgeMap.get(unsyncedEdge.id);
    if (existingEdge) {
      edgeMap.set(unsyncedEdge.id, {
        ...existingEdge,
        data: {
          description: unsyncedEdge.description ?? "",
          progress: unsyncedEdge.progress ?? 0,
        },
      });
      continue;
    }

    edgeMap.set(unsyncedEdge.id, {
      id: unsyncedEdge.id,
      source: unsyncedEdge.source,
      target: unsyncedEdge.target,
      data: {
        description: unsyncedEdge.description ?? "",
        progress: unsyncedEdge.progress ?? 0,
      },
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
    });
  }

  return Array.from(edgeMap.values());
};

export interface RoutineTaskDependencyGraphDraftData {
  nodes: RoutineTaskDependencyGraphDraftNode[];
  edges: RoutineTaskDependencyGraphDraftEdge[];
  updatedAt: Date;
}

interface RoutineTaskDependencyGraphDraftProviderProps {
  children: ReactNode;
  routineId: UUID;
}

export interface RoutineTaskDependencyGraphDraftContextType {
  routine: ReturnType<ReturnType<typeof useStationRoutine>["getRoutineById"]>;
  nodes: RoutineTaskGraphNode[];
  edges: Edge[];
  definitionVersion: number;
  isDirty: boolean;
  isLoading: boolean;
  isRetryingSync: boolean;
  isRealigning: boolean;
  isSaving: boolean;
  isUpdatingDependency: boolean;
  canRealign: boolean;
  canAddStartingNode: boolean;
  pendingSyncCount: number;
  invalidMutationCount: number;
  selectedEdgeId: string | null;
  selectedDependency: RoutineTaskDependency | null;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  dependencyDescription: string;
  setDependencyDescription: Dispatch<SetStateAction<string>>;
  dependencyProgress: number;
  setDependencyProgress: Dispatch<SetStateAction<number>>;
  reload: () => void;
  createStartingNode: () => Promise<void>;
  connectDependency: (connection: Connection) => Promise<void>;
  changeEdges: (changes: EdgeChange[]) => Promise<void>;
  changeNodes: (changes: NodeChange<RoutineTaskGraphNode>[]) => Promise<void>;
  updateDependency: () => Promise<void>;
  retryPendingSync: () => Promise<void>;
  realign: () => Promise<boolean>;
  draft: RoutineTaskDependencyGraphDraftData | null | undefined;
  loadDraft: () => Promise<RoutineTaskDependencyGraphDraftData | null>;
  saveDraft: (
    draft: Omit<RoutineTaskDependencyGraphDraftData, "updatedAt">
  ) => Promise<void>;
}

export const RoutineTaskDependencyGraphDraftContext = createContext<
  RoutineTaskDependencyGraphDraftContextType | undefined
>(undefined);

export const RoutineTaskDependencyGraphDraftProvider = ({
  children,
  routineId,
}: RoutineTaskDependencyGraphDraftProviderProps) => {
  const { t, i18n } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const transactionSynchronizer = useTransactionSynchronizer();
  const { startAsyncTransactionLoading } = useLoading();
  const [draft, setDraft] = useState<
    RoutineTaskDependencyGraphDraftData | null | undefined
  >(undefined);

  useEffect(() => {
    setDraft(undefined);
  }, [routineId]);

  const loadDraft = useCallback(async () => {
    if (!localDB.isEnabled) {
      setDraft(null);
      return null;
    }
    if (!localDB.isReady) await localDB.ensureReady();

    const [storedDraft] = await localDB
      .select()
      .from(RoutineTaskDependencyGraphDraft)
      .where(eq(RoutineTaskDependencyGraphDraft.routineId, routineId))
      .limit(1);
    if (!storedDraft) {
      setDraft(null);
      return null;
    }

    let nodes: RoutineTaskDependencyGraphDraftNode[];
    let edges: RoutineTaskDependencyGraphDraftEdge[];
    try {
      const parsedNodes: unknown = JSON.parse(storedDraft.nodes);
      const parsedEdges: unknown = JSON.parse(storedDraft.edges);
      if (!Array.isArray(parsedNodes) || !Array.isArray(parsedEdges)) {
        setDraft(null);
        return null;
      }
      nodes = parsedNodes as RoutineTaskDependencyGraphDraftNode[];
      edges = parsedEdges as RoutineTaskDependencyGraphDraftEdge[];
    } catch (error) {
      console.warn(
        "Ignoring invalid local routine task dependency graph draft.",
        error
      );
      setDraft(null);
      return null;
    }

    const nextDraft = {
      nodes,
      edges,
      updatedAt: storedDraft.updatedAt,
    };
    setDraft(nextDraft);
    return nextDraft;
  }, [routineId]);

  const saveDraft = useCallback(
    async (
      nextDraft: Omit<RoutineTaskDependencyGraphDraftData, "updatedAt">
    ) => {
      setDraft({ ...nextDraft, updatedAt: new Date() });
      if (!localDB.isEnabled) {
        throw new Error("local graph draft persistence is disabled");
      }
      if (!localDB.isReady) await localDB.ensureReady();

      await localDB
        .insert(RoutineTaskDependencyGraphDraft)
        .values({
          routineId,
          nodes: JSON.stringify(nextDraft.nodes),
          edges: JSON.stringify(nextDraft.edges),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: RoutineTaskDependencyGraphDraft.routineId,
          set: {
            nodes: JSON.stringify(nextDraft.nodes),
            edges: JSON.stringify(nextDraft.edges),
            updatedAt: new Date(),
          },
        });
    },
    [routineId]
  );

  const localDraft = draft;
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
  const [nodes, setNodes, onNodesChange] = useNodesState<RoutineTaskGraphNode>(
    []
  );
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
  const [isRealigning, setIsRealigning] = useState(false);
  const realigning = useRef(false);
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

  const updateNodePositions = useCallback(async () => {
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
      void updateNodePositions();
    },
    [updateNodePositions]
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

  const graphNodes = useMemo<RoutineTaskGraphNode[]>(
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
      const errorKey =
        error instanceof NotegicError &&
        error.getPresentation &&
        i18n.exists(error.getPresentation)
          ? error.getPresentation
          : error instanceof NotegicAPIError ||
              error instanceof NotegicValidationError
            ? i18n.exists(`server.error.${error.unWrap.reason}`)
              ? `server.error.${error.unWrap.reason}`
              : "error.encounterUnknownError"
            : error instanceof Error && i18n.exists(error.message)
              ? error.message
              : "error.encounterUnknownError";
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
        const errorKey =
          error instanceof NotegicError &&
          error.getPresentation &&
          i18n.exists(error.getPresentation)
            ? error.getPresentation
            : error instanceof NotegicAPIError ||
                error instanceof NotegicValidationError
              ? i18n.exists(`server.error.${error.unWrap.reason}`)
                ? `server.error.${error.unWrap.reason}`
                : "error.encounterUnknownError"
              : error instanceof Error && i18n.exists(error.message)
                ? error.message
                : "error.encounterUnknownError";
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
    changes: NodeChange<RoutineTaskGraphNode>[]
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
      positionTimer.current = setTimeout(() => void updateNodePositions(), 750);
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
      await updateNodePositions();
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
          const errorKey =
            error.getPresentation && i18n.exists(error.getPresentation)
              ? error.getPresentation
              : i18n.exists(`server.error.${error.unWrap.reason}`)
                ? `server.error.${error.unWrap.reason}`
                : "error.encounterUnknownError";
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
      const errorKey =
        error instanceof NotegicError &&
        error.getPresentation &&
        i18n.exists(error.getPresentation)
          ? error.getPresentation
          : error instanceof NotegicAPIError ||
              error instanceof NotegicValidationError
            ? i18n.exists(`server.error.${error.unWrap.reason}`)
              ? `server.error.${error.unWrap.reason}`
              : "error.encounterUnknownError"
            : error instanceof Error && i18n.exists(error.message)
              ? error.message
              : "error.encounterUnknownError";
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
  const canRealign =
    !isSaving &&
    !isRealigning &&
    !createNode.isPending &&
    !updateNode.isPending &&
    pendingPositions.current.size === 0 &&
    routineTaskDependencies !== undefined &&
    nodes.length === routineTasks.length &&
    nodes.every(
      node => !node.dragging && node.measured?.width && node.measured?.height
    ) &&
    hasGraphOverlap(nodes);

  const realign = async () => {
    if (!canRealign || realigning.current) return false;
    realigning.current = true;
    setIsRealigning(true);
    try {
      const positions = realignGraph(nodes, edges);
      if (!positions) {
        toast.error(t("workspace.graph.realignError"));
        return false;
      }
      const nextPositions = new Map(
        positions.map(node => [node.id, node.position])
      );
      const nextNodes = nodes.map(node => ({
        ...node,
        position: nextPositions.get(node.id)!,
      }));
      await saveDraft({
        nodes: positions,
        edges: localDraft?.edges ?? [],
      });
      for (const node of nextNodes) {
        const previous = nodes.find(previous => previous.id === node.id)!;
        if (
          node.position.x === previous.position.x &&
          node.position.y === previous.position.y
        )
          continue;
        pendingPositions.current.set(node.id, {
          ...node.position,
          expectedDefinitionVersion: definitionVersion,
        });
      }
      setNodes(nextNodes);
      setIsDirty(true);
      await updateNodePositions();
      return true;
    } catch (error) {
      toast.error(tError(error, t));
      return false;
    } finally {
      realigning.current = false;
      setIsRealigning(false);
    }
  };
  const createStartingNode = async () => {
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
      if (!response.success) toast.info(t("workspace.fields.pendingSync"));
      setReloadVersion(version => version + 1);
    } catch (error) {
      toast.error(tError(error, t));
    }
  };

  return (
    <RoutineTaskDependencyGraphDraftContext.Provider
      value={{
        draft,
        loadDraft,
        saveDraft,
        routine,
        nodes,
        edges,
        definitionVersion,
        isDirty,
        isLoading,
        isRetryingSync,
        isRealigning,
        isSaving,
        isUpdatingDependency: updateDependency.isPending,
        canRealign,
        canAddStartingNode:
          routineTasks.filter(task => task.kind === "Start").length < 16 &&
          !createNode.isPending,
        pendingSyncCount,
        invalidMutationCount,
        selectedEdgeId,
        selectedDependency,
        setSelectedEdgeId,
        dependencyDescription,
        setDependencyDescription,
        dependencyProgress,
        setDependencyProgress,
        reload: () => setReloadVersion(version => version + 1),
        createStartingNode,
        connectDependency: handleConnect,
        changeEdges: handleEdgesChange,
        changeNodes: handleNodesChange,
        updateDependency: handleUpdateDependency,
        retryPendingSync: handleRetryPendingSync,
        realign,
      }}
    >
      {children}
    </RoutineTaskDependencyGraphDraftContext.Provider>
  );
};
