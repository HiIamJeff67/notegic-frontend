import { useContext } from "react";
import {
  RoutineTaskDependencyGraphDraftContext,
  type RoutineTaskDependencyGraphDraftContextType,
} from "@/providers/RoutineTaskDependencyGraphDraftProvider";

export const useRoutineTaskDependencyGraphDraft =
  (): RoutineTaskDependencyGraphDraftContextType => {
    const context = useContext(RoutineTaskDependencyGraphDraftContext);
    if (!context) {
      throw new Error(
        "useRoutineTaskDependencyGraphDraft must be used within a RoutineTaskDependencyGraphDraftProvider"
      );
    }
    return context;
  };
