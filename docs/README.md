# Notegic Frontend Documentation

This directory is the documentation entry point for the Notegic frontend
monorepo. It describes the current Web application, the approved shared-code
architecture, and the conventions contributors should follow.

For the product overview, start with the repository root [README](../README.md).
For Web installation and the shortest contributor path, use the
[Web README](../apps/web/README.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).

The frontend and backend remain separate repositories. Frontend documentation
may link to backend contracts or backend design documents, but it must not
describe backend implementation as if it belongs to this repository.

## How to use this documentation

1. Read the documents that match the change scope before implementation.
2. Treat the current codebase as the source of truth when a document and the
   code disagree.
3. Preserve an established local pattern before introducing a new pattern.
4. Record a new cross-cutting decision in the appropriate documentation area.
5. Do not perform a broad rename only to make legacy files match a newer rule;
   use the rule for new files and scoped migrations.

## Document map

| Directory | Scope |
| --- | --- |
| [codebase-design](codebase-design/) | Current Web structure, target monorepo, ownership, and dependency direction |
| [api-route-design](api-route-design/) | Frontend transport entry points and client-facing API concerns |
| [system-design](system-design/) | Editor, synchronization, local data, and cross-platform design notes |
| [conventions](conventions/) | Naming, UI, styling, icons, generated code, and implementation conventions |
| [runbooks](runbooks/) | Local development, verification, code generation, and troubleshooting procedures |
| [devlogs](devlogs/) | Dated frontend development and architecture records |

## Existing diagrams

These diagrams are existing frontend design artifacts. They remain at their
current paths until a dedicated documentation migration moves them:

- [API architecture design](api-architecture-design.drawio)
- [Block editor event handling flow](block-editor-event-handling-flow-chart.drawio)

## Repository boundary

The frontend repository owns the Web client, frontend TypeScript modules,
frontend tests, client-side code generation, and frontend developer tooling.
The backend repository owns microservices, business logic, databases, Docker
deployment, and server-side contracts. Cross-repository behavior should be
described through versioned public contracts and links to the backend
documentation.

## Architecture scope

The frontend monorepo architecture is documented here after the Phase 1
decision and the NOT-90 Web workspace migration. The current Web app lives
under `apps/web`; portable resources and contracts live under `shared/`.
Desktop and Mobile are planned boundaries only and have no implementation yet.
