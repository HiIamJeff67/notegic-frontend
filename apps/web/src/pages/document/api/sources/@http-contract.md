# HTTP contract

Use `https://api.notegic.com/v1` and send JSON request bodies with `Content-Type: application/json`. Resource IDs are UUID strings unless specified otherwise; timestamps use RFC 3339.

Successful JSON responses contain `success: true`, a result in `data`, and `exception: null`. Failed responses contain `success: false`, `data: null`, and an exception with `reason`, `domain`, `operation`, `message`, and `retryable`. HTTP 204 responses have an empty body. The optional `embedded.publicId` identifies the authenticated user.

For partial updates, put replacement fields in `values` and clear supported fields with `setNull: {"field": true}`. Omitted fields and null entries in `values` leave existing values unchanged. Empty strings and arrays are explicit replacement values. Supply each field through one of `values` or `setNull` and follow the operation's schema.

RootShelf, SubShelf, BlockPack, Station, and Routine reads support `isDeleted`/`areDeleted` filters: `false` selects active resources, `true` selects deleted resources, and omission searches both states. Routine Task and Routine Tag reads return current entries for `false` or omission; `true` produces an empty list or HTTP 404 for a single resource. Access and parent-resource checks apply to every read.

Paths containing `permanently` perform permanent deletion. Follow each operation's restore and batch semantics, and verify affected resources before retrying a batch.

Task creation stores a definition; execution follows its Routine configuration. Purpose-specific payload fields and constraints are listed in the operation's schema. `isProjectionCurrent` on a BlockPack reports whether its Block read view has caught up with accepted edits.

Use HTTP status and exception `reason`, `domain`, and `operation` to classify errors; `message` provides human-readable context. Treat `retryable` as a transient-failure hint and check the operation's replay safety before retrying a write. For support, provide the request time, method, redacted path, HTTP status, and public error fields.
