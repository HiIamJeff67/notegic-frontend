---
name: security-and-error-boundary-check
description: Check frontend changes for authentication, authorization assumptions, CSRF/cookie handling, XSS and unsafe rendering, secret exposure, error redaction, and trust-boundary validation. Use for security reviews or changes touching identity, API requests, user content, local persistence, or runtime configuration.
---

# Security and error-boundary check

Read the relevant frontend conventions and `docs/conventions/08-testing.md`; for API/session behavior also read `../notegic-backend/docs/conventions/03-http-api.md`, `06-exceptions.md`, and `08-environment-secrets.md`.

Check the full user and request path for:

- authentication versus authorization assumptions; never treat hidden UI as authorization;
- cookie, CSRF/origin, API-key, token, redirect, and WebSocket-handshake handling;
- validation at input and rendering boundaries, unsafe HTML/URL/file handling, tenant/resource isolation, and browser storage exposure;
- public error payload safety, origin/error redaction, logging/telemetry leakage, and useful but non-sensitive user feedback;
- environment variables, source maps, generated files, build output, query strings, analytics, and logs for secret leakage;
- retries, stale auth, fail-open states, race conditions, and cleanup on logout/unmount.

Never print, copy, or request real credentials, cookies, or tokens. Use non-production fixtures and sanitized browser/network output. Do not weaken a control to make a test pass.

## Output

Report concrete findings with severity, location, attack/failure path, and minimal remediation. Include tests or checks that would catch the issue. Review only unless implementation is explicitly requested.
