# Routine graph drafts and atomic saves

## Ownership

`RoutineTaskDependencyGraphDraftProvider` owns the graph editor's unsubmitted
task definitions, positions and dependencies. The existing create/delete
dialogs and task Inspector accept graph-local callbacks; their normal
non-graph API paths remain unchanged. Unsubmitted graph edits must not mutate
canonical task caches or enter `TransactionTable` / TransactionSynchronizer.

## Draft lifecycle

Each Routine has one draft row in `RoutineTaskDependencyGraphDraftTable`.
Its `nodes` JSON contains a version-2 envelope with layout nodes and a snapshot:
the original definition version, baseline tasks/edges and current tasks. Its
`edges` JSON contains the current dependency definitions. SQLite writes are
serialized in edit order. Reload retains that original snapshot until it can
reconcile against a verified remote graph. Invalid stored content is reported and
preserved, not silently discarded. Local storage must be enabled and ready.

Version-1 position-array drafts remain readable. Their pending edge edits are
imported once into the version-2 draft. This JSON-format change does not change
SQLite columns, schema version or the existing SQL up/down sequence. An older
frontend cannot interpret version-2 draft snapshots: export/finish drafts and
back up their JSON before rolling the frontend back. Never delete the local
database to resolve a draft conflict.

## Save boundary

Only the graph toolbar's Save submits the draft. Inspector/dialog Save applies
its values to that draft, not the remote graph. Final-state comparison folds
all edits into one operation per identity:

| Local history | Submitted operation |
| --- | --- |
| New task, then edits | One create with the final definition |
| New task, then deletion | None |
| Existing task, repeated edits | One update with changed fields only |
| Existing task, then deletion | One delete |
| Edge creation, edits and deletion | The equivalent final-state edge patch |

The client sends one `UpdateRoutineTaskGraphByRoutineId` request through the
existing interface → invoker → server function → ClientGateway path, including
current CSRF headers. Tasks and edges share `expectedDefinitionVersion`.
The backend locks the Routine, validates the final graph and applies the
entire patch under one PostgreSQL transaction. Existing task IDs are not
replaced, and omitted entities are not implicitly deleted.

Graph editing is frozen while Save is in flight. Network, validation, permission
and version-conflict failures keep the draft; coming online, rerendering or
background synchronization must not submit it. There is no automatic write
retry or silent conflict rebase. A lost response can require checking the
remote result before resolving the retained draft.

## Definition conflict recovery

The graph uses versioned atomic saves, not BlockPack/Yjs or React Flow presence.
The canvas owns presentation; the draft provider owns reconciliation. No live
cursor, background write, last-writer-wins override or automatic submission is
implied by this lightweight collaboration model.
This release does not add multi-user graph collaboration or a graphRevision.
The execution definition version deliberately excludes layout, titles and Start
activation: simultaneous operational changes may still use the existing
last-authorized-write policy. The read-version fence detects execution-definition
changes, not a fully linearizable snapshot of operational-only edits.

Routine updates return the committed definition version. A restored draft checks
a differing workspace version against fresh online reads. Recovery reads the
Routine version, tasks and edges, then verifies the version again; mixed reads,
offline fallbacks and pending legacy writes cannot become a new baseline.
Every read builds fresh authentication headers. The subsequent backend write
still locks and compares the expected version, covering changes after that read.

Three-way comparison uses the original baseline, current draft and verified
remote definitions. Independent task fields and entities are combined; payloads
and dependency definitions are atomic values. Changed-versus-deleted entities,
colliding creates and deletions with new connected edges require explicit local
or remote choices. Choosing a task deletion also removes its incident edges.
Unresolved choices, canceled review and failed reads retain the original draft.
Execution state and timestamps never count as definition conflicts.

A 409 blocks repeat submission and exposes Review latest changes. Applying a
review persists only a new local draft and its verified baseline. The user must
inspect the result and press Save again; validation and another concurrent
change can still reject that save without losing the draft. A remote result
already confirmed by the client follows the existing reconciliation-only path.
No SQLite schema/updown or draft-format change is required.

After remote success, the provider first persists the confirmed response in
the draft, then reconciles canonical tasks, Action-task mappings, dependencies,
Routine version and draft removal in one local transaction. It applies that
same response to the current Routine in `StationRoutineProvider`, preserving
existing task objects and execution status, Station/Routine/tag expansion,
selection and unrelated workspace data. Only Action tasks enter the sidebar
and overview cache. The response replaces that Routine's task membership, so
deleted tasks disappear even when no Actions remain. It invalidates only the
current Routine, its dependency list and affected task queries without an
automatic refetch; it must not call the workspace-wide `refresh()`.
If reconciliation fails, the confirmed response survives reload and Save
retries only the local reconciliation, never the remote mutation.

Pending legacy mutations for the same Routine must finish synchronizing before
graph submission or cache reconciliation; neither step may overwrite that queue.

## Verification and release order

Use the provider's adjacent unit tests and `routineGraph.spec.ts` browser suite
for operation folding, persistence, graph interactions, save freezing, failure
retention and no background submission. The real-workspace Provider regression
must exercise Save without replacing `refresh()` or cache operations with
stubs, including repeated saves, task deletion and preserved sibling state.
Backend isolated PostgreSQL tests
cover batch commit, rollback, permissions, graph validation and conflicting
writers. Deploy the additive backend endpoint before this frontend. Existing
non-editor task/dependency mutation and offline-queue flows remain separate.
