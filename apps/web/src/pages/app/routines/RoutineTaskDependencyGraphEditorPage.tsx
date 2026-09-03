import type { UUID } from "crypto";
import RoutineTaskDependencyGraphEditor from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphEditor";

interface RoutineTaskDependencyGraphEditorPageProps {
  routineId: UUID;
}

const RoutineTaskDependencyGraphEditorPage = ({
  routineId,
}: RoutineTaskDependencyGraphEditorPageProps) => (
  <RoutineTaskDependencyGraphEditor routineId={routineId} />
);

export default RoutineTaskDependencyGraphEditorPage;
