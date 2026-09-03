import { RoutineStatus } from "@shared/api/interfaces/enums";
import type { RoutineNode } from "@shared/types/routineNode.type";
import { cn } from "@shared/util/utils";
import { Bookmark } from "lucide-react";
import type { PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  translateRoutinePeriod,
  translateRoutinePhase,
  translateRoutineStatus,
} from "@shared/i18n/workspace";

const RoutineTrain = ({
  routine,
  left,
  top,
  width,
  stationName,
  tagNames,
  onOpen,
  onResizeStart,
  isResizing,
  canResize = true,
}: {
  routine: RoutineNode;
  left: number;
  top: number;
  width: number;
  stationName: string;
  tagNames: string[];
  onOpen: () => void;
  onResizeStart: (
    edge: "start" | "end",
    event: PointerEvent<HTMLSpanElement>
  ) => void;
  isResizing: boolean;
  canResize?: boolean;
}) => {
  const { i18n, t } = useTranslation();

  return (
    <HoverCard openDelay={180} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            "group absolute flex h-7 min-w-0 items-center gap-1.5 overflow-hidden",
            "rounded-sm border border-input bg-muted px-2 text-left text-xs shadow-sm hover:bg-input/50",
            routine.status === RoutineStatus.Completed &&
              "text-[var(--decoration)]",
            routine.status === RoutineStatus.OverDue && "text-destructive",
            "select-none",
            isResizing && "ring-1 ring-primary/50"
          )}
          style={{
            left,
            top,
            width,
          }}
          onClick={onOpen}
        >
          {canResize && (
            <>
              <span
                className="
                  absolute inset-y-0 left-0 z-10 w-4 cursor-ew-resize
                  border-l-2 border-primary/60 opacity-0 transition-opacity
                  group-hover:opacity-100
                "
                onPointerDown={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  onResizeStart("start", event);
                }}
              />
              <span
                className="
                  absolute inset-y-0 right-0 z-10 w-4 cursor-ew-resize
                  border-r-2 border-primary/60 opacity-0 transition-opacity
                  group-hover:opacity-100
                "
                onPointerDown={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  onResizeStart("end", event);
                }}
              />
            </>
          )}
          {routine.isPinned && (
            <Bookmark className="size-3 shrink-0 fill-muted-foreground/20 text-muted-foreground" />
          )}
          <span className="truncate">{routine.title}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        side="bottom"
        className="w-80 rounded-sm p-3 text-xs"
      >
        <HoverDetailCard
          title={routine.title}
          subtitle={stationName}
          id={routine.id}
          rows={[
            {
              field: t("workspace.table.status"),
              value: translateRoutineStatus(routine.status, t),
            },
            {
              field: t("workspace.table.phase"),
              value: routine.phase
                ? translateRoutinePhase(routine.phase, t)
                : t("workspace.period.none"),
            },
            {
              field: t("workspace.payloadEditor.period"),
              value: translateRoutinePeriod(routine.period, t),
            },
            {
              field: t("workspace.inspector.start"),
              value: routine.scheduledStartAt.toLocaleString(
                i18n.resolvedLanguage
              ),
            },
            {
              field: t("workspace.inspector.end"),
              value: routine.scheduledEndAt.toLocaleString(
                i18n.resolvedLanguage
              ),
            },
            {
              field: t("workspace.table.tags"),
              value:
                tagNames.length > 0
                  ? tagNames.join(", ")
                  : t("workspace.table.untagged"),
            },
          ]}
        />
      </HoverCardContent>
    </HoverCard>
  );
};

export default RoutineTrain;
