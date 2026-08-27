import { DNDType } from "@shared/enums";
import { FrameCountPosition, FrameCountSize } from "@shared/types/cord";
import { DropTargetMonitor } from "react-dnd";
import Droppable from "@/components/commons/Droppable/Droppable";
import { getPositionValue, getSizeValue } from "@/components/widgets/widget";

interface PlaceableFrameProps {
  className?: string;
  children?: React.ReactNode;
  frameSize: number;
  // note that the value of position and size, and gap are based on the frame size
  position: FrameCountPosition;
  size: FrameCountSize;
  gap: {
    horizontal: number;
    vertical: number;
  };
  disabled?: boolean;
  droppableProps: {
    type: DNDType;
    hover?: (item: any, monitor: DropTargetMonitor) => void;
    canDrop?: (
      item: any,
      monitor: DropTargetMonitor,
      position: FrameCountPosition
    ) => boolean;
    drop?: (
      item: any,
      monitor: DropTargetMonitor,
      position: FrameCountPosition
    ) => void;
    collect?: (monitor: DropTargetMonitor) => Record<string, any>;
  };
  onClick: (position: FrameCountPosition) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const PlaceableFrame = ({
  className = "",
  children,
  frameSize,
  position,
  size,
  gap,
  disabled = false,
  droppableProps,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PlaceableFrameProps) => {
  return (
    <Droppable
      type={droppableProps.type}
      hover={(item: any, monitor: DropTargetMonitor): void => {
        if (droppableProps.hover === undefined) return;
        droppableProps.hover(item, monitor);
      }}
      canDrop={(item: any, monitor: DropTargetMonitor): boolean => {
        return (
          droppableProps.canDrop === undefined ||
          droppableProps.canDrop(item, monitor, position)
        );
      }}
      drop={(item: any, monitor: DropTargetMonitor) => {
        if (droppableProps.drop) droppableProps.drop(item, monitor, position);
      }}
    >
      <div
        className={`
          absolute rounded-lg transition flex justify-center items-center
          ${disabled ? "invisible" : "bg-transparent"}
          opacity-0 hover:opacity-100
          border-2 border-foreground/50 border-dotted
          ${className}
        `}
        style={{
          left: getPositionValue(
            position.leftFrameCount,
            frameSize,
            gap.horizontal
          ),
          top: getPositionValue(
            position.topFrameCount,
            frameSize,
            gap.vertical
          ),
          width: getSizeValue(size.widthFrameCount, frameSize, gap.horizontal),
          height: getSizeValue(size.heightFrameCount, frameSize, gap.vertical),
        }}
        onClick={disabled ? undefined : () => onClick(position)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    </Droppable>
  );
};

export default PlaceableFrame;
