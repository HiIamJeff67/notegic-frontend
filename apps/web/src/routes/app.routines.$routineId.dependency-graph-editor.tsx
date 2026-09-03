import { isValidUUID } from "@shared/types/uuidv4.type";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UUID } from "crypto";
import RoutineTaskDependencyGraphEditorPage from "@/pages/app/routines/RoutineTaskDependencyGraphEditorPage";

export const Route = createFileRoute(
  "/app/routines/$routineId/dependency-graph-editor"
)({
  ssr: false,
  loader: ({ params }) => {
    if (!isValidUUID(params.routineId)) throw notFound();

    return { routineId: params.routineId as UUID };
  },
  component: RoutineTaskDependencyGraphEditorRoute,
});

function RoutineTaskDependencyGraphEditorRoute() {
  const { routineId } = Route.useLoaderData();
  return <RoutineTaskDependencyGraphEditorPage routineId={routineId} />;
}
