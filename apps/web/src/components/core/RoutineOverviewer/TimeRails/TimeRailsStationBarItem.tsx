import { DNDType } from "@shared/enums";
import type { StationNode } from "@shared/types/stationNode.type";
import { cn } from "@shared/util/utils";
import type { UUID } from "crypto";
import { useDrag, useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import { StationIcon } from "@/components/icons/WorkspaceEntityIcons";

interface TimeRailsStationBarItemProps {
  station: StationNode;
  routineCount: number;
  rowHeight: number;
  onMove: (draggedStationId: UUID, targetStationId: UUID) => void;
}

const TimeRailsStationBarItem = ({
  station,
  routineCount,
  rowHeight,
  onMove,
}: TimeRailsStationBarItemProps) => {
  const { t } = useTranslation();
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DNDType.DraggableTimeRailsStation.toString(),
      item: { stationId: station.id },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [station.id]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: DNDType.DraggableTimeRailsStation.toString(),
      drop: (draggedItem: { stationId: UUID }) => {
        if (draggedItem.stationId === station.id) return;
        onMove(draggedItem.stationId, station.id);
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
      }),
    }),
    [onMove, station.id]
  );

  return (
    <div
      ref={node => {
        drag(node);
        drop(node);
      }}
      className={cn(
        "flex w-full min-w-0 cursor-grab items-start gap-2 overflow-hidden",
        "border-t border-border/60 bg-card px-3 py-3 shadow-sm active:cursor-grabbing",
        isOver && "bg-muted"
      )}
      style={{
        height: rowHeight,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {station.icon ? (
        <span className="mt-0.5 shrink-0 text-sm">{station.icon}</span>
      ) : (
        <StationIcon
          size={14}
          className="mt-0.5 shrink-0 text-muted-foreground"
        />
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{station.name}</p>
        <p className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
          {t("workspace.timeRails.routineCount", { count: routineCount })}
        </p>
      </div>
    </div>
  );
};

export default TimeRailsStationBarItem;
