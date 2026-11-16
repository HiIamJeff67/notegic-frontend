// Product floor when Retry-After is missing, invalid, or shorter than a minute.
export const minimumRetryDelayMs = 60_000;

// Convert Retry-After into an epoch-millisecond deadline.
// The caller supplies the minimum delay and owns any cooldown.
export const getRetryAt = (
  retryAfter: string | null,
  now = Date.now(),
  minimumDelayMs: number
): number => {
  const seconds = retryAfter?.trim() ? Number(retryAfter) : NaN;
  const deadline = Number.isFinite(seconds)
    ? now + seconds * 1000
    : Date.parse(retryAfter ?? "");
  return Math.max(
    now + minimumDelayMs,
    Number.isFinite(deadline) ? deadline : 0
  );
};

type RetryFetch = {
  scope: string;
  input: Parameters<typeof fetch>[0];
  init?: Parameters<typeof fetch>[1];
  fetch: typeof fetch;
  minimumDelayMs: number;
  paused: (retryAt: number) => never;
};

// One browser-wide deadline per API scope. A scope covers every read and write
// of that API. The client does not replay a failed call when the deadline passes.
export class RetryClient {
  private readonly deadlines = new Map<string, number>();

  deadline(scope: string): number {
    return this.deadlines.get(scope) ?? 0;
  }

  pause(scope: string, retryAt: number): number {
    if (typeof window === "undefined") return retryAt;
    const deadline = Math.max(this.deadline(scope), retryAt);
    this.deadlines.set(scope, deadline);
    return deadline;
  }

  assertReady(scope: string, paused: (retryAt: number) => never): void {
    const deadline = this.deadline(scope);
    if (Date.now() < deadline) paused(deadline);
  }

  createFetch(request: Omit<RetryFetch, "input" | "init">): typeof fetch {
    return (input, init) => this.fetch({ ...request, input, init });
  }

  async fetch(request: RetryFetch): Promise<Response> {
    const deadline = this.deadline(request.scope);
    if (Date.now() < deadline) request.paused(deadline);
    const response = await request.fetch(request.input, request.init);
    if (response.status !== 429) return response;
    const retryAt = getRetryAt(
      response.headers.get("Retry-After"),
      Date.now(),
      request.minimumDelayMs
    );
    this.pause(request.scope, retryAt);
    request.paused(retryAt);
  }
}

let retryClient: RetryClient | undefined;

export const createRetryClient = (): RetryClient => new RetryClient();

export const getRetryClient = (): RetryClient => {
  if (typeof window === "undefined") return createRetryClient();
  if (!retryClient) retryClient = createRetryClient();
  return retryClient;
};
