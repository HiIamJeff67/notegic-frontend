export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartSeries {
  id: string;
  label: string;
  color?: string;
}

export type ChartValueMode = "continuous" | "integer";

export type ChartActiveKind = "column" | "bar" | "line-point" | "pie-slice";

export interface ChartActive<TMeta = unknown> {
  kind: ChartActiveKind;
  label: string;
  value: number;
  color: string;
  seriesId?: string;
  seriesLabel?: string;
  datumId?: string;
  sliceId?: string;
  x?: string;
  meta?: TMeta;
}

export interface ChartTooltipContext<TMeta = unknown> {
  active: ChartActive<TMeta>;
}
