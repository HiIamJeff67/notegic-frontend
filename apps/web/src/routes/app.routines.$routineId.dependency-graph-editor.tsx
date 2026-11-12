import { createFileRoute } from "@tanstack/react-router";
import {
  loadRoutineTaskDependencyGraph,
  RoutineTaskDependencyGraphEditorRoute,
} from "@/pages/app/routines/RoutineTaskDependencyGraphEditorRoute";

export const Route = createFileRoute(
  "/app/routines/$routineId/dependency-graph-editor"
)({
  ssr: false,
  loader: ({ params }) => loadRoutineTaskDependencyGraph(params.routineId),
  component: RoutineTaskDependencyGraphEditorRoute,
});
