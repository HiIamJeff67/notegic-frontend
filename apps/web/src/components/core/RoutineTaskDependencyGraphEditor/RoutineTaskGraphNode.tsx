import {
  RoutinePhase,
  RoutineTaskPurpose,
  RoutineTaskRecordStatus,
} from "@shared/api/interfaces/enums";
import { routinePhaseTKeys } from "@shared/i18n/enums/routinePhase.tKey";
import { routineTaskPurposeTKeys } from "@shared/i18n/enums/routineTaskPurpose.tKey";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast/toast";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import type { UUID } from "crypto";
import { SquarePen, Trash2 } from "lucide-react";
import RoutineTaskStatusDot from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useModal } from "@/hooks";
import type { RoutineTaskGraphNode as RoutineTaskGraphNodeType } from "@/providers/RoutineTaskDependencyGraphDraftProvider";

const RoutineTaskGraphNode = ({
  id,
  data,
  selected,
}: NodeProps<RoutineTaskGraphNodeType>) => {
  const { t } = useTranslation();
  const modalManager = useModal();
  const isStart = data.kind === "Start";
  const isActive = data.payload.isActive !== false;
  const purpose = data.payload.purpose as RoutineTaskPurpose | undefined;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          role="group"
          tabIndex={0}
          aria-label={data.title}
          aria-haspopup="menu"
          onContextMenu={event => {
            if ((event.target as Element).closest(".react-flow__handle"))
              event.preventDefault();
          }}
          data-node-kind={data.kind}
          data-active={isStart ? isActive : undefined}
          className={`relative border shadow-sm ${
            isStart
              ? `flex size-20 items-center justify-center rounded-full ${isActive ? "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "border-border bg-muted text-muted-foreground"}`
              : "min-w-56 max-w-64 rounded-md bg-card px-3 py-2"
          } ${selected ? "ring-2 ring-primary/30" : ""}`}
        >
          {!isStart && (
            <Handle
              type="target"
              position={Position.Left}
              className="!size-3 !border-2 !border-background !bg-muted-foreground"
            />
          )}
          <div
            className={
              isStart
                ? "absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 truncate text-center text-sm font-medium"
                : "min-w-0 truncate text-sm font-medium"
            }
            title={data.title}
          >
            {data.title}
          </div>
          {!isStart && (
            <>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {purpose
                  ? `${t(routineTaskPurposeTKeys[purpose].action)} · ${t(routineTaskPurposeTKeys[purpose].target)}`
                  : ""}
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                <RoutineTaskStatusDot status={data.executionStatus} />
                <span className="truncate">
                  {data.executionStatus
                    ? t(routineTaskRecordStatusTKeys[data.executionStatus])
                    : t("workspace.status.waiting")}
                </span>
                {data.routinePhase
                  ? ` · ${t(routinePhaseTKeys[data.routinePhase])}`
                  : ""}
              </div>
            </>
          )}
          <Handle
            type="source"
            position={Position.Right}
            className="!size-3 !border-2 !border-background !bg-muted-foreground"
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="nodrag nopan"
        onClick={event => event.stopPropagation()}
        onKeyDown={event => event.stopPropagation()}
        onContextMenu={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <ContextMenuItem
          disabled={data.isSaving}
          onSelect={() => data.onEdit?.()}
        >
          <SquarePen className="mr-2 size-4" />
          {t("common.edit")}
        </ContextMenuItem>
        {isStart && (
          <ContextMenuCheckboxItem
            disabled={data.isSaving}
            checked={isActive}
            onCheckedChange={isActive =>
              void data
                .onUpdated?.({ payload: { ...data.payload, isActive } })
                .catch(error => toast.error(tError(error, t)))
            }
          >
            {t("workspace.fields.active")}
          </ContextMenuCheckboxItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={data.isSaving}
          className="text-destructive focus:text-destructive"
          onSelect={() =>
            modalManager.open("DeleteRoutineTaskDialog", {
              routineTaskId: id as UUID,
              routineTaskTitle: data.title,
              onDeleted: data.onDeleted,
              onDelete: data.onDelete,
              expectedDefinitionVersion: data.expectedDefinitionVersion,
            })
          }
        >
          <Trash2 className="mr-2 size-4" />
          {t("common.delete")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default RoutineTaskGraphNode;
