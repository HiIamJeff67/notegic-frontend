# Frontend System Design

This directory contains frontend system-level design notes that cross feature
boundaries or runtime concerns.

## Existing design artifacts

- [Block editor event handling flow](../block-editor-event-handling-flow-chart.drawio)
- [API architecture design](../api-architecture-design.drawio)

## Topics for this repository

System-design documents may cover:

- Block editor and collaboration event flow.
- Realtime connection and frame ownership.
- Local database and synchronization boundaries.
- Generated client contracts and current Web request semantics.

Keep product or UI-only decisions in the relevant feature documentation or
conventions directory. Keep backend transport internals in the backend
repository and link to them when the frontend depends on their public behavior.
