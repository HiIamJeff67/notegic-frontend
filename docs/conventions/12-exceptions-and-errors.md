# Exceptions and errors

Frontend domain failures use one pair of types. An exception is the data. An
error is the thrown object that carries that data and, when needed, a
translation key. Both owners live under `shared/api/exceptions/`.

## Ownership

Declare a new exception catalog or a new `NotegicError` subclass only inside
`shared/api/exceptions/`. Do not add one under `apps/`, `shared/lib/`,
`shared/api/retryClient.ts`, or a feature folder. Where that folder sits in
`shared/api/` is in [shared/api/README.md](../../shared/api/README.md).

| Kind | Owner | What it is |
| --- | --- | --- |
| Exception value | `NotegicException` in `shared/api/exceptions/index.ts` | `code`, `prefix`, `reason`, `message`, `status`, optional `details`, `origin`, and `retryable`. It does not extend `Error`. |
| Reason strings | `ExceptionReasonDictionary` in the same file | The `reason` a catalog may use. Add the string here, then reference it from the catalog. |
| Domain catalog | `shared/api/exceptions/<domain>.exception.ts` | Static factories that return `NotegicException`. `AuthExceptions` and `UserSettingExceptions` extend `DatabaseException`. |
| Client catalog | `shared/api/exceptions/client/<domain>.exception.ts` | Same factories for failures that originate in the client, such as fetch, validation, and the local database. |
| Thrown base | `NotegicError` in `shared/api/exceptions/errors/index.ts` | Extends `Error`. Owns `setPresentation`, `getPresentation`, and `consumePresentation`. |
| Thrown API error | `NotegicAPIError` in `shared/api/exceptions/index.ts` | Wraps one `NotegicException`. `unWrap` returns it. `instanceof` works across server and client bundles. |
| Other thrown errors | `shared/api/exceptions/errors/<domain>.error.ts` | `NotegicFetchError`, `NotegicValidationError`, and `NotegicLocalDatabaseError`. Each wraps one `NotegicException` and exposes `unWrap`. |

WebSocket frame shapes under `shared/api/websocket/types/` are protocol
payloads. They are not this error system. Do not add a second error class for
a frame.

## Catalog shape

A catalog is a class of static factories. It does not get constructed.

- `BaseCode` is `subDomainCode * ExceptionSubDomainCodeShiftAmount`. Each
  factory adds its own offset.
- `Prefix` is the domain name stored on the exception.
- Identity fields use PascalCase, including `BaseCode`, `Prefix`, and
  `RetryScope`.
- A factory returns `new NotegicException({...})` or, when the caller must
  throw immediately, `new NotegicAPIError(new NotegicException({...}))`.
- `UserSettingExceptions.TooManyRequests` returns `NotegicAPIError` because the
  settings caller throws it directly.
- `RetryScope` is the scope id a caller passes to `RetryClient`. The catalog
  does not import `RetryClient`. The caller records the deadline, then throws
  the catalog error itself. Do not add a method that both stores the deadline
  and throws, because the call looks like a side effect.

`RealtimeError` in `client/realtime.exception.ts` is an existing catalog that
returns `NotegicException`. New catalogs use the `Exceptions` name. Do not add
another catalog whose name ends in `Error`.

## What to throw

Throw a `NotegicError` subclass at the request boundary. Keep the
`NotegicException` inside it.

```ts
throw new NotegicFetchError(FetchClientExceptions.MissingNetwork());
throw UserSettingExceptions.TooManyRequests(retryAt);
```

Catch `NotegicAPIError` when the branch is an API failure. Read
`error.unWrap.status` and `error.unWrap.reason` from the exception. Do not
parse the error message.

`NotegicError.setPresentation(key)` stores a translation key. Presentation
rules are in [Translation entry points](10-translations.md). Do not put a
translated sentence in `new Error(...)`.

## Non-goals

- Replacing `NotegicException` with a thrown `Error` subclass.
- A per-feature `errors.ts` next to a hook, invoker, or page.
- Moving catalog factories into `RetryClient`. The client stores deadlines.
  The catalog defines the failure.
