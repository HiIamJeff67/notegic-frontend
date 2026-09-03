import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import type { Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";

export interface RoutineTaskDependencyGraphDraftEdge {
  id: string;
  source: string;
  target: string;
  description?: string;
  progress?: number;
  syncStatus?: "synced" | "pending" | "invalid";
  operation?: "create" | "update" | "delete";
  errorMessage?: string;
}

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
