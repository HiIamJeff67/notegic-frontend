import { clamp } from "@shared/util/math";
import {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "@/hooks/useTheme";

interface XYResizableProps {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: number;
  width: number;
  setWidth: (newWidth: number) => void;
  height: number;
  setHeight: (newHeight: number) => void;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  hasParent?: boolean;
  parentClassName?: string;
  parentStyle?: CSSProperties;
  onBeforeResize?: () => void;
  onResize?: (
    width: number,
    height: number
  ) => { availableWidth: number; availableHeight: number };
  onAfterResize?: (width: number, height: number) => void;
  disabled?: boolean;
}

const XYResizable = ({
  children,
  className,
  style,
  size = 2,
  width,
  setWidth,
  height,
  setHeight,
  minWidth = 100,
  maxWidth = 800,
  minHeight = 100,
  maxHeight = 800,
  hasParent = false,
  parentClassName,
  parentStyle,
  onBeforeResize,
  onResize,
  onAfterResize,
  disabled = false,
}: XYResizableProps) => {
  const themeManager = useTheme();

  const [actualWidth, setActualWidth] = useState<number>(0);
  const [actualHeight, setActualHeight] = useState<number>(0);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // since the width and height coming from the props which are passing to the move() and up() functions in the handleMouseDown() callback
  // will not update their value if the props changed either inside or outside, so we have to make them references and use a useEffect hook to listen to their current values
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  useEffect(() => {
    widthRef.current = width;
  }, [width]);
  useEffect(() => {
    heightRef.current = height;
  }, [height]);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      if (onBeforeResize) onBeforeResize();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = widthRef.current;
      const startHeight = heightRef.current;

      const move = (ev: MouseEvent) => {
        setIsResizing(true);
        const deltaX = ev.clientX - startX;
        const deltaY = ev.clientY - startY;
        const newWidth = clamp(startWidth + deltaX, minWidth, maxWidth);
        const newHeight = clamp(startHeight + deltaY, minHeight, maxHeight);
        if (onResize) {
          const availableSize = onResize(newWidth, newHeight);
          setActualWidth(availableSize.availableWidth);
          setActualHeight(availableSize.availableHeight);
        }
        setWidth(newWidth);
        setHeight(newHeight);
        document.body.style.cursor = "nwse-resize";
        document.body.style.userSelect = "none";
      };

      const up = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        if (onResize) {
          const availableSize = onResize(widthRef.current, heightRef.current);
          setWidth(availableSize.availableWidth);
          setHeight(availableSize.availableHeight);
        }
        if (onAfterResize) onAfterResize(widthRef.current, heightRef.current);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [width, height, minWidth, maxWidth, minHeight, maxHeight]
  );

  if (hasParent) {
    return (
      <>
        {children}
        {!disabled && (
          <div
            className={`absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize ${className}`}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: size + 12,
              height: size + 12,
              ...style,
            }}
            onMouseDown={handleMouseDown}
          >
            <span
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: size,
                height: "100%",
                background: themeManager.currentTheme.isDark
                  ? "white"
                  : "black",
                borderRadius: 2,
              }}
            />

            <span
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "100%",
                height: size,
                background: themeManager.currentTheme.isDark
                  ? "white"
                  : "black",
                borderRadius: 2,
              }}
            />
          </div>
        )}
        {isResizing && !disabled && (
          <div
            className="absolute border-2 border-foreground bg-foreground/50 rounded-lg transition"
            style={{
              left: 0,
              top: 0,
              width: actualWidth,
              height: actualHeight,
            }}
          />
        )}
      </>
    );
  }

  return (
    <div
      className={`relative ${parentClassName}`}
      style={{
        width: width,
        height: height,
        ...parentStyle,
      }}
    >
      {children}
      {!disabled && (
        <div
          className={`absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize ${className}`}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: size + 12,
            height: size + 12,
            ...style,
          }}
          onMouseDown={handleMouseDown}
        >
          <span
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: size,
              height: "100%",
              background: themeManager.currentTheme.isDark ? "white" : "black",
              borderRadius: 2,
            }}
          />
          <span
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "100%",
              height: size,
              background: themeManager.currentTheme.isDark ? "white" : "black",
              borderRadius: 2,
            }}
          />
        </div>
      )}
      {!disabled && isResizing && (
        <div
          className="absolute border-2 border-foreground bg-foreground/50 rounded-lg transition"
          style={{
            left: 0,
            top: 0,
            width: actualWidth,
            height: actualHeight,
          }}
        />
      )}
    </div>
  );
};

export default XYResizable;
