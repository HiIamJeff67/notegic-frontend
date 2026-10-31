import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import {
  RoutinePhase,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import {
  type CreateRoutineTaskByRoutineIdRequest,
  type GetMyRoutineTaskByIdResponse,
  parseRoutineTaskDefinition,
  RoutineTaskDefinitionSchema,
} from "@shared/api/interfaces/routineTask.interface";
import type {
  RoutineTaskDependency,
  UpdateRoutineTaskGraphByRoutineIdRequest,
  UpdateRoutineTaskGraphByRoutineIdResponse,
} from "@shared/api/interfaces/routineTaskDependency.interface";
import { UpdateRoutineTaskGraphByRoutineIdResponseSchema } from "@shared/api/interfaces/routineTaskDependency.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast/toast";
import { replaceEqualDeep } from "@tanstack/react-query";
import {
  type Connection,
  type Edge,
  type EdgeChange,
  MarkerType,
  type Node,
  type NodeChange,
  Position,
  useNodesState,
} from "@xyflow/react";
import type { UUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useGetMyRoutineById } from "@/api/hooks/routine.hook";
import { useGetMyRoutineTasksByRoutineId } from "@/api/hooks/routineTask.hook";
import {
  useGetRoutineTaskDependenciesByRoutineId,
  useUpdateRoutineTaskGraphByRoutineId,
} from "@/api/hooks/routineTaskDependency.hook";
import { useGetMyStationById } from "@/api/hooks/station.hook";
import { localDB } from "@/api/local/db";
import {
  RoutineTaskDependencyGraphDraft,
  type RoutineTaskDependencyGraphDraftEdge,
  type RoutineTaskDependencyGraphDraftNode,
  Transaction,
} from "@/api/local/schemas";
import { RoutineTaskDependencyLocalSynchronizer } from "@/api/local/synchronizers/routineTaskDependency.synchronizer";
import { useLoading } from "@/hooks/useLoading";
import { useStationRoutine } from "@/hooks/useStationRoutine";
import { getDefaultStationNode } from "@/providers/StationRoutineProvider/stationNode.type";

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
  onDelete?: () => Promise<void>;
  isSaving?: boolean;
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
    markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
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
      markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
    });
  }

  return Array.from(edgeMap.values());
};

export interface RoutineTaskDependencyGraphDraftData {
  nodes: RoutineTaskDependencyGraphDraftNode[];
  edges: RoutineTaskDependencyGraphDraftEdge[];
  snapshot?: {
    version: 2;
    definitionVersion: number;
    tasks: GetMyRoutineTaskByIdResponse["data"][];
    baselineTasks: GetMyRoutineTaskByIdResponse["data"][];
    baselineEdges: RoutineTaskDependencyGraphDraftEdge[];
    confirmed?: UpdateRoutineTaskGraphByRoutineIdResponse["data"];
  };
  updatedAt: Date;
}

export interface RoutineTaskGraphConflict {
  id: string;
  label: string;
  local: unknown;
  remote: unknown;
}

// Reconcile definitions, never execution status or timestamps, against the saved baseline.
export const reconcileRoutineTaskGraphDraft = (
  draft: RoutineTaskDependencyGraphDraftData,
  remote: UpdateRoutineTaskGraphByRoutineIdResponse["data"],
  choices: Record<string, "local" | "remote"> = {}
) => {
  const snapshot = draft.snapshot;
  if (!snapshot || snapshot.confirmed)
    throw new Error(
      "Cannot reconcile an unverified or already committed draft"
    );
  const conflicts: RoutineTaskGraphConflict[] = [];
  const resolve = <T,>(
    id: string,
    label: string,
    baseline: T,
    local: T,
    latest: T,
    relatedChange = false
  ): T => {
    if (!relatedChange) {
      if (
        replaceEqualDeep(local, latest) === local ||
        replaceEqualDeep(baseline, latest) === baseline
      )
        return local;
      if (replaceEqualDeep(baseline, local) === baseline) return latest;
    }
    conflicts.push({ id, label, local, remote: latest });
    return choices[id] === "remote" ? latest : local;
  };
  const remoteEdges = remote.dependencies.map(edge => ({
    id: getRoutineTaskDependencyEdgeId(
      edge.previousRoutineTaskId,
      edge.routineTaskId
    ),
    source: edge.previousRoutineTaskId,
    target: edge.routineTaskId,
    description: edge.description ?? "",
    progress: edge.progress ?? 0,
  }));
  const localEdges = draft.edges.filter(edge => edge.operation !== "delete");
  const baselineTasks = new Map(
    snapshot.baselineTasks.map(task => [task.id, task])
  );
  const localTasks = new Map(snapshot.tasks.map(task => [task.id, task]));
  const remoteTasks = new Map(remote.tasks.map(task => [task.id, task]));
  const tasks: typeof remote.tasks = [];
  const fields = [
    "title",
    "payload",
    "priority",
    "maxAttempts",
    "x",
    "y",
  ] as const;
  const definition = (task: (typeof remote.tasks)[number] | undefined) =>
    task &&
    Object.fromEntries(
      ["kind", ...fields].map(key => [key, task[key as keyof typeof task]])
    );
  const relatedEdges = (
    edges: RoutineTaskDependencyGraphDraftEdge[],
    id: string
  ) =>
    edges
      .filter(edge => edge.source === id || edge.target === id)
      .map(edge => [edge.id, edge.description ?? "", edge.progress ?? 0])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  for (const id of new Set([
    ...baselineTasks.keys(),
    ...localTasks.keys(),
    ...remoteTasks.keys(),
  ])) {
    const baseline = baselineTasks.get(id);
    const local = localTasks.get(id);
    const latest = remoteTasks.get(id);
    if (!baseline || !local || !latest) {
      const value = resolve(
        `task:${id}`,
        local?.title ?? latest?.title ?? baseline?.title ?? id,
        definition(baseline),
        definition(local),
        definition(latest),
        !!baseline &&
          ((!local &&
            !!latest &&
            JSON.stringify(relatedEdges(snapshot.baselineEdges, id)) !==
              JSON.stringify(relatedEdges(remoteEdges, id))) ||
            (!latest &&
              !!local &&
              JSON.stringify(relatedEdges(snapshot.baselineEdges, id)) !==
                JSON.stringify(relatedEdges(localEdges, id))))
      );
      if (value) tasks.push({ ...(latest ?? local ?? baseline)!, ...value });
      continue;
    }
    const task = { ...latest };
    for (const field of fields)
      Object.assign(task, {
        [field]: resolve(
          `task:${id}:${field}`,
          `${local.title} · ${field}`,
          baseline[field],
          local[field],
          latest[field]
        ),
      });
    tasks.push(task);
  }
  const baselineEdges = new Map(
    snapshot.baselineEdges.map(edge => [edge.id, edge])
  );
  const localById = new Map(localEdges.map(edge => [edge.id, edge]));
  const remoteById = new Map(remoteEdges.map(edge => [edge.id, edge]));
  const taskIds = new Set(tasks.map(task => task.id));
  const edges: RoutineTaskDependencyGraphDraftEdge[] = [];
  const edgeDefinition = (
    edge: RoutineTaskDependencyGraphDraftEdge | undefined
  ) =>
    edge && {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      description: edge.description ?? "",
      progress: edge.progress ?? 0,
    };
  for (const id of new Set([
    ...baselineEdges.keys(),
    ...localById.keys(),
    ...remoteById.keys(),
  ])) {
    const baseline = edgeDefinition(baselineEdges.get(id));
    const local = edgeDefinition(localById.get(id));
    const latest = edgeDefinition(remoteById.get(id));
    const value = resolve(`edge:${id}`, id, baseline, local, latest);
    if (value && taskIds.has(value.source) && taskIds.has(value.target))
      edges.push(value);
  }
  return {
    conflicts,
    draft: {
      nodes: tasks.map(task => ({
        id: task.id,
        position: { x: task.x, y: task.y },
      })),
      edges,
      snapshot: {
        version: 2 as const,
        definitionVersion: remote.definitionVersion,
        tasks,
        baselineTasks: remote.tasks,
        baselineEdges: remoteEdges,
      },
      updatedAt: new Date(),
    },
  };
};

// A baseline diff folds every edit into one final operation per identity.
export const getRoutineTaskGraphChanges = (
  draft: RoutineTaskDependencyGraphDraftData
): UpdateRoutineTaskGraphByRoutineIdRequest["body"] => {
  const snapshot = draft.snapshot;
  if (!snapshot) throw new Error("Graph draft has no definition baseline");
  const tasks: UpdateRoutineTaskGraphByRoutineIdRequest["body"]["tasks"] = {
    creates: [],
    updates: [],
    deletes: [],
  };
  const dependencies: UpdateRoutineTaskGraphByRoutineIdRequest["body"]["dependencies"] =
    { creates: [], updates: [], deletes: [] };
  const baselineTasks = new Map(
    snapshot.baselineTasks.map(task => [task.id, task])
  );
  const currentTasks = new Map(snapshot.tasks.map(task => [task.id, task]));
  for (const task of snapshot.tasks) {
    const baseline = baselineTasks.get(task.id);
    const values = {
      title: task.title,
      payload: task.payload,
      priority: task.priority,
      maxAttempts: task.maxAttempts,
      x: task.x,
      y: task.y,
    };
    if (!baseline) {
      tasks.creates.push({
        id: task.id,
        routineId: task.routineId,
        kind: task.kind,
        ...values,
      });
      continue;
    }
    const changes: UpdateRoutineTaskGraphByRoutineIdRequest["body"]["tasks"]["updates"][number]["values"] =
      {};
    for (const key of [
      "title",
      "payload",
      "priority",
      "maxAttempts",
      "x",
      "y",
    ] as const) {
      if (replaceEqualDeep(baseline[key], values[key]) !== baseline[key])
        Object.assign(changes, { [key]: values[key] });
    }
    if (Object.keys(changes).length)
      tasks.updates.push({ routineTaskId: task.id, values: changes });
  }
  for (const task of snapshot.baselineTasks)
    if (!currentTasks.has(task.id)) tasks.deletes.push(task.id);
  const baselineEdges = new Map(
    snapshot.baselineEdges.map(edge => [edge.id, edge])
  );
  const currentEdges = new Map(
    draft.edges
      .filter(edge => edge.operation !== "delete")
      .map(edge => [edge.id, edge])
  );
  for (const edge of currentEdges.values()) {
    const baseline = baselineEdges.get(edge.id);
    const value = {
      routineTaskId: edge.target,
      previousRoutineTaskId: edge.source,
      description: edge.description ?? "",
      progress: edge.progress ?? 0,
    };
    if (!baseline) dependencies.creates.push(value);
    else if (
      (baseline.description ?? "") !== value.description ||
      (baseline.progress ?? 0) !== value.progress
    )
      dependencies.updates.push(value);
  }
  for (const edge of baselineEdges.values()) {
    if (
      !currentEdges.has(edge.id) &&
      currentTasks.has(edge.source) &&
      currentTasks.has(edge.target)
    )
      dependencies.deletes.push({
        routineTaskId: edge.target,
        previousRoutineTaskId: edge.source,
      });
  }
  return {
    expectedDefinitionVersion: snapshot.definitionVersion,
    tasks,
    dependencies,
  };
};

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
  canEdit: boolean;
  isSavingLayout: boolean;
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
  createTask: (
    body: CreateRoutineTaskByRoutineIdRequest["body"]
  ) => Promise<UUID>;
  editingTask: GetMyRoutineTaskByIdResponse["data"] | null;
  setEditingTaskId: Dispatch<SetStateAction<string | null>>;
  updateTask: (
    id: string,
    values: Partial<
      Pick<
        GetMyRoutineTaskByIdResponse["data"],
        "title" | "payload" | "priority" | "maxAttempts"
      >
    >
  ) => Promise<void>;
  connectDependency: (connection: Connection) => Promise<void>;
  changeEdges: (changes: EdgeChange[]) => Promise<void>;
  changeNodes: (changes: NodeChange<RoutineTaskGraphNode>[]) => Promise<void>;
  updateDependency: () => Promise<void>;
  retryPendingSync: () => Promise<void>;
  saveGraph: () => Promise<boolean>;
  realign: () => Promise<boolean>;
  hasConflict: boolean;
  isReviewing: boolean;
  recovery: { conflicts: RoutineTaskGraphConflict[] } | null;
  reviewGraph: () => Promise<void>;
  resolveConflicts: (
    choices: Record<string, "local" | "remote">
  ) => Promise<boolean>;
  closeRecovery: () => void;
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
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();
  const { startAsyncTransactionLoading } = useLoading();
  const routineQuery = useGetMyRoutineById(undefined, {
    staleTime: 0,
    retry: false,
  });
  const stationQuery = useGetMyStationById();
  const routineTasksQuery = useGetMyRoutineTasksByRoutineId(undefined, {
    staleTime: 0,
    retry: false,
  });
  const dependenciesQuery = useGetRoutineTaskDependenciesByRoutineId({
    staleTime: 0,
    retry: false,
  });
  const updateGraph = useUpdateRoutineTaskGraphByRoutineId();
  const routine = stationRoutineManager.getRoutineById(routineId);
  const [draft, setDraft] =
    useState<RoutineTaskDependencyGraphDraftData | null>();
  const draftRef = useRef<RoutineTaskDependencyGraphDraftData | null>(null);
  const activeRoutine = useRef(routineId);
  activeRoutine.current = routineId;
  const writes = useRef(Promise.resolve());
  const saving = useRef(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<RoutineTaskGraphNode>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRealigning, setIsRealigning] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [dependencyDescription, setDependencyDescription] = useState("");
  const [dependencyProgress, setDependencyProgress] = useState(0);
  const [hasConflict, setHasConflict] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [recovery, setRecovery] = useState<{
    draft: RoutineTaskDependencyGraphDraftData;
    remote: UpdateRoutineTaskGraphByRoutineIdResponse["data"];
    conflicts: RoutineTaskGraphConflict[];
  } | null>(null);

  const readLatestGraph = useCallback(async () => {
    const pending = await localDB
      .select({ sequence: Transaction.sequence })
      .from(Transaction)
      .where(
        sql`json_extract(${Transaction.body}, '$.routineId') = ${routineId} OR json_extract(${Transaction.affected}, '$.routineId') = ${routineId}`
      )
      .limit(1);
    if (pending.length)
      throw new Error(
        t("workspace.notifications.routineDependencyGraphSaveFailed")
      );
    const parent = await routineQuery.fetch({
      header: getClientRequestHeaders(navigator.userAgent),
      param: { routineId },
    });
    if (!parent.success)
      throw new NotegicAPIError(new NotegicException(parent.exception));
    const tasks = await routineTasksQuery.fetch({
      header: getClientRequestHeaders(navigator.userAgent),
      param: { routineId },
    });
    if (!tasks.success)
      throw new NotegicAPIError(new NotegicException(tasks.exception));
    const dependencies = await dependenciesQuery.fetch({
      header: getClientRequestHeaders(navigator.userAgent),
      param: { routineId },
    });
    if (!dependencies.success)
      throw new NotegicAPIError(new NotegicException(dependencies.exception));
    const verified = await routineQuery.fetch({
      header: getClientRequestHeaders(navigator.userAgent),
      param: { routineId },
    });
    if (!verified.success)
      throw new NotegicAPIError(new NotegicException(verified.exception));
    // A mixed read is not a graph baseline; the next Save still performs backend CAS.
    if (parent.data.definitionVersion !== verified.data.definitionVersion)
      throw new NotegicAPIError(
        new NotegicException(
          {
            reason: "DefinitionConflict",
            domain: "Routine",
            operation: "ReadGraph",
            message: "The routine changed while reading its graph",
            retryable: false,
          },
          409
        )
      );
    return {
      definitionVersion: verified.data.definitionVersion,
      tasks: tasks.data,
      dependencies: dependencies.data,
      updatedAt: verified.data.updatedAt,
    };
  }, [routineId]);

  const saveDraft = useCallback(
    (next: Omit<RoutineTaskDependencyGraphDraftData, "updatedAt">) => {
      const value = { ...next, updatedAt: new Date() };
      if (activeRoutine.current === routineId) {
        draftRef.current = value;
        setDraft(value);
      }
      const write = writes.current
        .catch(() => {})
        .then(async () => {
          if (!localDB.isEnabled)
            throw new Error("local graph draft persistence is disabled");
          if (!localDB.isReady) await localDB.ensureReady();
          const row = {
            routineId,
            nodes: JSON.stringify({
              version: 2,
              nodes: value.nodes,
              snapshot: value.snapshot,
            }),
            edges: JSON.stringify(value.edges),
            updatedAt: value.updatedAt,
          };
          await localDB
            .insert(RoutineTaskDependencyGraphDraft)
            .values(row)
            .onConflictDoUpdate({
              target: RoutineTaskDependencyGraphDraft.routineId,
              set: row,
            });
        });
      writes.current = write;
      return write;
    },
    [routineId]
  );

  const loadDraft = useCallback(async () => {
    if (!localDB.isEnabled) return null;
    if (!localDB.isReady) await localDB.ensureReady();
    const [stored] = await localDB
      .select()
      .from(RoutineTaskDependencyGraphDraft)
      .where(eq(RoutineTaskDependencyGraphDraft.routineId, routineId))
      .limit(1);
    if (!stored) return null;
    const content = JSON.parse(stored.nodes);
    const edges: RoutineTaskDependencyGraphDraftEdge[] = JSON.parse(
      stored.edges
    );
    if (
      !Array.isArray(edges) ||
      (!Array.isArray(content) &&
        (content?.version !== 2 || !Array.isArray(content.nodes)))
    )
      throw new Error("Invalid local graph draft");
    const value: RoutineTaskDependencyGraphDraftData = {
      nodes: Array.isArray(content) ? content : content.nodes,
      snapshot: Array.isArray(content) ? undefined : content.snapshot,
      edges,
      updatedAt: stored.updatedAt,
    };
    if (value.snapshot) {
      if (
        value.snapshot.version !== 2 ||
        !Number.isSafeInteger(value.snapshot.definitionVersion) ||
        value.snapshot.definitionVersion < 1 ||
        !Array.isArray(value.snapshot.baselineEdges)
      )
        throw new Error("Invalid graph draft baseline");
      value.snapshot.tasks = RoutineTaskDefinitionSchema.array().parse(
        value.snapshot.tasks
      );
      value.snapshot.baselineTasks = RoutineTaskDefinitionSchema.array().parse(
        value.snapshot.baselineTasks
      );
      if (value.snapshot.confirmed)
        value.snapshot.confirmed =
          UpdateRoutineTaskGraphByRoutineIdResponseSchema.shape.data.parse(
            value.snapshot.confirmed
          );
    }
    if (activeRoutine.current === routineId) {
      draftRef.current = value;
      setDraft(value);
    }
    return value;
  }, [routineId]);

  const reviewGraph = async () => {
    const current = draftRef.current;
    if (!current?.snapshot || current.snapshot.confirmed || saving.current)
      return;
    saving.current = true;
    setIsReviewing(true);
    try {
      const remote = await readLatestGraph();
      if (activeRoutine.current !== routineId) return;
      const result = reconcileRoutineTaskGraphDraft(current, remote);
      if (result.conflicts.length)
        setRecovery({ draft: current, remote, conflicts: result.conflicts });
      else {
        await saveDraft(result.draft);
        setHasConflict(false);
        setRecovery(null);
        toast.info(t("workspace.graph.reviewReady"));
      }
    } catch (error) {
      toast.error(tError(error, t));
    } finally {
      saving.current = false;
      setIsReviewing(false);
    }
  };
  const resolveConflicts = async (
    choices: Record<string, "local" | "remote">
  ) => {
    if (
      !recovery ||
      saving.current ||
      recovery.conflicts.some(conflict => !choices[conflict.id])
    )
      return false;
    saving.current = true;
    setIsReviewing(true);
    try {
      const result = reconcileRoutineTaskGraphDraft(
        recovery.draft,
        recovery.remote,
        choices
      );
      await saveDraft(result.draft);
      if (activeRoutine.current !== routineId) return false;
      setRecovery(null);
      setHasConflict(false);
      toast.info(t("workspace.graph.reviewReady"));
      return true;
    } catch (error) {
      toast.error(tError(error, t));
      return false;
    } finally {
      saving.current = false;
      setIsReviewing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    draftRef.current = null;
    setDraft(undefined);
    setIsLoading(true);
    setNodes([]);
    setEditingTaskId(null);
    setSelectedEdgeId(null);
    setHasConflict(false);
    setRecovery(null);
    const load = async () => {
      try {
        await writes.current;
        const stored = await loadDraft();
        if (cancelled) return;
        const cached = stationRoutineManager.getRoutineById(routineId);
        if (
          stored?.snapshot &&
          !stored.snapshot.confirmed &&
          cached?.definitionVersion !== undefined &&
          cached.definitionVersion > stored.snapshot.definitionVersion
        ) {
          try {
            const remote = await readLatestGraph();
            if (cancelled) return;
            if (
              remote.definitionVersion !== stored.snapshot.definitionVersion
            ) {
              const result = reconcileRoutineTaskGraphDraft(stored, remote);
              if (result.conflicts.length) setHasConflict(true);
              else await saveDraft(result.draft);
            }
          } catch (error) {
            // Opening an offline draft must never discard or replace it.
            if (!cancelled)
              console.warn("Could not verify graph draft baseline", error);
          }
        }
        if (
          stored?.snapshot &&
          cached &&
          stationRoutineManager.getStationById(cached.stationId)
        )
          return;
        const request = {
          header: getClientRequestHeaders(navigator.userAgent),
          param: { routineId },
        };
        const parent = await routineQuery.fetch(request);
        if (cancelled) return;
        const stationId = parent.data.stationId as UUID;
        if (!stationRoutineManager.getStationById(stationId)) {
          const station = await stationQuery.fetch({
            header: getClientRequestHeaders(navigator.userAgent),
            param: { stationId },
          });
          if (cancelled) return;
          stationRoutineManager.upsertStationNode({
            ...getDefaultStationNode(stationId),
            ...station.data,
            id: stationId,
          });
        }
        const cachedRoutine = stationRoutineManager.getRoutineById(routineId);
        stationRoutineManager.upsertRoutineNode({
          id: parent.data.id as UUID,
          stationId,
          title: parent.data.title,
          description: parent.data.description,
          phase: parent.data.phase,
          isActive: parent.data.isActive,
          definitionVersion: parent.data.definitionVersion,
          isPinned: parent.data.isPinned,
          scheduledStartAt: parent.data.scheduledStartAt,
          scheduledEndAt: parent.data.scheduledEndAt,
          period: parent.data.period,
          timezone: parent.data.timezone,
          deletedAt: parent.data.deletedAt,
          updatedAt: parent.data.updatedAt,
          createdAt: parent.data.createdAt,
          isOpen: cachedRoutine?.isOpen ?? false,
          isExpanded: cachedRoutine?.isExpanded ?? false,
          routineTagIds: parent.data.tagIds as UUID[],
          routineTaskIds: parent.data.taskIds as UUID[],
          itemIds: parent.data.itemIds as UUID[],
          routineTasks: cachedRoutine?.routineTasks ?? [],
          admissionState: parent.data.admissionState,
        });
        if (stored?.snapshot) {
          if (
            !stored.snapshot.confirmed &&
            parent.data.definitionVersion !== stored.snapshot.definitionVersion
          )
            setHasConflict(true);
          return;
        }
        const tasks = await routineTasksQuery.fetch(request);
        const dependencies = await dependenciesQuery.fetch(request);
        if (cancelled) return;
        const baselineEdges = dependencies.data.map(edge => ({
          id: getRoutineTaskDependencyEdgeId(
            edge.previousRoutineTaskId,
            edge.routineTaskId
          ),
          source: edge.previousRoutineTaskId,
          target: edge.routineTaskId,
          description: edge.description,
          progress: edge.progress,
        }));
        const currentTasks = tasks.data.map(task => {
          const position = stored?.nodes.find(
            node => node.id === task.id && node.isDirty
          )?.position;
          return position ? { ...task, ...position } : task;
        });
        const legacyEdges = mergePendingRoutineTaskDependencyEdges(
          getRoutineTaskDependencyEdges(dependencies.data),
          stored?.edges
        ).map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          description: (edge.data?.description as string) ?? "",
          progress: (edge.data?.progress as number) ?? 0,
        }));
        await saveDraft({
          nodes: currentTasks.map(task => ({
            id: task.id,
            position: { x: task.x, y: task.y },
          })),
          edges: legacyEdges,
          snapshot: {
            version: 2,
            definitionVersion: parent.data.definitionVersion,
            tasks: currentTasks,
            baselineTasks: tasks.data,
            baselineEdges,
          },
        });
      } catch (error) {
        if (!cancelled) {
          console.error("failed to load routine task dependency graph", error);
          toast.error(tError(error, t));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void startAsyncTransactionLoading(load);
    return () => {
      cancelled = true;
    };
  }, [
    routineId,
    reloadVersion,
    loadDraft,
    saveDraft,
    readLatestGraph,
    startAsyncTransactionLoading,
  ]);

  const updateTask = async (
    id: string,
    values: Partial<
      Pick<
        GetMyRoutineTaskByIdResponse["data"],
        "title" | "payload" | "priority" | "maxAttempts"
      >
    >
  ) => {
    const current = draftRef.current;
    if (!current?.snapshot || saving.current || current.snapshot.confirmed)
      return;
    const existing = current.snapshot.tasks.find(task => task.id === id);
    if (!existing) return;
    const definition = parseRoutineTaskDefinition({
      ...existing,
      ...values,
      routineId,
    });
    const tasks = current.snapshot.tasks.map(task =>
      task.id === id ? { ...task, ...definition } : task
    );
    await saveDraft({ ...current, snapshot: { ...current.snapshot, tasks } });
  };
  const deleteTask = async (id: string) => {
    const current = draftRef.current;
    if (!current?.snapshot || saving.current || current.snapshot.confirmed)
      return;
    await saveDraft({
      ...current,
      nodes: current.nodes.filter(node => node.id !== id),
      edges: current.edges.filter(
        edge => edge.source !== id && edge.target !== id
      ),
      snapshot: {
        ...current.snapshot,
        tasks: current.snapshot.tasks.filter(task => task.id !== id),
      },
    });
  };
  const createTask = async (
    body: CreateRoutineTaskByRoutineIdRequest["body"]
  ): Promise<UUID> => {
    const current = draftRef.current;
    if (!current?.snapshot || saving.current || current.snapshot.confirmed)
      throw new Error("Graph is not editable");
    const definition = parseRoutineTaskDefinition({ ...body, routineId });
    const id = definition.id ?? crypto.randomUUID();
    if (current.snapshot.baselineTasks.some(task => task.id === id))
      throw new Error("Task already exists in the graph baseline");
    const existing = current.snapshot.tasks.find(task => task.id === id);
    const task: GetMyRoutineTaskByIdResponse["data"] = {
      ...definition,
      id,
      x: body.x ?? existing?.x ?? definition.x,
      y: body.y ?? existing?.y ?? definition.y,
      kind: definition.kind,
      priority: definition.priority ?? 0,
      maxAttempts: definition.maxAttempts ?? 1,
      previousRoutineTaskIds: [],
      updatedAt: new Date(),
      createdAt: existing?.createdAt ?? new Date(),
    };
    await saveDraft({
      ...current,
      nodes: [
        ...current.nodes.filter(node => node.id !== id),
        { id: task.id, position: { x: task.x, y: task.y } },
      ],
      snapshot: {
        ...current.snapshot,
        tasks: [...current.snapshot.tasks.filter(node => node.id !== id), task],
      },
    });
    return task.id as UUID;
  };

  const graphNodes = useMemo<RoutineTaskGraphNode[]>(
    () =>
      (draft?.snapshot?.tasks ?? []).map(task => ({
        id: task.id,
        type: "routineTask",
        position: { x: task.x, y: task.y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          kind: task.kind,
          title: task.title,
          payload: task.payload,
          expectedDefinitionVersion: draft?.snapshot?.definitionVersion,
          isSaving: isSaving || !!draft?.snapshot?.confirmed,
          executionStatus: routine?.routineTasks.find(
            node => node.id === task.id
          )?.executionStatus,
          routinePhase: routine?.phase,
          onEdit: () => {
            if (!saving.current && !draftRef.current?.snapshot?.confirmed)
              setEditingTaskId(task.id);
          },
          onUpdated: values => updateTask(task.id, values),
          onDelete: () => deleteTask(task.id),
        },
      })),
    [draft, routine, isSaving]
  );
  useEffect(() => {
    setNodes(current =>
      graphNodes.map(node => ({
        ...current.find(value => value.id === node.id),
        ...node,
      }))
    );
  }, [graphNodes, setNodes]);
  const edges: Edge[] = (draft?.edges ?? [])
    .filter(edge => edge.operation !== "delete")
    .map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: {
        description: edge.description ?? "",
        progress: edge.progress ?? 0,
      },
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
    }));
  const selectedEdge = draft?.edges.find(edge => edge.id === selectedEdgeId);
  const selectedDependency: RoutineTaskDependency | null = selectedEdge
    ? {
        routineTaskId: selectedEdge.target,
        previousRoutineTaskId: selectedEdge.source,
        description: selectedEdge.description ?? "",
        progress: selectedEdge.progress ?? 0,
        updatedAt: draft!.updatedAt,
        createdAt: draft!.updatedAt,
      }
    : null;
  useEffect(() => {
    setDependencyDescription(selectedEdge?.description ?? "");
    setDependencyProgress(selectedEdge?.progress ?? 0);
  }, [selectedEdgeId, selectedEdge?.description, selectedEdge?.progress]);
  const changes = draft?.snapshot ? getRoutineTaskGraphChanges(draft) : null;
  const isDirty =
    !!draft?.snapshot?.confirmed ||
    (!!changes &&
      [changes.tasks, changes.dependencies].some(
        group =>
          group.creates.length + group.updates.length + group.deletes.length > 0
      ));
  const canRealign =
    !isSaving &&
    !draft?.snapshot?.confirmed &&
    !isRealigning &&
    nodes.length > 0 &&
    nodes.every(
      node => !node.dragging && node.measured?.width && node.measured?.height
    ) &&
    hasGraphOverlap(nodes);

  const saveGraph = async (): Promise<boolean> => {
    const current = draftRef.current;
    if (!current?.snapshot || saving.current || hasConflict || recovery)
      return false;
    saving.current = true;
    setIsSaving(true);
    try {
      await saveDraft(current);
      const request = {
        header: getClientRequestHeaders(navigator.userAgent),
        param: { routineId },
        body: getRoutineTaskGraphChanges(current),
      };
      let confirmed = current.snapshot.confirmed;
      if (!confirmed) {
        if (
          routine?.definitionVersion !== undefined &&
          routine.definitionVersion > current.snapshot.definitionVersion
        ) {
          const remote = await readLatestGraph();
          if (activeRoutine.current !== routineId) return false;
          if (remote.definitionVersion !== current.snapshot.definitionVersion) {
            const result = reconcileRoutineTaskGraphDraft(current, remote);
            if (result.conflicts.length) {
              setHasConflict(true);
              setRecovery({
                draft: current,
                remote,
                conflicts: result.conflicts,
              });
            } else {
              await saveDraft(result.draft);
              toast.info(t("workspace.graph.reviewReady"));
            }
            return false;
          }
        }
        const pending = await localDB
          .select({ sequence: Transaction.sequence })
          .from(Transaction)
          .where(
            sql`json_extract(${Transaction.body}, '$.routineId') = ${routineId} OR json_extract(${Transaction.affected}, '$.routineId') = ${routineId}`
          )
          .limit(1);
        if (pending.length) {
          toast.info(
            t("workspace.notifications.routineDependencyGraphSaveFailed")
          );
          return false;
        }
        const response = await updateGraph.mutateAsync(request);
        if (!response.success)
          throw new NotegicAPIError(new NotegicException(response.exception));
        confirmed = response.data;
        // A confirmed remote commit is never replayed if local reconciliation fails.
        await saveDraft({
          ...current,
          snapshot: { ...current.snapshot, confirmed },
        });
      }
      await RoutineTaskDependencyLocalSynchronizer.syncUpdateRoutineTaskGraphByRoutineId(
        request,
        confirmed
      );
      stationRoutineManager.updateRoutineTaskGraph(routineId, confirmed);
      const baselineEdges = confirmed.dependencies.map(edge => ({
        id: getRoutineTaskDependencyEdgeId(
          edge.previousRoutineTaskId,
          edge.routineTaskId
        ),
        source: edge.previousRoutineTaskId,
        target: edge.routineTaskId,
        description: edge.description,
        progress: edge.progress,
      }));
      const clean: RoutineTaskDependencyGraphDraftData = {
        nodes: confirmed.tasks.map(task => ({
          id: task.id,
          position: { x: task.x, y: task.y },
        })),
        edges: baselineEdges,
        snapshot: {
          version: 2,
          definitionVersion: confirmed.definitionVersion,
          tasks: confirmed.tasks,
          baselineTasks: confirmed.tasks,
          baselineEdges,
        },
        updatedAt: confirmed.updatedAt,
      };
      if (activeRoutine.current === routineId) {
        draftRef.current = clean;
        setDraft(clean);
      }
      const queryClient = getQueryClient();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.routine.oneById(routineId),
          exact: true,
          refetchType: "none",
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.routineTask.manyByRoutineId(routineId),
          exact: true,
          refetchType: "none",
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.routineTaskDependency.byRoutineId(routineId),
          exact: true,
          refetchType: "none",
        }),
        ...Array.from(
          new Set([
            ...current.snapshot.baselineTasks.map(task => task.id),
            ...confirmed.tasks.map(task => task.id),
          ])
        ).map(taskId =>
          queryClient.invalidateQueries({
            queryKey: queryKeys.routineTask.oneById(taskId as UUID),
            exact: true,
            refetchType: "none",
          })
        ),
      ]);
      toast.success(t("workspace.notifications.routineDependencyGraphSaved"));
      return true;
    } catch (error) {
      if (
        error instanceof NotegicAPIError &&
        error.unWrap.reason === "DefinitionConflict"
      )
        setHasConflict(true);
      toast.error(tError(error, t));
      return false;
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const handleConnect = async (connection: Connection) => {
    const current = draftRef.current;
    if (
      !current?.snapshot ||
      saving.current ||
      current.snapshot.confirmed ||
      !connection.source ||
      !connection.target
    )
      return;
    const taskIds = new Set(current.snapshot.tasks.map(task => task.id));
    if (
      !isRoutineTaskDependencyInRoutine(
        taskIds,
        connection.source,
        connection.target
      )
    ) {
      toast.error(t("workspace.validation.dependencyOutsideRoutine"));
      return;
    }
    if (
      current.snapshot.tasks.find(task => task.id === connection.target)
        ?.kind === "Start"
    ) {
      toast.error(t("workspace.validation.startingNodeIncoming"));
      return;
    }
    if (
      hasRoutineTaskDependencyEdge(
        current.edges,
        connection.source,
        connection.target
      )
    ) {
      toast.error(t("workspace.validation.dependencyDuplicate"));
      return;
    }
    if (
      connection.source === connection.target ||
      hasRoutineTaskDependencyCycle(
        current.edges,
        connection.source,
        connection.target
      )
    ) {
      toast.error(t("workspace.validation.dependencyCycle"));
      return;
    }
    await saveDraft({
      ...current,
      edges: [
        ...current.edges,
        {
          id: getRoutineTaskDependencyEdgeId(
            connection.source,
            connection.target
          ),
          source: connection.source,
          target: connection.target,
          description: "",
          progress: 0,
        },
      ],
    });
  };
  const handleEdgesChange = async (changes: EdgeChange[]) => {
    const current = draftRef.current;
    if (!current?.snapshot || saving.current || current.snapshot.confirmed)
      return;
    const removed = new Set(
      changes
        .filter(change => change.type === "remove")
        .map(change => change.id)
    );
    if (removed.size)
      await saveDraft({
        ...current,
        edges: current.edges.filter(edge => !removed.has(edge.id)),
      });
  };
  const handleNodesChange = async (
    changes: NodeChange<RoutineTaskGraphNode>[]
  ) => {
    if (saving.current || draftRef.current?.snapshot?.confirmed) return;
    onNodesChange(changes);
    const current = draftRef.current;
    if (!current?.snapshot) return;
    const positions = new Map<string, { x: number; y: number }>();
    for (const change of changes)
      if (
        change.type === "position" &&
        change.dragging === false &&
        change.position
      )
        positions.set(change.id, change.position);
    const removed = new Set(
      changes
        .filter(change => change.type === "remove")
        .map(change => change.id)
    );
    if (!positions.size && !removed.size) return;
    const tasks = current.snapshot.tasks
      .filter(task => !removed.has(task.id))
      .map(task =>
        positions.has(task.id) ? { ...task, ...positions.get(task.id)! } : task
      );
    await saveDraft({
      ...current,
      nodes: tasks.map(task => ({
        id: task.id,
        position: { x: task.x, y: task.y },
      })),
      edges: current.edges.filter(
        edge => !removed.has(edge.source) && !removed.has(edge.target)
      ),
      snapshot: { ...current.snapshot, tasks },
    });
  };
  const realign = async () => {
    const current = draftRef.current;
    if (!current?.snapshot || current.snapshot.confirmed || !canRealign)
      return false;
    setIsRealigning(true);
    try {
      const positions = realignGraph(nodes, edges);
      if (!positions) {
        toast.error(t("workspace.graph.realignError"));
        return false;
      }
      const byId = new Map(positions.map(node => [node.id, node.position]));
      await saveDraft({
        ...current,
        nodes: positions,
        snapshot: {
          ...current.snapshot,
          tasks: current.snapshot.tasks.map(task => ({
            ...task,
            ...byId.get(task.id),
          })),
        },
      });
      return true;
    } catch (error) {
      toast.error(tError(error, t));
      return false;
    } finally {
      setIsRealigning(false);
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
        definitionVersion: draft?.snapshot?.definitionVersion ?? 1,
        hasConflict,
        isReviewing,
        recovery,
        reviewGraph,
        resolveConflicts,
        closeRecovery: () => setRecovery(null),
        isDirty,
        isLoading,
        isRetryingSync: false,
        isRealigning,
        isSaving,
        canEdit:
          !!draft?.snapshot &&
          !isSaving &&
          !isReviewing &&
          !recovery &&
          !draft.snapshot.confirmed,
        isSavingLayout: isSaving,
        isUpdatingDependency: false,
        canRealign,
        canAddStartingNode:
          !!draft?.snapshot &&
          !isSaving &&
          !draft.snapshot.confirmed &&
          (draft?.snapshot?.tasks.filter(task => task.kind === "Start")
            .length ?? 0) < 16,
        pendingSyncCount: 0,
        invalidMutationCount: 0,
        selectedEdgeId,
        selectedDependency,
        setSelectedEdgeId,
        dependencyDescription,
        setDependencyDescription,
        dependencyProgress,
        setDependencyProgress,
        reload: () => setReloadVersion(version => version + 1),
        createStartingNode: async () => {
          await createTask({
            routineId,
            kind: "Start",
            title: t("workspace.fields.startingNode"),
            payload: { schemaVersion: 1, isActive: true, description: "" },
            x: 0,
            y: 0,
          });
        },
        createTask,
        editingTask:
          draft?.snapshot?.tasks.find(task => task.id === editingTaskId) ??
          null,
        setEditingTaskId,
        updateTask,
        connectDependency: handleConnect,
        changeEdges: handleEdgesChange,
        changeNodes: handleNodesChange,
        updateDependency: async () => {
          const current = draftRef.current;
          if (
            !current?.snapshot ||
            saving.current ||
            current.snapshot.confirmed
          )
            return;
          await saveDraft({
            ...current,
            edges: current.edges.map(edge =>
              edge.id === selectedEdgeId
                ? {
                    ...edge,
                    description: dependencyDescription,
                    progress: dependencyProgress,
                  }
                : edge
            ),
          });
        },
        retryPendingSync: async () => {
          await saveGraph();
        },
        saveGraph,
        realign,
      }}
    >
      {children}
    </RoutineTaskDependencyGraphDraftContext.Provider>
  );
};
