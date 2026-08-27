import { SimplexNoise } from "three/addons/math/SimplexNoise.js";

export const terrainSeeds = [
  10_729, 23_117, 31_337, 45_931, 57_779, 68_923, 79_219, 88_901, 101_111,
  117_017, 131_071, 149_069, 167_449, 181_081, 199_933, 217_111,
] as const;

export type TerrainAlgorithm = "sparse" | "dense";

const terrainWidth = 120;
const terrainDepth = 112;
const terrainScale = 0.9;
const terrainCenterZ = -24;

const createRandom = (seed: number) => {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const ridgedFbm = (noise: SimplexNoise, x: number, z: number) => {
  let amplitude = 0.56;
  let frequency = 1;
  let value = 0;
  let normalization = 0;

  for (let octave = 0; octave < 4; octave++) {
    const ridge = 1 - Math.abs(noise.noise(x * frequency, z * frequency));
    value += ridge * ridge * amplitude;
    normalization += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }

  return value / normalization;
};

export const createTerrainPositions = (
  seed: number,
  pointCount: number,
  algorithm: TerrainAlgorithm = "dense"
) => {
  const isDense = algorithm === "dense";
  const layoutRandom = createRandom(seed);
  const pointRandom = createRandom(seed ^ 0x9e3779b9);
  const noise = new SimplexNoise({ random: createRandom(seed ^ 0x85ebca6b) });
  const positions: number[] = [];
  const samplingPointCount = Math.ceil(pointCount * 1.48);
  const columns = Math.ceil(
    Math.sqrt(samplingPointCount * (terrainWidth / terrainDepth))
  );
  const rows = Math.ceil(samplingPointCount / columns);
  const columnSpacing = terrainWidth / columns;
  const rowSpacing = terrainDepth / rows;
  const jitter = 0.72 + layoutRandom() * 0.12;
  const surfaceOffsetX = layoutRandom() * 80;
  const surfaceOffsetZ = layoutRandom() * 80;
  const peaks = [
    {
      height: 34 * (0.96 + layoutRandom() * 0.08),
      widthX: 9.2,
      widthZ: 14.2,
      x: 3 + (layoutRandom() - 0.5) * 2,
      z: terrainCenterZ + (layoutRandom() - 0.5) * 2,
    },
    {
      height: 18.7 * (0.96 + layoutRandom() * 0.08),
      widthX: 10,
      widthZ: 14,
      x: 17 + (layoutRandom() - 0.5) * 2,
      z: terrainCenterZ + 1 + (layoutRandom() - 0.5) * 2,
    },
    {
      height: 5.4 * (0.9 + layoutRandom() * 0.2),
      widthX: 13,
      widthZ: 15,
      x: -22 + (layoutRandom() - 0.5) * 3,
      z: terrainCenterZ + 5 + (layoutRandom() - 0.5) * 3,
    },
    {
      height: 4.2 * (0.9 + layoutRandom() * 0.2),
      widthX: 12,
      widthZ: 14,
      x: 25 + (layoutRandom() - 0.5) * 3,
      z: terrainCenterZ + 4 + (layoutRandom() - 0.5) * 3,
    },
    {
      height: 3.5 * (0.9 + layoutRandom() * 0.2),
      widthX: 12,
      widthZ: 11,
      x: -30 + (layoutRandom() - 0.5) * 4,
      z: terrainCenterZ + 22 + (layoutRandom() - 0.5) * 4,
    },
    {
      height: 3 * (0.9 + layoutRandom() * 0.2),
      widthX: 11,
      widthZ: 11,
      x: -12 + (layoutRandom() - 0.5) * 4,
      z: terrainCenterZ + 30 + (layoutRandom() - 0.5) * 4,
    },
    {
      height: 2.5 * (0.9 + layoutRandom() * 0.2),
      widthX: 10,
      widthZ: 10,
      x: 9 + (layoutRandom() - 0.5) * 4,
      z: terrainCenterZ + 26 + (layoutRandom() - 0.5) * 4,
    },
    {
      height: 2.1 * (0.9 + layoutRandom() * 0.2),
      widthX: 9,
      widthZ: 9,
      x: 29 + (layoutRandom() - 0.5) * 4,
      z: terrainCenterZ + 36 + (layoutRandom() - 0.5) * 4,
    },
    ...(isDense
      ? [
          {
            height: 3 * (0.9 + layoutRandom() * 0.2),
            widthX: 9,
            widthZ: 10,
            x: -10 + (layoutRandom() - 0.5) * 3,
            z: terrainCenterZ - 7 + (layoutRandom() - 0.5) * 3,
          },
          {
            height: 2.6 * (0.9 + layoutRandom() * 0.2),
            widthX: 8,
            widthZ: 9,
            x: 15 + (layoutRandom() - 0.5) * 3,
            z: terrainCenterZ - 8 + (layoutRandom() - 0.5) * 3,
          },
        ]
      : []),
  ];

  for (let index = 0; index < samplingPointCount; index++) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x =
      (((column + 0.5) / columns - 0.5) * terrainWidth +
        (pointRandom() - 0.5) * columnSpacing * jitter) *
      terrainScale;
    const z =
      (terrainCenterZ +
        ((row + 0.5) / rows - 0.5) * terrainDepth +
        (pointRandom() - 0.5) * rowSpacing * jitter) *
      terrainScale;
    const warpedX =
      x + noise.noise(x * 0.035 + surfaceOffsetX, z * 0.035) * 1.2;
    const warpedZ =
      z + noise.noise(x * 0.035, z * 0.035 + surfaceOffsetZ) * 1.2;
    const base =
      0.9 *
      Math.exp(
        -(
          Math.pow(warpedX / 31, 2) +
          Math.pow((warpedZ - terrainCenterZ) / 23, 2)
        )
      );
    let peakHeight = 0;

    for (const peak of peaks) {
      const localZWidth =
        peak.widthZ * (1.2 - 0.25 / (1 + Math.exp(-(warpedZ - peak.z) * 0.4)));
      peakHeight = Math.max(
        peakHeight,
        peak.height *
          Math.exp(
            -(
              Math.pow(Math.abs((warpedX - peak.x) / peak.widthX), 1.65) +
              Math.pow(Math.abs((warpedZ - peak.z) / localZWidth), 1.65)
            )
          )
      );
    }

    const terrainHeight = base + peakHeight;
    const boundaryProgress = Math.min(1, terrainHeight / 4.5);
    const coarseEdgeNoise =
      (noise.noise(
        warpedX * 0.12 + surfaceOffsetX,
        warpedZ * 0.12 + surfaceOffsetZ
      ) +
        1) /
      2;
    const fineEdgeNoise =
      (noise.noise(
        warpedX * 0.34 + surfaceOffsetX * 1.7,
        warpedZ * 0.34 + surfaceOffsetZ * 1.7
      ) +
        1) /
      2;
    const edgeNoise =
      0.08 + 0.92 * (coarseEdgeNoise * 0.58 + fineEdgeNoise * 0.42);
    const gradientKeep =
      (boundaryProgress >= 1
        ? 1
        : 0.006 + Math.pow(boundaryProgress, 1.65) * 0.994) * edgeNoise;
    const boundaryKeep = gradientKeep;
    if (pointRandom() > boundaryKeep) continue;

    const surfaceDetail =
      (ridgedFbm(
        noise,
        warpedX * (isDense ? 0.08 : 0.06) + surfaceOffsetX,
        warpedZ * (isDense ? 0.08 : 0.06) + surfaceOffsetZ
      ) -
        0.5) *
      Math.min(isDense ? 3.6 : 1.6, terrainHeight * (isDense ? 0.18 : 0.1));
    const height = -6 + (terrainHeight + surfaceDetail) * 0.94;

    if (!isDense && pointRandom() > 0.42) continue;
    positions.push(
      x,
      height + (pointRandom() - 0.5) * (isDense ? 0.18 : 0.12),
      z
    );
  }

  return new Float32Array(positions);
};
