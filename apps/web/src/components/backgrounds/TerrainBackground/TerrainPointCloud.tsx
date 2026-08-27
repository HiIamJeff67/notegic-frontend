import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import type { TerrainAlgorithm } from "./terrain.data";

export const TerrainPointCloud = ({
  color,
  pointCount,
  pointSize,
  seed,
  algorithm,
}: {
  color: string;
  pointCount: number;
  pointSize: number;
  seed: number;
  algorithm: TerrainAlgorithm;
}) => {
  const invalidate = useThree(state => state.invalidate);
  const [targetPositions, setTargetPositions] = useState<Float32Array | null>(
    null
  );

  useEffect(() => {
    const worker = new Worker(new URL("./terrain.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => {
      setTargetPositions(new Float32Array(data));
    };
    worker.postMessage({ algorithm, pointCount, seed });

    return () => {
      worker.terminate();
      setTargetPositions(null);
    };
  }, [algorithm, pointCount, seed]);

  const geometry = useMemo(() => {
    if (!targetPositions) return null;

    const nextGeometry = new THREE.BufferGeometry();
    const initialPositions = targetPositions.slice();
    let lowestY = Infinity;

    for (let index = 1; index < targetPositions.length; index += 3) {
      lowestY = Math.min(lowestY, targetPositions[index]);
    }

    nextGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(initialPositions, 3)
    );
    nextGeometry.computeBoundingSphere();

    for (let index = 1; index < initialPositions.length; index += 3) {
      initialPositions[index] = lowestY;
    }

    nextGeometry.getAttribute("position").needsUpdate = true;
    return nextGeometry;
  }, [targetPositions]);

  useEffect(() => {
    if (!geometry || !targetPositions) return;

    const positions = geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    let lowestY = Infinity;
    let highestY = -Infinity;

    for (let index = 1; index < targetPositions.length; index += 3) {
      lowestY = Math.min(lowestY, targetPositions[index]);
      highestY = Math.max(highestY, targetPositions[index]);
    }

    const travelDistance = highestY - lowestY;
    const startedAt = performance.now();
    let frameId = 0;

    invalidate();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 2_000);

      for (let index = 1; index < targetPositions.length; index += 3) {
        const targetY = targetPositions[index];
        const nextY = lowestY + (targetY - lowestY) * progress;

        positions.array[index] = nextY;
      }

      positions.needsUpdate = true;
      invalidate();

      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    if (travelDistance === 0) return;

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [geometry, invalidate, targetPositions]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color={color}
        depthWrite={false}
        size={pointSize * 16}
        sizeAttenuation={false}
      />
    </points>
  );
};
