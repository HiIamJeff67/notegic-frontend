import type { UUID } from "crypto";
import RoutineTaskDependencyGraphEditor from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphEditor";
import { RoutineTaskDependencyGraphDraftProvider } from "@/providers/RoutineTaskDependencyGraphDraftProvider";

interface RoutineTaskDependencyGraphEditorPageProps {
  routineId: UUID;
}

const RoutineTaskDependencyGraphEditorPage = ({
  routineId,
}: RoutineTaskDependencyGraphEditorPageProps) => (
  <RoutineTaskDependencyGraphDraftProvider
    key={routineId}
    routineId={routineId}
  >
    <RoutineTaskDependencyGraphEditor routineId={routineId} />
  </RoutineTaskDependencyGraphDraftProvider>
);

export default RoutineTaskDependencyGraphEditorPage;
