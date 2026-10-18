# Rate limits and retries

Public API requests from the same client IP currently share an allowance of **1,000 requests per minute**, with additional short-burst controls. Different keys do not provide independent allowances for that source. This is an API traffic limit, not a product-plan execution quota or a permanent entitlement. Plan traffic from the response headers when present; early failures may occur before these headers are added:

- `X-RateLimit-Limit`: integer request allowance in the active window.
- `X-RateLimit-Remaining`: estimated integer requests remaining, not a reservation.
- `X-RateLimit-Reset`: a forward reset estimate from response time as a Unix timestamp in seconds; it is not an exact boundary or a guarantee that the next request will be accepted.
- `X-RateLimit-Window`: window duration as duration text; `1m0s` means one minute.
- `X-RateLimit-Policy`: informational policy label; treat it as opaque and use the allowance/window headers when planning requests.

The current response does **not** emit `Retry-After`; do not require it. On HTTP 429, wait until the estimated reset and add bounded exponential backoff with jitter. Use a timeout for every request and cap retry attempts. A network failure or timeout may occur after a write succeeded: read the affected resource and reconcile state before sending another mutation. No idempotency-key header is provided for these operations.

HTTP status identifies the outcome; `exception.retryable` may indicate a transient server condition but does not make a mutation safe to repeat. Automatically replay only reads or writes whose idempotency you have independently established.
