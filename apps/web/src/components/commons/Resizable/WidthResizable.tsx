import { clamp } from "@shared/util/math";
import { MouseEvent as ReactMouseEvent, useCallback, useState } from "react";

interface WidthResizableProps {
  children?: React.ReactNode;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
  control?: {
    width: number;
    setWidth: (newWidth: number) => void;
    validate: (width: number) => boolean;
    getRecentValidated: (width: number) => number;
  };
}

const WidthResizable = ({
  children,
  className,
  minWidth = 100,
  maxWidth = 800,
  control,
}: WidthResizableProps) => {
  const [width, setWidth] = useState<number>(minWidth);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;
      const move = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newWidth = clamp(startWidth + delta, minWidth, maxWidth);
        setWidth(newWidth);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      };
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        if (control !== undefined) {
          if (control.validate(width)) {
            control.setWidth(width);
          } else {
            setWidth(control.getRecentValidated(width));
          }
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [width, minWidth, maxWidth]
  );

  return (
    <div className={`relative ${className ?? ""}`} style={{ width: width }}>
      {children}
      <div
        className="absolute right-0 bottom-0 w-4 h-4 bg-foreground cursor-nwse-resize z-10"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default WidthResizable;
