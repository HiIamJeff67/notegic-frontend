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
