import { useRef } from "react";
import { ConnectDragSource, useDrag, useDrop } from "react-dnd";

export interface VerticalDNDableProps {
  index: number;
  dndType: string;
  itemData?: any;
  move: (dragIndex: number, hoverIndex: number) => void;
  children: (
    containerRef: React.RefObject<HTMLDivElement | null>,
    dragHandleRef: ConnectDragSource,
    isDragging: boolean
  ) => React.ReactNode;
}

export const VerticalDNDable = ({
  index,
  dndType,
  itemData,
  move,
  children,
}: VerticalDNDableProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: dndType,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRectangle = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRectangle.bottom - hoverBoundingRectangle.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRectangle.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      move(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: dndType,
    item: () => ({ index, ...itemData }),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(preview(ref));

  return <>{children(ref, drag, isDragging)}</>;
};
