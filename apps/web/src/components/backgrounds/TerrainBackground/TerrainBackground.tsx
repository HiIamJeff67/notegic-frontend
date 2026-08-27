import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { usePerformance, useScreen } from "@/hooks";
import { TerrainGridFloor } from "./TerrainGridFloor";
import { TerrainPointCloud } from "./TerrainPointCloud";
import { type TerrainAlgorithm, terrainSeeds } from "./terrain.data";

const TerrainCamera = ({
  position,
  target,
  rotation,
}: {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  rotation?: readonly [number, number, number];
}) => {
  const camera = useThree(state => state.camera);

  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.up.set(0, 1, 0);
    if (rotation) camera.rotation.set(...rotation);
    else camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, position, rotation, target]);

  return null;
};

const TerrainRendererSettings = ({ isDark }: { isDark: boolean }) => {
  const gl = useThree(state => state.gl);

  useEffect(() => {
    gl.setClearColor(isDark ? "#000000" : "#ffffff", 1);
  }, [gl, isDark]);

  return null;
};

export const TerrainBackground = ({
  children,
  isDark,
}: {
  children: ReactNode;
  isDark: boolean;
}) => {
  const { capability, isCapabilityDetected } = usePerformance();
  const { breakpoint } = useScreen();
  const initialBreakpoint = useRef(breakpoint).current;
  const camera = useMemo(() => {
    switch (initialBreakpoint) {
      case "base":
        return {
          position: [30, 104, 80] as const,
          target: [0, -14, -20] as const,
        };
      case "sm":
        return {
          position: [28, 94, 72] as const,
          target: [0, -14, -20] as const,
        };
      case "md":
        return {
          position: [24, 84, 58] as const,
          target: [0, -14, -20] as const,
        };
      default:
        return {
          position: [83.54, 24.783, -95.23] as const,
          rotation: [-2.897, 0.823, 2.961] as const,
          target: [0, 6, -20] as const,
        };
    }
  }, [initialBreakpoint]);
  const [terrain, setTerrain] = useState<{
    pointCount: number;
    pointSize: number;
    seed: number;
    algorithm: TerrainAlgorithm;
  } | null>(null);

  useEffect(() => {
    if (!isCapabilityDetected) return;

    let frame = 0;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const scheduleTerrain = () => {
      let seed = SessionStorageManipulator.getItemByKey(
        SessionStorageKey.terrainSeed
      );

      if (
        typeof seed !== "number" ||
        !(terrainSeeds as readonly number[]).includes(seed)
      ) {
        seed = terrainSeeds[Math.floor(Math.random() * terrainSeeds.length)];
        SessionStorageManipulator.setItem(SessionStorageKey.terrainSeed, seed);
      }

      const settings = {
        Severely: { pointCount: 40_000, pointSize: 0.062 },
        Bad: { pointCount: 72_000, pointSize: 0.052 },
        Normal: { pointCount: 120_000, pointSize: 0.044 },
        Well: { pointCount: 184_000, pointSize: 0.038 },
        Great: { pointCount: 256_000, pointSize: 0.033 },
      }[capability];
      const algorithm: TerrainAlgorithm =
        capability === "Severely" || capability === "Bad" ? "sparse" : "dense";

      setTerrain(
        currentTerrain => currentTerrain ?? { ...settings, algorithm, seed }
      );
    };

    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === "function") {
          idleHandle = window.requestIdleCallback(scheduleTerrain, {
            timeout: 1_000,
          });
        } else {
          timeoutHandle = window.setTimeout(scheduleTerrain, 120);
        }
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [capability, isCapabilityDetected]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}
    >
      {terrain && (
        <>
          <div className="pointer-events-auto absolute inset-0 z-0">
            <Canvas
              camera={{
                far: 280,
                fov: 34,
                near: 0.1,
                position: camera.position,
              }}
              className="size-full"
              dpr={1}
              frameloop="always"
              gl={{
                alpha: false,
                antialias: false,
                powerPreference: "high-performance",
              }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
            >
              <TerrainRendererSettings isDark={isDark} />
              <TerrainCamera
                position={camera.position}
                rotation={camera.rotation}
                target={camera.target}
              />
              <OrbitControls
                autoRotate
                autoRotateSpeed={-1}
                enableDamping={false}
                makeDefault
                target={camera.target}
              />
              <TerrainGridFloor isDark={isDark} />
              <TerrainPointCloud
                color={isDark ? "#ffffff" : "#111111"}
                pointCount={terrain.pointCount}
                pointSize={isDark ? terrain.pointSize : terrain.pointSize * 3.5}
                seed={terrain.seed}
                algorithm={terrain.algorithm}
              />
            </Canvas>
          </div>
        </>
      )}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: isDark
            ? "radial-gradient(ellipse clamp(260px, 42vw, 620px) clamp(160px, 30vh, 300px) at 50% 48%, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.78) 36%, rgba(0, 0, 0, 0.34) 72%, transparent 100%)"
            : "radial-gradient(ellipse clamp(260px, 42vw, 620px) clamp(160px, 30vh, 300px) at 50% 48%, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.78) 36%, rgba(255, 255, 255, 0.34) 72%, transparent 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
