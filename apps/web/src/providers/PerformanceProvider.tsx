import { createContext, type ReactNode, useEffect, useState } from "react";

export type Capability = "Severely" | "Bad" | "Normal" | "Well" | "Great";

interface PerformanceContextValue {
  capability: Capability;
  isCapabilityDetected: boolean;
}

export const PerformanceContext = createContext<
  PerformanceContextValue | undefined
>(undefined);

export const PerformanceProvider = ({ children }: { children: ReactNode }) => {
  const [capability, setCapability] = useState<Capability>("Normal");
  const [isCapabilityDetected, setIsCapabilityDetected] = useState(false);

  useEffect(() => {
    let score = 0;
    const processorCount = navigator.hardwareConcurrency;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const renderedPixels =
      window.innerWidth *
      window.innerHeight *
      Math.min(window.devicePixelRatio, 2) ** 2;

    if (processorCount <= 2) score -= 2;
    else if (processorCount <= 4) score -= 1;
    else if (processorCount >= 12) score += 2;
    else if (processorCount >= 8) score += 1;

    if (deviceMemory !== undefined) {
      if (deviceMemory <= 2) score -= 2;
      else if (deviceMemory <= 4) score -= 1;
      else if (deviceMemory >= 16) score += 2;
      else if (deviceMemory >= 8) score += 1;
    }

    if (renderedPixels > 7_000_000) score -= 2;
    else if (renderedPixels > 4_000_000) score -= 1;
    else if (renderedPixels < 1_500_000) score += 1;

    const canvas = document.createElement("canvas");
    const webGL2Context = canvas.getContext("webgl2");
    const context = webGL2Context ?? canvas.getContext("webgl");

    if (!context) {
      setCapability("Severely");
      setIsCapabilityDetected(true);
      return;
    }

    if (!webGL2Context) score -= 1;

    const maxTextureSize = context.getParameter(
      context.MAX_TEXTURE_SIZE
    ) as number;
    if (maxTextureSize < 4_096) score -= 2;
    else if (maxTextureSize < 8_192) score -= 1;
    else if (maxTextureSize >= 16_384) score += 1;

    context.getExtension("WEBGL_lose_context")?.loseContext();

    if (score <= -4) setCapability("Severely");
    else if (score <= -2) setCapability("Bad");
    else if (score <= 1) setCapability("Normal");
    else if (score <= 3) setCapability("Well");
    else setCapability("Great");
    setIsCapabilityDetected(true);
  }, []);

  return (
    <PerformanceContext.Provider value={{ capability, isCapabilityDetected }}>
      {children}
    </PerformanceContext.Provider>
  );
};
