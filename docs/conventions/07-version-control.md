# Version control conventions

This document defines commit messages and generated development logs for this
repository.

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
