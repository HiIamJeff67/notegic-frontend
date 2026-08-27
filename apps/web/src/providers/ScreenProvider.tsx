import { ScreenBreakpoint } from "@shared/types/screenBreakpoint";
import { createContext, useEffect, useState } from "react";

interface ScreenContextType {
  width: number;
  height: number;
  breakpoint: ScreenBreakpoint;
  isZooming: boolean;
}

export const ScreenContext = createContext<ScreenContextType | undefined>(
  undefined
);

const getBreakpoint = (width: number): ScreenBreakpoint => {
  if (width >= 1920) return "3xl";
  if (width >= 1536) return "2xl";
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "base";
};

interface ScreenProviderProps {
  children: React.ReactNode;
}

export const ScreenProvider = ({ children }: ScreenProviderProps) => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [height, setHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );
  const [breakpoint, setBreakpoint] = useState<ScreenBreakpoint>(
    getBreakpoint(width)
  );
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setWidth(newWidth);
      setHeight(newHeight);
      setBreakpoint(getBreakpoint(newWidth));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsZooming(true);
    const timer = setTimeout(() => {
      setIsZooming(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [width, height]);

  return (
    <ScreenContext.Provider
      value={{
        width: width,
        height: height,
        breakpoint: breakpoint,
        isZooming: isZooming,
      }}
    >
      {children}
    </ScreenContext.Provider>
  );
};
