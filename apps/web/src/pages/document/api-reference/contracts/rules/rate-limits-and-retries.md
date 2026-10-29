# Rate limits and retries

Public API requests share a limit of **1,000 requests per minute** per client IP, with additional burst limits.

When present, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` provide the allowance, estimated remaining requests, and estimated reset time as Unix seconds.

On HTTP 429, pause requests and retry with bounded exponential backoff and jitter. Use available rate-limit headers to guide request pacing. Set request timeouts and cap retry attempts. Before retrying a write after a timeout or connection failure, check whether the change was applied.
