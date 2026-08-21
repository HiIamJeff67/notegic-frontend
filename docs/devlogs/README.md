# Frontend Development Logs

Frontend development logs record dated architecture and implementation context
that is useful beyond a single pull request. They belong to this repository and
should not duplicate backend project history.

## File layout

Use monthly directories and ISO dates:

```text
docs/devlogs/YYYY-MM/YYYY-MM-DD.md
```

Each entry should use a concise title and cover:

```markdown
# YYYY-MM-DD — Short title

## Context

## Decision or change

## Consequences

## Related issues
```

Devlogs should record decisions, migration boundaries, and noteworthy behavior.
They should not be used as a replacement for conventions, API contracts, or
runbooks. A future automation workflow may generate an index, but the naming
and location above are stable now.
