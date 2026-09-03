import {
  RoutinePhase,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import {
  translateRoutinePhase,
  translateRoutineTaskPurpose,
  translateRoutineTaskRecordStatus,
} from "@shared/i18n/workspace";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import type { UUID } from "crypto";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks";

export interface RoutineTaskGraphNodeData extends Record<string, unknown> {
  title: string;
  purpose: RoutineTaskPurpose;
  executionStatus?: RoutineTaskRecordStatus | null;
  routinePhase?: RoutinePhase | null;
  onDeleted?: () => void | Promise<void>;
}

export type RoutineTaskGraphNode = Node<
  RoutineTaskGraphNodeData,
  "routineTask"
>;

const RoutineTaskGraphNode = ({
  id,
  data,
  selected,
}: NodeProps<RoutineTaskGraphNode>) => {
  const { t } = useTranslation();
  const modalManager = useModal();

  return (
    <div
      className={`min-w-56 max-w-64 rounded-md border bg-card px-3 py-2 shadow-sm ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1 truncate text-sm font-medium">
          {data.title}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="nodrag nopan -mr-1 -mt-1 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={t("common.delete")}
          title={t("common.delete")}
          onClick={event => {
            event.stopPropagation();
            modalManager.open("DeleteRoutineTaskDialog", {
              routineTaskId: id as UUID,
              routineTaskTitle: data.title,
              onDeleted: data.onDeleted,
            });
          }}
        >
          <Trash2 />
        </Button>
      </div>
      <div className="mt-1 truncate text-xs text-muted-foreground">
        {translateRoutineTaskPurpose(data.purpose, t)}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        {data.executionStatus
          ? translateRoutineTaskRecordStatus(data.executionStatus, t)
          : t("workspace.status.waiting")}
        {data.routinePhase
          ? ` · ${translateRoutinePhase(data.routinePhase, t)}`
          : ""}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default RoutineTaskGraphNode;
