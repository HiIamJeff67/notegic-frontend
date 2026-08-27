import { DNDType } from "@shared/enums";
import React from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";

interface DraggableProps extends React.HTMLAttributes<HTMLDivElement> {
  type: DNDType;
  item: any;
  canDrag?: boolean;
  collect?: (monitor: DragSourceMonitor) => Record<string, any>;
}

const Draggable = ({
  className,
  style,
  children,
  type,
  item,
  canDrag = true,
  collect,
}: DraggableProps) => {
  const [{ isDragging }, _drag] = useDrag(
    () => ({
      type: type.toString(),
      item: item,
      canDrag: canDrag,
      collect: monitor => ({
        isDragging: monitor.isDragging(),
        ...(collect ? collect(monitor) : {}),
      }),
    }),
    [canDrag, item]
  );

  return (
    <div
      ref={node => {
        _drag(node);
      }}
      className={className}
      style={{
        opacity: isDragging ? 0 : 1,
        ...style,
        zIndex: isDragging ? 0 : style?.zIndex, // this should be placed at the end
      }}
    >
      {children}
    </div>
  );
};

export default Draggable;
