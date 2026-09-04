import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RoutineTaskDependencyInspectorProps {
  dependency: RoutineTaskDependency;
  description: string;
  isSaving: boolean;
  progress: number;
  onDescriptionChange: (description: string) => void;
  onProgressChange: (progress: number) => void;
  onSave: () => void;
}

const RoutineTaskDependencyInspector = ({
  dependency,
  description,
  isSaving,
  progress,
  onDescriptionChange,
  onProgressChange,
  onSave,
}: RoutineTaskDependencyInspectorProps) => {
  const { t } = useTranslation();

  return (
    <aside className="absolute top-3 right-3 z-20 flex w-72 flex-col gap-4 rounded-md border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="truncate text-sm font-semibold">
          {t("workspace.fields.update")}
        </h2>
        <p className="truncate text-xs text-muted-foreground">
          {dependency.previousRoutineTaskId} → {dependency.routineTaskId}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="routine-dependency-description">
          {t("workspace.fields.description")}
        </Label>
        <Textarea
          id="routine-dependency-description"
          value={description}
          maxLength={128}
          className="min-h-20 resize-y"
          onChange={event => onDescriptionChange(event.currentTarget.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="routine-dependency-progress">
          {t("workspace.fields.progress")}
        </Label>
        <Input
          id="routine-dependency-progress"
          type="number"
          min={0}
          max={100}
          value={progress}
          onChange={event =>
            onProgressChange(
              Math.min(100, Math.max(0, event.currentTarget.valueAsNumber || 0))
            )
          }
        />
      </div>
      <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
        {t("common.save")}
      </Button>
    </aside>
  );
};

export default RoutineTaskDependencyInspector;
