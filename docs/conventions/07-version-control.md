# Version control conventions

This document defines commit messages and generated development logs for this
repository.

## Branch names

Use `<category>/<capability>` with a lowercase kebab-case capability that
describes the work in repository terms. Use categories such as `feature`,
`refactor`, `fix`, `docs`, `test`, `build`, `ci`, or `chore`.

Branch names must not include contributor or agent names, tracker-specific
issue identifiers, document codes, or opaque abbreviations. Keep the suffix
understandable without looking up an external ticket; tracking relationships
belong in the project tracker, not Git refs or repository artifacts.

Examples:

```text
feature/offline-editor-drafts
refactor/query-cache-boundary
fix/session-cookie-expiration
```

## Commit message format

Commit headers use this form:

```text
<type>(<optional-scope>)!: <description>
```

The scope is optional and uses lowercase kebab-case. When used, it identifies
the affected application, package, or capability, such as `web`, `editor`, or
`realtime`. Do not use repository-wide labels such as `backend` or `frontend`:
the repository already provides that context, so those scopes add no
information.

Write the description in lowercase English. Keep implementation details in the
commit body when needed.

## Commit types

`<type>` is a closed list. Use exactly one of these values. Do not invent
another prefix, such as `style`. A change that does not fit one of these types
needs the user's approval before the commit is created.

`feat` creates a capability. `build` changes how artifacts are produced. Do not
use `build` for a new feature.

| Type | Use for |
| --- | --- |
| `init` | Initialize a repository, package, or other new baseline. |
| `feat` | Add a user-facing capability or behavior. |
| `fix` | Correct a defect. |
| `perf` | Make existing behavior faster or use fewer resources, without adding a capability. |
| `refactor` | Restructure code without changing intended behavior. |
| `docs` | Change documentation only. |
| `test` | Add or change tests only. |
| `build` | Change the build, bundling, or dependency setup that produces artifacts. |
| `ci` | Change continuous integration or automation configuration. |
| `chore` | Do maintenance that is none of the above, such as formatting or tooling. |
| `revert` | Undo a previous commit. Name that commit in the message. |

## Development logs

Before committing repository changes, stage the intended changes, generate the
devlog, then stage the generated files:

```bash
git add .
npm run devlog
git add README.md docs/devlogs
git commit -m "your message"
git push origin main
```

Devlogs document the current functional change and must be committed with that
change. Never create a commit that contains only a generated devlog.
