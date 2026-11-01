export interface OneDimensionalDatum<
  TMeta = unknown,
  V extends number = number,
> {
  id: string;
  label: string;
  value: V;
  meta?: TMeta;
}

export interface OneDimensionalData<
  TMeta = unknown,
  V extends number = number,
> {
  data: OneDimensionalDatum<TMeta, V>[];
}

export interface TwoDimensionalDatum<
  TMeta = unknown,
  V extends number = number,
> {
  id: string;
  x: string;
  value: V;
  meta?: TMeta;
}

export interface TwoDimensionalData<
  TMeta = unknown,
  V extends number = number,
> {
  data: TwoDimensionalDatum<TMeta, V>[];
}

export interface ThreeDimensionalDatum<
  TMeta = unknown,
  V extends number = number,
> {
  id: string;
  x: string;
  y: string;
  value: V;
  meta?: TMeta;
}

export interface ThreeDimensionalData<
  TMeta = unknown,
  V extends number = number,
> {
  data: ThreeDimensionalDatum<TMeta, V>[];
}

export const SupportedChartTypesByDimension = {
  oneDimensional: [],
  twoDimensional: ["line", "pie", "bar", "column"],
  threeDimensional: [],
} as const;

export type OneDimensionalChartType =
  (typeof SupportedChartTypesByDimension.oneDimensional)[number];

export type TwoDimensionalChartType =
  (typeof SupportedChartTypesByDimension.twoDimensional)[number];

export type ThreeDimensionalChartType =
  (typeof SupportedChartTypesByDimension.threeDimensional)[number];
