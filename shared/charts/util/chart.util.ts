import type {
  ChartSeries,
  PieChartData,
  TwoDimensionalData,
  TwoDimensionalDatum,
} from "../types";
import { createSingleSeriesCartesianData } from "../types";

export interface BandScale {
  bandwidth: number;
  step: number;
  getPosition: (id: string) => number;
}

export function isFiniteChartValue(value: number): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function hasPositiveChartValue(points: TwoDimensionalDatum[]) {
  return points.some(point => point.value > 0);
}

export function toCartesianChartData<TMeta = unknown>(
  data: TwoDimensionalData<TMeta> | TwoDimensionalDatum<TMeta>[],
  series: ChartSeries
) {
  const points = Array.isArray(data) ? data : data.data;

  return createSingleSeriesCartesianData(
    series,
    points.map(point => ({
      id: point.id,
      x: point.x,
      y: point.value,
      label: point.x,
      meta: point.meta,
    }))
  );
}

export function toPieChartData<TMeta = unknown>(
  data: TwoDimensionalData<TMeta> | TwoDimensionalDatum<TMeta>[]
): PieChartData<TMeta> {
  const points = Array.isArray(data) ? data : data.data;

  return {
    slices: points.map(point => ({
      id: point.id,
      label: point.x,
      value: point.value,
      meta: point.meta,
    })),
  };
}

export function splitSvgTextLines(
  text: string,
  maxCharsPerLine: number,
  maxLines = 2
) {
  const safeText = text.trim();
  const safeMaxChars = Math.max(1, Math.floor(maxCharsPerLine));
  if (safeText.length <= safeMaxChars) return [safeText];

  const words = safeText.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= safeMaxChars) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) lines.push(currentLine);
    if (word.length > safeMaxChars) {
      lines.push(word.slice(0, safeMaxChars));
      currentLine = word.slice(safeMaxChars);
      continue;
    }
    currentLine = word;
  }

  if (currentLine) lines.push(currentLine);

  if (lines.length <= maxLines) return lines;

  return [
    ...lines.slice(0, maxLines - 1),
    `${lines[maxLines - 1].slice(0, Math.max(1, safeMaxChars - 1))}…`,
  ];
}

export function createLinearDomain(
  values: number[],
  options: {
    includeZero?: boolean;
    paddingRatio?: number;
    fallback?: [number, number];
  } = {}
): [number, number] {
  const {
    includeZero = true,
    paddingRatio = 0.08,
    fallback = [0, 1],
  } = options;
  const finiteValues = values.filter(isFiniteChartValue);

  if (finiteValues.length === 0) {
    return fallback;
  }

  let min = Math.min(...finiteValues);
  let max = Math.max(...finiteValues);

  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }

  if (min === max) {
    const offset = Math.abs(min || 1) * 0.1;
    return [min - offset, max + offset];
  }

  const padding = (max - min) * paddingRatio;
  return [min - padding, max + padding];
}

export function createIntegerDomain(values: number[]): [number, number] {
  const finiteValues = values.filter(isFiniteChartValue);
  if (finiteValues.length === 0) {
    return [0, 1];
  }

  const min = Math.min(0, Math.floor(Math.min(...finiteValues)));
  const max = Math.max(0, Math.ceil(Math.max(...finiteValues)));

  return min === max ? [min, min + 1] : [min, max];
}

export function createLinearScale(
  domain: [number, number],
  range: [number, number]
) {
  const domainSpan = domain[1] - domain[0];

  if (domainSpan === 0) {
    return () => (range[0] + range[1]) / 2;
  }

  return (value: number) =>
    range[0] + ((value - domain[0]) / domainSpan) * (range[1] - range[0]);
}

export function createBandScale(
  ids: string[],
  range: [number, number],
  padding = 0.2
): BandScale {
  const [start, end] = range;
  const count = ids.length;
  const size = Math.max(0, end - start);

  if (count === 0 || size === 0) {
    return {
      bandwidth: 0,
      step: 0,
      getPosition: () => start,
    };
  }

  const safePadding = Math.min(Math.max(padding, 0), 0.9);
  const step = size / count;
  const bandwidth = step * (1 - safePadding);
  const offset = (step - bandwidth) / 2;
  const positions = new Map<string, number>();

  ids.forEach((id, index) => {
    positions.set(id, start + index * step + offset);
  });

  return {
    bandwidth,
    step,
    getPosition: (id: string) => positions.get(id) ?? start,
  };
}

export function createLinearTicks(domain: [number, number], count = 5) {
  const safeCount = Math.max(2, Math.floor(count));
  const span = domain[1] - domain[0];

  if (span === 0) {
    return [domain[0]];
  }

  const step = span / (safeCount - 1);
  return Array.from(
    { length: safeCount },
    (_, index) => domain[0] + step * index
  );
}

export function createIntegerTicks(domain: [number, number], count = 5) {
  const safeCount = Math.max(2, Math.floor(count));
  const start = Math.floor(domain[0]);
  const end = Math.ceil(domain[1]);
  const span = end - start;

  if (span <= 0) {
    return [start];
  }

  const step = Math.max(1, Math.ceil(span / (safeCount - 1)));
  const firstTick = Math.floor(start / step) * step;
  const ticks: number[] = [];

  for (let tick = firstTick; tick <= end; tick += step) {
    if (tick >= start) ticks.push(tick);
  }

  if (ticks[ticks.length - 1] !== end) {
    ticks.push(end);
  }

  return ticks;
}
