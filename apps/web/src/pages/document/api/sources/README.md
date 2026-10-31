# Public API reference snapshot

These six `@`-prefixed files in `sources/` are byte-for-byte reference copies from the
`HiIamJeff67/notegic-backend` repository. The filename prefix marks upstream ownership;
do not edit the copies by hand or import the backend checkout directly.

Source revision: `99a21bfba70c9e41d4650a7fdca8bb19b29fb100`.
Last compared with the upstream files: 2026-10-31.

| Local copy | Backend source path |
| --- | --- |
| `@openapi.json` | `contracts/gateway/public/openapi/openapi.json` |
| `@authentication.md` | `contracts/gateway/public/rules/authentication.md` |
| `@http-contract.md` | `contracts/gateway/public/rules/http-contract.md` |
| `@origins-and-security.md` | `contracts/gateway/public/rules/origins-and-security.md` |
| `@rate-limits-and-retries.md` | `contracts/gateway/public/rules/rate-limits-and-retries.md` |
| `@versioning.md` | `contracts/gateway/public/rules/versioning.md` |

Refresh all six copies whenever the upstream published contract changes.
Update this revision/date, run `npm run generate:public-api`, and review the
snapshot and generated module together. The generator does not synchronize
upstream files or require a backend checkout at a particular location.

Follow the [snapshot update workflow](../../../../../../../docs/designs/routes/frontend-contracts-and-codegen.md#public-api-documentation-snapshot).
