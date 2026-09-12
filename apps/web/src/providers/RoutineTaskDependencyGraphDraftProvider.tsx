import type { UUID } from "crypto";
import { eq } from "drizzle-orm";
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { localDB } from "@/api/local/db";
import {
  RoutineTaskDependencyGraphDraft,
  type RoutineTaskDependencyGraphDraftEdge,
  type RoutineTaskDependencyGraphDraftNode,
} from "@/api/local/schemas";

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

    const storedDraft =
      await localDB.query.RoutineTaskDependencyGraphDraft.findFirst({
        where: eq(RoutineTaskDependencyGraphDraft.routineId, routineId),
      });
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

  return (
    <RoutineTaskDependencyGraphDraftContext.Provider
      value={{ draft, loadDraft, saveDraft }}
    >
      {children}
    </RoutineTaskDependencyGraphDraftContext.Provider>
  );
};
