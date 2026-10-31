import type { ChartSeries } from "./chart.type";
import type {
  TwoDimensionalData,
  TwoDimensionalDatum,
} from "./dimensionalChart.type";

export interface CartesianChartDatum<
  TMeta = unknown,
  V extends number = number,
> {
  id: string;
  x: string;
  label?: string;
  values: Record<string, V>;
  meta?: TMeta;
}

export interface CartesianChartData<
  TMeta = unknown,
  V extends number = number,
> {
  series: ChartSeries[];
  data: CartesianChartDatum<TMeta, V>[];
}

export interface SingleSeriesPoint<
  TMeta = unknown,
  VX extends string = string,
  VY extends number = number,
> {
  id: string;
  x: VX;
  y: VY;
  label?: string;
  meta?: TMeta;
}

export function createSingleSeriesCartesianData<
  TMeta = unknown,
  VX extends string = string,
  VY extends number = number,
>(
  series: ChartSeries,
  points: SingleSeriesPoint<TMeta, VX, VY>[]
): CartesianChartData<TMeta, VY> {
  return {
    series: [series],
    data: points.map<CartesianChartDatum<TMeta, VY>>(point => ({
      id: point.id,
      x: point.x,
      label: point.label,
      values: {
        [series.id]: point.y,
      },
      meta: point.meta,
    })),
  };
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
