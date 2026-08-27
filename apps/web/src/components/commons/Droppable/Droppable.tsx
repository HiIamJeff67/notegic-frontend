import { DNDType } from "@shared/enums";
import React from "react";
import { DropTargetMonitor } from "react-dnd";

interface DroppableProps extends React.HTMLAttributes<HTMLDivElement> {
  type: DNDType;
  hover?: (item: any, monitor: DropTargetMonitor) => void;
  canDrop?: (item: any, monitor: DropTargetMonitor) => boolean;
  drop?: (item: any, monitor: DropTargetMonitor) => void;
  collect?: (monitor: DropTargetMonitor) => Record<string, any>;
  onClick?: () => void | Promise<void>;
}

import { useDrop } from "react-dnd";

const Droppable = ({
  className,
  style,
  children,
  onClick,
  type,
  hover,
  canDrop,
  drop,
  collect,
}: DroppableProps) => {
  const [{ isOver }, _drop] = useDrop(() => ({
    accept: type.toString(),
    hover: hover,
    canDrop: canDrop,
    drop: drop,
    collect: monitor => ({
      isOver: monitor.isOver(),
      ...(collect ? collect(monitor) : {}),
    }),
  }));

  return (
    <div
      ref={node => {
        _drop(node);
      }}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Droppable;
