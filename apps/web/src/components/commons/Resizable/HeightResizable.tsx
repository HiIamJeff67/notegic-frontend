import { clamp } from "@shared/util/math";
import { MouseEvent as ReactMouseEvent, useCallback, useState } from "react";

interface HeightResizableProps {
  children?: React.ReactNode;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  control?: {
    height: number;
    setHeight: (newHeight: number) => void;
    validate: (height: number) => boolean;
    getRecentValidated: (height: number) => number;
  };
}

const HeightResizable = ({
  children,
  className,
  minHeight = 100,
  maxHeight = 800,
  control,
}: HeightResizableProps) => {
  const [height, setHeight] = useState<number>(minHeight);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startHeight = height;
      const move = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newHeight = clamp(startHeight + delta, minHeight, maxHeight);
        setHeight(newHeight);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      };
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        if (control !== undefined) {
          if (control.validate(height)) {
            control.setHeight(height);
          } else {
            setHeight(control.getRecentValidated(height));
          }
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [height, minHeight, maxHeight]
  );

  return (
    <div className={`relative ${className ?? ""}`} style={{ height: height }}>
      {children}
      <div
        className="absolute right-0 bottom-0 w-4 h-4 bg-foreground cursor-nwse-resize z-10"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default HeightResizable;
