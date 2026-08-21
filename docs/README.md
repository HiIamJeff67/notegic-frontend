# Notegic Frontend Documentation

This directory is the documentation entry point for the current Notegic Web
frontend. It describes the existing Web application, its coding style, and the
conventions contributors should follow.

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
| [codebase-design](codebase-design/) | Current Web repository structure, ownership, and dependency direction |
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

## Deliberate scope

Future application architecture is tracked in Linear and is intentionally not
documented in this repository yet. The current docs focus on making Web
development consistent while the Web local database work continues.
