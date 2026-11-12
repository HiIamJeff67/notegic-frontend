import { NetworkExceptions } from "@shared/api/exceptions/network.exception";
import { isValidUUID } from "@shared/lib/uuid/uuidv4.type";
import { notFound, useLoaderData } from "@tanstack/react-router";
import type { UUID } from "crypto";
import { isRemoteUnavailable } from "@/api/availability";
import { prefetchRoutineTaskDependencyGraph } from "@/api/prefetches/routineTaskDependencyGraph.prefetch";
import RoutineTaskDependencyGraphEditorPage from "@/pages/app/routines/RoutineTaskDependencyGraphEditorPage";

export const loadRoutineTaskDependencyGraph = async (routineId: string) => {
  if (!isValidUUID(routineId)) throw notFound();

  const id = routineId as UUID;
  if (!isRemoteUnavailable()) {
    try {
      await prefetchRoutineTaskDependencyGraph(id);
    } catch (error) {
      if (!NetworkExceptions.isNetworkFallbackError(error)) throw error;
    }
  }

  return { routineId: id };
};

export function RoutineTaskDependencyGraphEditorRoute() {
  const { routineId } = useLoaderData({ strict: false }) as {
    routineId: UUID;
  };
  return <RoutineTaskDependencyGraphEditorPage routineId={routineId} />;
}
