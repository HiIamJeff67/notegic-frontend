# HTTP contract

The production base URL is `https://api.notegic.com/v1`. Send and receive JSON with `Content-Type: application/json` where a request body is required. Resource IDs in paths are UUID strings unless an operation states otherwise; timestamps are RFC 3339 date-time strings.

Successful JSON responses set `success` to true, put the result in `data`, and set `exception` to null. Failures set `success` to false, `data` to null, and include a public exception with `reason`, `domain`, `operation`, `message`, and `retryable`. Some successful operations return HTTP 204 with no body. An optional `embedded.publicId` is the public identifier of the authenticated user; it is context, not a substitute for resource authorization. Read the operation's response schema for the actual data shape and status.

For partial updates, `values` contains only fields to replace and `setNull` is an object mapping field names to booleans; a true entry requests that field be cleared where supported. An omitted field or a null value inside `values` leaves that field unchanged. Empty strings and arrays are explicit values and must satisfy the field's validation rules. Use `setNull` to clear a supported field. A replacement supplied in both places can take precedence over clearing; avoid conflicting entries. Unsupported properties are outside the contract and are not guaranteed to produce an error.

Deletion filters vary by resource. For RootShelf, SubShelf, BlockPack, Station, and Routine reads with `isDeleted` or `areDeleted`, false selects active resources, true selects deleted resources, and omission applies no deletion-state filter. Parent availability and access checks still apply. Routine Tasks and Routine Tags have no soft-deleted view: omission or false returns current resources; true produces an empty list or a not-found result for a single ID. Use false explicitly when an integration needs active resources only.

Deletion may be reversible or permanent. Paths containing `permanently` perform permanent deletion; use a restore operation only for resources that support it. Batch inputs can affect multiple resources; do not assume a batch is all-or-nothing or safe to replay unless its operation explicitly says so. List ordering, result size, and pagination are defined only when stated by the corresponding operation; no cursor-pagination protocol is promised by this v1 contract. Routine definitions and Task definitions are distinct from execution records, which are not exposed by this integration API.

RootShelves contain SubShelves, which organize BlockPacks and existing Materials. BlockPacks contain Blocks. Stations group Routines; each Routine owns Task definitions and can link to Routine Tags and items. A Routine Tag links to a Routine rather than directly to a Task. Resource access follows the owner's applicable shelf/station permissions. Deleting or losing access to a containing resource can make its contents unavailable. Block read views can trail accepted edits; `isProjectionCurrent` on the containing BlockPack indicates whether its read view has caught up. This API supports the published Block read operations; it provides no direct collaborative editing or realtime integration protocol.

Task creation saves a definition and validates its purpose-specific payload; it does not run the task. The OpenAPI payload variants describe all current purposes:

- GetSubShelf, GetBlockPack, GetRoutine, and GetMaterial select an existing target by its corresponding resource ID. Delete variants select the same target and request its deletion when the Task executes.
- CreateSubShelf needs a RootShelf, name, and task-local `fakeId`. Object references use a UUID or `f_` followed by 32 hexadecimal digits; a created object's reference may be used by a dependent Task in that execution.
- CreateBlockPack needs a target SubShelf reference and a template with a name and at least one editable Block entry. UpdateBlockPack needs a BlockPack ID and 1–1000 distinct Block IDs with replacement Block trees.
- CreateRoutine needs a Station and title, with optional scheduling fields. UpdateRoutine and UpdateSubShelf accept the target ID and the replacement fields described by their payload schemas.
- CreateMaterial and UpdateMaterial use an existing content reference; they do not add a public upload API. UpdateMaterial requires at least one changed content or metadata field. Direct Material and execution-record endpoints remain outside this API.

Task dependencies connect a Task to a prerequisite in the same Routine. Self-dependencies and cycles are rejected. Deleting a dependency removes the relation, not either Task. A Task's configured execution attempts may repeat work after a failure; designing a mutation payload requires considering repeated effects. Plan limits and execution usage apply when work runs rather than when a Task definition is saved. An accepted definition is not a promise that a future execution will succeed.

Public error fields are machine-readable except `message`, which is explanatory text and must not be parsed as a code:

- Invalid request (400): `InvalidDto` or `InvalidInput`, with the affected resource domain and `Bind` or `Validate` operation. Correct the documented field, type, value, or size.
- Authentication failure (401): `Unauthorized` with domain `Gateway` or `Core` and operation `AuthenticateAPIKey`. Check key presence, expiration, and revocation.
- Permission failure (403): `PermissionDenied` with the affected resource domain and operation `Authorize`. Check the owner's resource access.
- Unavailable or not found (404): `NotFound` with the affected resource domain and operation `Repository`. Check the ID and access/deletion state without inferring another user's resources.
- Dependency conflict (409): `DependencyAlreadyExists`, domain `RoutineTaskDependency`, operation `Create`. Reload the dependency list; omit already existing or repeated pairs.
- Rate limit (429): `PermissionDeniedDueToTooManyRequests`, domain `Auth`, operation `Authorize`. Wait and apply bounded backoff.
- Internal failure (500): the safe fallback is `InternalServerError`, domain `General`, operation `Respond`. Reconcile writes before any retry and report a persistent failure.

These are representative shipped classifications, not an exhaustive list or a new code registry. Their `retryable` value is normally false; a returned true value remains only a transient-condition hint. The HTTP status and the operation's retry safety still govern the consumer's action. OpenAPI lists verified common statuses and uses a default public-error schema for other outcomes; it does not claim every domain error can occur on every operation.

When reporting a problem, include only time, method, a redacted path, HTTP status, and safe public error fields. Never include an API key or private document body.
