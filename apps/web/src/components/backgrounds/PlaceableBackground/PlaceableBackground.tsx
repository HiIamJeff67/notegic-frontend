import {
  DefaultHeightTotalFrameCount,
  DefaultWidthTotalFrameCount,
} from "@shared/constants/widgetLayout.constant";
import { DNDType } from "@shared/enums";
import { Cord, FrameCountPosition, FrameCountSize } from "@shared/types/cord";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { DropTargetMonitor } from "react-dnd";
import {
  getPositionValue,
  getSizeValue,
  Widget,
} from "@/components/widgets/widget";
import { useTheme } from "@/hooks/useTheme";
import PlaceableFrame from "./PlaceableFrame";

interface PlaceableBackgroundProps {
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
  children?: React.ReactNode;
  frameSizeSource?: "horizontal" | "vertical" | "none";
  rightInset?: number;
  frameSize: number;
  setFrameSize: (newBaseSize: number) => void;
  widthTotalFrameCount: number;
  heightTotalFrameCount: number;
  frameProps: {
    className?: string;
    zIndex?: number;
    children?: React.ReactNode;
    gap: number;
    disabled: boolean;
    droppableProps: {
      type: DNDType;
      hover?: (item: any, monitor: DropTargetMonitor) => FrameCountSize;
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
  };
}

const PlaceableBackground = ({
  className,
  style,
  zIndex = 50,
  children,
  frameSizeSource = "none",
  rightInset = 0,
  frameSize,
  setFrameSize,
  widthTotalFrameCount,
  heightTotalFrameCount,
  frameProps,
}: PlaceableBackgroundProps) => {
  const themeManager = useTheme();

  const [frames, setFrames] = useState<Cord[]>([]);
  const [dropPlaceholderSize, setDropPlaceholderSize] = useState<
    FrameCountSize | undefined
  >(undefined);
  const [hoveredFrameCord, setHoveredFrameCord] = useState<Cord>([0, 0]);

  // the reference of the background element which will be used to define the base size
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = backgroundRef.current;
    if (target === null) return;

    let timeout: NodeJS.Timeout;
    let hasRendered = false;

    const handleResize = () => {
      const width = backgroundRef.current
        ? backgroundRef.current.clientWidth - rightInset
        : window.innerWidth;
      const height = backgroundRef.current
        ? backgroundRef.current.offsetHeight
        : window.innerHeight;

      let horizontal = widthTotalFrameCount;
      let vertical = heightTotalFrameCount;

      if (horizontal === Infinity && vertical === Infinity) {
        horizontal = DefaultWidthTotalFrameCount;
        vertical = DefaultHeightTotalFrameCount;
      } else if (horizontal === Infinity) {
        horizontal = Math.floor(width / (height / vertical));
      } else if (vertical === Infinity) {
        vertical = Math.floor(height / (width / horizontal));
      }

      let newFrameSize = Math.min(
        Math.floor(width / horizontal),
        Math.floor(height / vertical)
      );
      if (frameSizeSource === "horizontal") {
        newFrameSize = Math.floor(width / horizontal);
      } else if (frameSizeSource === "vertical") {
        newFrameSize = Math.floor(height / vertical) - 2 * frameProps.gap;
      }
      setFrameSize(newFrameSize);
      const frames = [];
      for (let y = 0; y < vertical; y++) {
        for (let x = 0; x < horizontal; x++) {
          frames.push([x, y] as Cord);
        }
      }
      setFrames(frames);
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!hasRendered) {
        hasRendered = true;
        return;
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleResize();
      }, 200);
    });
    resizeObserver.observe(target);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [
    // except for listening the changed of backgroundRef to avoid UI zooming while user adding new widgets
    widthTotalFrameCount,
    heightTotalFrameCount,
    rightInset,
  ]);

  const surfaceHeight = heightTotalFrameCount * frameSize;

  return (
    <div
      ref={backgroundRef}
      className={`w-full relative ${className} z-${zIndex}`}
      style={{
        background: themeManager.currentTheme.isDark ? "black" : "white",
        zIndex: zIndex,
        ...style,
      }}
    >
      <div className="relative min-h-full" style={{ minHeight: surfaceHeight }}>
        {children}
        {dropPlaceholderSize && (
          <div
            className="absolute border-2 border-foreground bg-foreground/50 rounded-lg transition"
            style={{
              left: getPositionValue(
                hoveredFrameCord[0],
                frameSize,
                frameProps.gap
              ),
              top: getPositionValue(
                hoveredFrameCord[1],
                frameSize,
                frameProps.gap
              ),
              width: getSizeValue(
                dropPlaceholderSize.widthFrameCount,
                frameSize,
                frameProps.gap
              ),
              height: getSizeValue(
                dropPlaceholderSize.heightFrameCount,
                frameSize,
                frameProps.gap
              ),
            }}
          />
        )}
        {frames.map(([x, y]) => (
          <PlaceableFrame
            key={`${x}-${y}`}
            className={`absolute transition-all duration-200 ease-in-out z-${frameProps.zIndex ?? zIndex} ${frameProps.className}`}
            disabled={frameProps.disabled}
            frameSize={frameSize}
            position={{ leftFrameCount: x, topFrameCount: y }}
            size={{ widthFrameCount: 1, heightFrameCount: 1 }}
            gap={{
              horizontal: frameProps.gap,
              vertical: frameProps.gap,
            }}
            droppableProps={{
              ...frameProps.droppableProps,
              hover: (draggedItem: Widget, monitor: DropTargetMonitor) => {
                if (frameProps.droppableProps.hover === undefined) return;
                const newSize = frameProps.droppableProps.hover(
                  draggedItem,
                  monitor
                );
                setHoveredFrameCord([
                  newSize.widthFrameCount >= widthTotalFrameCount ? 0 : x,
                  y,
                ]);
                setDropPlaceholderSize(newSize);
              },
              canDrop: (
                draggedItem: Widget,
                monitor: DropTargetMonitor,
                position: FrameCountPosition
              ): boolean => {
                const canDrop: boolean =
                  frameProps.droppableProps.canDrop !== undefined
                    ? frameProps.droppableProps.canDrop(
                        draggedItem,
                        monitor,
                        position
                      )
                    : true;
                // disabled the drop placeholder if the user is trying to drop on a non droppable position
                if (!canDrop) setDropPlaceholderSize(undefined);
                return canDrop;
              },
              drop: (
                draggedItem: Widget,
                monitor: DropTargetMonitor,
                position: FrameCountPosition
              ) => {
                if (frameProps.droppableProps.drop !== undefined) {
                  frameProps.droppableProps.drop(
                    draggedItem,
                    monitor,
                    position
                  );
                  setDropPlaceholderSize(undefined);
                }
              },
            }}
            onClick={frameProps.onClick}
          >
            {frameProps.children}
          </PlaceableFrame>
        ))}
      </div>
    </div>
  );
};

export default PlaceableBackground;
