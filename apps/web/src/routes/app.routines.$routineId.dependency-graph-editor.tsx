import { isValidUUID } from "@shared/types/uuidv4.type";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UUID } from "crypto";
import { prefetchRoutineTaskDependencyGraph } from "@/api/prefetches/routineTaskDependencyGraph.prefetch";
import RoutineTaskDependencyGraphEditorPage from "@/pages/app/routines/RoutineTaskDependencyGraphEditorPage";

export const Route = createFileRoute(
  "/app/routines/$routineId/dependency-graph-editor"
)({
  ssr: false,
  loader: async ({ params }) => {
    if (!isValidUUID(params.routineId)) throw notFound();

    const routineId = params.routineId as UUID;
    await prefetchRoutineTaskDependencyGraph(routineId);

    return { routineId };
  },
  component: RoutineTaskDependencyGraphEditorRoute,
});

function RoutineTaskDependencyGraphEditorRoute() {
  const { routineId } = Route.useLoaderData();
  return <RoutineTaskDependencyGraphEditorPage routineId={routineId} />;
}
