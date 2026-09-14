// Convert Retry-After to an epoch-millisecond deadline with a 60-second floor.
// Callers own cooldown state and scheduling; this function only computes time.
export const getRetryAt = (
  retryAfter: string | null,
  now = Date.now()
): number => {
  const seconds = retryAfter?.trim() ? Number(retryAfter) : NaN;
  const deadline = Number.isFinite(seconds)
    ? now + seconds * 1000
    : Date.parse(retryAfter ?? "");
  return Math.max(now + 60_000, Number.isFinite(deadline) ? deadline : 0);
};
