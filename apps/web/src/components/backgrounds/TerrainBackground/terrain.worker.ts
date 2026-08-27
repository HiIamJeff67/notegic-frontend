import { createTerrainPositions, type TerrainAlgorithm } from "./terrain.data";

type TerrainWorkerRequest = {
  algorithm: TerrainAlgorithm;
  pointCount: number;
  seed: number;
};

self.onmessage = ({ data }: MessageEvent<TerrainWorkerRequest>) => {
  const positions = createTerrainPositions(
    data.seed,
    data.pointCount,
    data.algorithm
  );

  (
    self as unknown as {
      postMessage(message: ArrayBuffer, transfer: Transferable[]): void;
    }
  ).postMessage(positions.buffer, [positions.buffer]);
};
