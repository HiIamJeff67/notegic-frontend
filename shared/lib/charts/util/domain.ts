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
  const finiteValues = values.filter(Number.isFinite);

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
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) {
    return [0, 1];
  }

  const min = Math.min(0, Math.floor(Math.min(...finiteValues)));
  const max = Math.max(0, Math.ceil(Math.max(...finiteValues)));

  return min === max ? [min, min + 1] : [min, max];
}
