import { eq } from "drizzle-orm";
import { localDB } from "./db";
import {
  RoutineTaskDependencyGraphDraft,
  type RoutineTaskDependencyGraphDraftEdge,
  type RoutineTaskDependencyGraphDraftNode,
} from "./schemas";

export interface RoutineTaskDependencyGraphDraftData {
  nodes: RoutineTaskDependencyGraphDraftNode[];
  edges: RoutineTaskDependencyGraphDraftEdge[];
  updatedAt: Date;
}

export const loadRoutineTaskDependencyGraphDraft = async (
  routineId: string
): Promise<RoutineTaskDependencyGraphDraftData | null> => {
  if (!localDB.isEnabled) return null;
  if (!localDB.isReady) await localDB.ensureReady();

  const draft = await localDB.query.RoutineTaskDependencyGraphDraft.findFirst({
    where: eq(RoutineTaskDependencyGraphDraft.routineId, routineId),
  });
  if (!draft) return null;

  let nodes: RoutineTaskDependencyGraphDraftNode[];
  let edges: RoutineTaskDependencyGraphDraftEdge[];
  try {
    const parsedNodes: unknown = JSON.parse(draft.nodes);
    const parsedEdges: unknown = JSON.parse(draft.edges);
    if (!Array.isArray(parsedNodes) || !Array.isArray(parsedEdges)) return null;
    nodes = parsedNodes as RoutineTaskDependencyGraphDraftNode[];
    edges = parsedEdges as RoutineTaskDependencyGraphDraftEdge[];
  } catch (error) {
    console.warn(
      "Ignoring invalid local routine task dependency graph draft.",
      error
    );
    return null;
  }

  return {
    nodes,
    edges,
    updatedAt: draft.updatedAt,
  };
};

export const saveRoutineTaskDependencyGraphDraft = async (
  routineId: string,
  draft: Omit<RoutineTaskDependencyGraphDraftData, "updatedAt">
): Promise<void> => {
  if (!localDB.isEnabled) {
    throw new Error("local graph draft persistence is disabled");
  }
  if (!localDB.isReady) await localDB.ensureReady();

  await localDB
    .insert(RoutineTaskDependencyGraphDraft)
    .values({
      routineId,
      nodes: JSON.stringify(draft.nodes),
      edges: JSON.stringify(draft.edges),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: RoutineTaskDependencyGraphDraft.routineId,
      set: {
        nodes: JSON.stringify(draft.nodes),
        edges: JSON.stringify(draft.edges),
        updatedAt: new Date(),
      },
    });
};
