import type { UUID } from "crypto";
import RoutineTaskDependencyGraphEditor from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphEditor";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useStationRoutine } from "@/hooks/useStationRoutine";
import { RoutineTaskDependencyGraphDraftProvider } from "@/providers/RoutineTaskDependencyGraphDraftProvider";
import { pageTitle } from "@/seo/pageTitle";

interface RoutineTaskDependencyGraphEditorPageProps {
  routineId: UUID;
}

const RoutineTaskDependencyGraphEditorPage = ({
  routineId,
}: RoutineTaskDependencyGraphEditorPageProps) => {
  const { stations } = useStationRoutine();
  const routineTitle = stations
    .flatMap(station => station.routines)
    .find(routine => routine.id === routineId)?.title;

  usePageTitle(pageTitle(routineTitle || "Dependency Graph"));

  return (
    <RoutineTaskDependencyGraphDraftProvider
      key={routineId}
      routineId={routineId}
    >
      <RoutineTaskDependencyGraphEditor />
    </RoutineTaskDependencyGraphDraftProvider>
  );
};

export default RoutineTaskDependencyGraphEditorPage;
