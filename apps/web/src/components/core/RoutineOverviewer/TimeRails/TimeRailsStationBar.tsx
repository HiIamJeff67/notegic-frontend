import type { UUID } from "crypto";
import type { TimeRailsStation } from "./TimeRails";
import TimeRailsStationBarItem from "./TimeRailsStationBarItem";

interface TimeRailsStationBarProps {
  stations: TimeRailsStation[];
  onMove: (draggedStationId: UUID, targetStationId: UUID) => void;
}

const TimeRailsStationBar = ({
  stations,
  onMove,
}: TimeRailsStationBarProps) => {
  return (
    <div className="w-[112px] shrink-0 overflow-hidden border-r border-border/60 bg-card select-none @min-[680px]:w-[160px]">
      <div className="sticky top-0 z-30 h-10 select-none border-b border-border/60 bg-secondary" />
      {stations.map(timeRailStation => {
        const rowHeight = Math.max(timeRailStation.railCount * 38 + 18, 56);

        return (
          <TimeRailsStationBarItem
            key={timeRailStation.station.id}
            station={timeRailStation.station}
            routineCount={timeRailStation.routines.length}
            rowHeight={rowHeight}
            onMove={onMove}
          />
        );
      })}
    </div>
  );
};

export default TimeRailsStationBar;
