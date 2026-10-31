export interface BandScale {
  bandwidth: number;
  step: number;
  getPosition: (id: string) => number;
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
