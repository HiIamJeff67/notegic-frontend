import type {
  TwoDimensionalData,
  TwoDimensionalDatum,
} from "./dimensionalChart.type";

export interface PieChartSlice<TMeta = unknown> {
  id: string;
  label: string;
  value: number;
  color?: string;
  meta?: TMeta;
}

export interface PieChartData<TMeta = unknown> {
  slices: PieChartSlice<TMeta>[];
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
