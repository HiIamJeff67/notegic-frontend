import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import type { Edge } from "@xyflow/react";
import type { UUID } from "crypto";
import { createElement, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "@/i18n";
import {
  getRoutineTaskDependencyEdgeId,
  getRoutineTaskDependencyEdges,
  getRoutineTaskGraphChanges,
  hasGraphOverlap,
  hasRoutineTaskDependencyCycle,
  hasRoutineTaskDependencyEdge,
  isRoutineTaskDependencyInRoutine,
  mergePendingRoutineTaskDependencyEdges,
  RoutineTaskDependencyGraphDraftContext,
  type RoutineTaskDependencyGraphDraftContextType,
  RoutineTaskDependencyGraphDraftProvider,
  type RoutineTaskGraphNode,
  realignGraph,
  reconcileRoutineTaskGraphDraft,
} from "./RoutineTaskDependencyGraphDraftProvider";

const mockCreateDependency = jest.fn();
beforeAll(async () => {
  await i18n.changeLanguage("en");
});
const mockLoadRows = jest.fn();
const mockInsert = jest.fn();
const mockOnConflictDoUpdate = jest.fn();
const mockDraftValues = jest.fn((_values: { edges: string }) => ({
  onConflictDoUpdate: mockOnConflictDoUpdate,
}));

beforeEach(() => {
  mockLoadRows.mockReset();
  mockInsert.mockReset();
  mockDraftValues.mockClear();
  mockOnConflictDoUpdate.mockReset();
  mockInsert.mockReturnValue({ values: mockDraftValues });
  mockOnConflictDoUpdate.mockResolvedValue(undefined);
});
const mockNodes = [
  { id: "source", position: { x: 0, y: 0 }, data: { kind: "Start" } },
  { id: "target", position: { x: 300, y: 0 }, data: { kind: "Action" } },
];

jest.mock("@/api/local/db", () => ({
  localDB: {
    isEnabled: true,
    isReady: true,
    select: () => ({
      from: () => ({ where: () => ({ limit: mockLoadRows }) }),
    }),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));
jest.mock("@/api/hooks/routine.hook", () => ({
  useGetMyRoutineById: () => ({}),
}));
jest.mock("@/api/hooks/station.hook", () => ({
  useGetMyStationById: () => ({}),
}));
jest.mock("@/api/hooks/routineTask.hook", () => ({
  useCreateRoutineTaskByRoutineId: () => ({}),
  useGetMyRoutineTasksByRoutineId: () => ({}),
  useUpdateMyRoutineTaskById: () => ({}),
}));
jest.mock("@/api/hooks/routineTaskDependency.hook", () => ({
  useUpdateRoutineTaskGraphByRoutineId: () => ({}),
  useCreateRoutineTaskDependencyByRoutineId: () => ({
    mutateAsync: mockCreateDependency,
  }),
  useDeleteRoutineTaskDependencyByRoutineId: () => ({}),
  useGetRoutineTaskDependenciesByRoutineId: () => ({}),
  useUpdateRoutineTaskDependencyByRoutineId: () => ({}),
}));
jest.mock("@/api/local/simulators/routineTask.simulator", () => ({}));
jest.mock("@/hooks/useStationRoutine", () => ({
  useStationRoutine: () => ({ getRoutineById: () => ({ routineTasks: [] }) }),
}));
jest.mock("@/hooks/useTransactionSynchronizer", () => ({
  useTransactionSynchronizer: () => ({ synchronizationRevision: 0 }),
}));
jest.mock("@/hooks/useLoading", () => ({ useLoading: () => ({}) }));
jest.mock("@shared/lib/toast/toast", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn() },
}));
jest.mock("@xyflow/react", () => ({
  ...jest.requireActual("@xyflow/react"),
  useNodesState: () => [mockNodes, jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
}));

const node = (
  id: string,
  kind: "Start" | "Action" = "Action",
  x = 0,
  y = 0
): RoutineTaskGraphNode => ({
  id,
  type: "routineTask",
  position: { x, y },
  measured:
    kind === "Start" ? { width: 80, height: 80 } : { width: 240, height: 100 },
  data: { kind, title: id, payload: {} },
});

describe("graph overlap", () => {
  test("compares areas, ignores touching edges and independent X/Y matches", () => {
    expect(hasGraphOverlap([node("a"), node("b", "Action", 239, 99)])).toBe(
      true
    );
    expect(hasGraphOverlap([node("a"), node("b", "Action", 240, 0)])).toBe(
      false
    );
    expect(hasGraphOverlap([node("a"), node("b", "Action", 0, 100)])).toBe(
      false
    );
    expect(hasGraphOverlap([node("a")])).toBe(false);
  });

  test("includes the Start label outside its circle", () => {
    const action = {
      ...node("action", "Action", -50, -25),
      measured: { width: 40, height: 20 },
    };
    expect(hasGraphOverlap([node("start", "Start"), action])).toBe(true);
    expect(
      hasGraphOverlap([
        node("start", "Start"),
        { ...action, position: { x: -100, y: -60 } },
      ])
    ).toBe(false);
  });
});

describe("realign graph", () => {
  test("places branches, merges, multiple roots and disconnected nodes without overlap", () => {
    const nodes = [
      node("start", "Start"),
      node("entry", "Start"),
      node("a"),
      node("b"),
      node("merge"),
      node("isolated"),
    ];
    nodes[3].measured = { width: 256, height: 150 };
    const edges = [
      { source: "start", target: "a" },
      { source: "start", target: "b" },
      { source: "entry", target: "b" },
      { source: "a", target: "merge" },
      { source: "b", target: "merge" },
      { source: "start", target: "merge" },
    ];
    const before = JSON.stringify({ nodes, edges });
    const result = realignGraph(nodes, edges)!;
    const positions = new Map(result.map(entry => [entry.id, entry.position]));
    for (const edge of edges)
      expect(positions.get(edge.target)!.x).toBeGreaterThan(
        positions.get(edge.source)!.x
      );
    const aligned = nodes.map(entry => ({
      ...entry,
      position: positions.get(entry.id)!,
    }));
    expect(hasGraphOverlap(aligned)).toBe(false);
    expect(new Set(result.map(entry => entry.id)).size).toBe(nodes.length);
    expect(JSON.stringify({ nodes, edges })).toBe(before);
    expect(realignGraph([...nodes].reverse(), [...edges].reverse())).toEqual(
      result
    );
    expect(realignGraph(aligned, edges)).toEqual(result);
  });

  test("keeps a simple chain centered and gives siblings a stable order", () => {
    const nodes = [
      node("z", "Start", -200, -100),
      node("b"),
      node("a"),
      node("c"),
    ];
    const result = realignGraph(nodes, [
      { source: "z", target: "b" },
      { source: "z", target: "a" },
      { source: "a", target: "c" },
      { source: "b", target: "c" },
    ])!;
    const positions = new Map(result.map(entry => [entry.id, entry.position]));
    expect(positions.get("a")!.x).toBe(positions.get("b")!.x);
    expect(positions.get("a")!.y).toBeLessThan(positions.get("b")!.y);
    expect(positions.get("c")!.y).toBe(
      (positions.get("a")!.y + positions.get("b")!.y) / 2
    );
  });

  test("rejects cyclic or incomplete input without producing partial positions", () => {
    expect(realignGraph([], [])).toEqual([]);
    expect(
      realignGraph(
        [node("a"), node("b")],
        [
          { source: "a", target: "b" },
          { source: "b", target: "a" },
        ]
      )
    ).toBeNull();
    expect(
      realignGraph([node("a")], [{ source: "a", target: "a" }])
    ).toBeNull();
    expect(
      realignGraph([node("a")], [{ source: "a", target: "missing" }])
    ).toBeNull();
    expect(
      realignGraph([{ ...node("a"), measured: undefined }], [])
    ).toBeNull();
  });

  test("does not double-count duplicate dependencies", () => {
    const edge = { source: "a", target: "b" };
    const nodes = [node("a"), node("b")];
    expect(realignGraph(nodes, [edge, edge])).toEqual(
      realignGraph(nodes, [edge])
    );
  });

  test("starts inside coordinate limits even when the old graph is at the boundary", () => {
    const edge = { source: "a", target: "b" };
    const nodes = [
      node("a", "Action", 1000000, 1000000),
      node("b", "Action", 1000000, 1000000),
    ];
    const positions = realignGraph(nodes, [edge])!;
    expect(
      positions.every(
        entry =>
          entry.position.x >= 0 &&
          entry.position.x <= 1000000 &&
          entry.position.y >= 0 &&
          entry.position.y <= 1000000
      )
    ).toBe(true);
    nodes[0].measured = { width: 1000000, height: 100 };
    expect(realignGraph(nodes, [edge])).toBeNull();
  });
});

const dependency = (
  previousRoutineTaskId: string,
  routineTaskId: string
): RoutineTaskDependency => ({
  previousRoutineTaskId,
  routineTaskId,
  description: "",
  progress: 0,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
});

describe("RoutineTask dependency graph adapters", () => {
  test("maps multiple roots and branches while keeping an empty graph empty", () => {
    const edges = getRoutineTaskDependencyEdges([
      dependency("root-a", "branch-a"),
      dependency("root-a", "branch-b"),
      dependency("root-b", "branch-b"),
    ]);

    expect(edges.map(edge => [edge.source, edge.target])).toEqual([
      ["root-a", "branch-a"],
      ["root-a", "branch-b"],
      ["root-b", "branch-b"],
    ]);
    expect(getRoutineTaskDependencyEdges([])).toEqual([]);
  });

  test("preserves dependency metadata on graph edges", () => {
    const edges = getRoutineTaskDependencyEdges([
      {
        ...dependency("task-a", "task-b"),
        description: "Run after source task",
        progress: 75,
      },
    ]);

    expect(edges[0]).toEqual(
      expect.objectContaining({
        id: "task-a->task-b",
        source: "task-a",
        target: "task-b",
        markerEnd: { type: "arrowclosed", width: 24, height: 24 },
        data: {
          description: "Run after source task",
          progress: 75,
        },
      })
    );
  });

  test("rejects self edges and edges that close a cycle", () => {
    const edges: Edge[] = [
      { id: "a->b", source: "a", target: "b" },
      { id: "b->c", source: "b", target: "c" },
    ];

    expect(hasRoutineTaskDependencyCycle(edges, "a", "a")).toBe(true);
    expect(hasRoutineTaskDependencyCycle(edges, "c", "a")).toBe(true);
    expect(hasRoutineTaskDependencyCycle(edges, "a", "c")).toBe(false);
  });

  test("recognises duplicate edges and rejects tasks outside the routine scope", () => {
    const edges: Edge[] = [{ id: "a->b", source: "a", target: "b" }];
    const routineTaskIds = new Set(["a", "b", "c"]);

    expect(hasRoutineTaskDependencyEdge(edges, "a", "b")).toBe(true);
    expect(hasRoutineTaskDependencyEdge(edges, "b", "a")).toBe(false);
    expect(isRoutineTaskDependencyInRoutine(routineTaskIds, "a", "c")).toBe(
      true
    );
    expect(
      isRoutineTaskDependencyInRoutine(routineTaskIds, "a", "outside")
    ).toBe(false);
  });

  test("reapplies pending create, update, and delete mutations over canonical edges", () => {
    const edges: Edge[] = [
      {
        id: getRoutineTaskDependencyEdgeId("a", "b"),
        source: "a",
        target: "b",
        data: { description: "old", progress: 10 },
      },
      {
        id: getRoutineTaskDependencyEdgeId("b", "c"),
        source: "b",
        target: "c",
      },
    ];
    const mergedEdges = mergePendingRoutineTaskDependencyEdges(edges, [
      {
        id: "a->b",
        source: "a",
        target: "b",
        description: "updated",
        progress: 75,
        syncStatus: "pending",
        operation: "update",
      },
      {
        id: "b->d",
        source: "b",
        target: "d",
        description: "created offline",
        progress: 20,
        syncStatus: "pending",
        operation: "create",
      },
      {
        id: "b->c",
        source: "b",
        target: "c",
        syncStatus: "pending",
        operation: "delete",
      },
    ]);

    expect(mergedEdges).toEqual([
      expect.objectContaining({
        id: "a->b",
        data: { description: "updated", progress: 75 },
      }),
      expect.objectContaining({
        id: "b->d",
        data: { description: "created offline", progress: 20 },
      }),
    ]);
  });

  test("keeps an invalid mutation visible for correction without treating it as pending sync", () => {
    const edges: Edge[] = [
      {
        id: getRoutineTaskDependencyEdgeId("a", "b"),
        source: "a",
        target: "b",
      },
    ];

    expect(
      mergePendingRoutineTaskDependencyEdges(edges, [
        {
          id: "b->c",
          source: "b",
          target: "c",
          syncStatus: "invalid",
          operation: "create",
          errorMessage: "Dependencies cannot contain a cycle.",
        },
      ])
    ).toEqual([
      expect.objectContaining({
        id: "a->b",
      }),
      expect.objectContaining({
        id: "b->c",
        source: "b",
        target: "c",
      }),
    ]);
  });
});

describe("graph operation coalescing", () => {
  const task = (id: string, title = id) => ({
    id,
    routineId: "routine",
    kind: "Action" as const,
    x: 0,
    y: 0,
    title,
    payload: { schemaVersion: 1, purpose: "GetRoutine", routineId: "routine" },
    priority: 0,
    maxAttempts: 1,
    previousRoutineTaskIds: [],
    updatedAt: new Date(),
    createdAt: new Date(),
  });
  test("reconciles schedule-only versions and disjoint edits without changing the original draft", () => {
    const original = task("a");
    const draft = {
      nodes: [],
      edges: [],
      updatedAt: new Date(),
      snapshot: {
        version: 2 as const,
        definitionVersion: 7,
        baselineTasks: [original],
        baselineEdges: [],
        tasks: [{ ...original, x: 50 }],
      },
    };
    const remote = {
      definitionVersion: 21,
      tasks: [{ ...original, title: "Collaborator title" }],
      dependencies: [],
      updatedAt: new Date(),
    };
    const result = reconcileRoutineTaskGraphDraft(draft, remote);
    expect(result.conflicts).toEqual([]);
    expect(result.draft.snapshot.tasks[0]).toMatchObject({
      title: "Collaborator title",
      x: 50,
    });
    expect(getRoutineTaskGraphChanges(result.draft)).toMatchObject({
      expectedDefinitionVersion: 21,
      tasks: { updates: [{ routineTaskId: "a", values: { x: 50 } }] },
    });
    expect(draft.snapshot.definitionVersion).toBe(7);
    expect(draft.snapshot.tasks[0].title).toBe("a");
  });
  test("retains both sides of a conflicting field and applies only explicit choices", () => {
    const original = task("a");
    const draft = {
      nodes: [],
      edges: [],
      updatedAt: new Date(),
      snapshot: {
        version: 2 as const,
        definitionVersion: 7,
        baselineTasks: [original],
        baselineEdges: [],
        tasks: [{ ...original, title: "Mine", x: 42 }],
      },
    };
    const remote = {
      definitionVersion: 8,
      tasks: [{ ...original, title: "Theirs", y: 20 }],
      dependencies: [],
      updatedAt: new Date(),
    };
    const result = reconcileRoutineTaskGraphDraft(draft, remote);
    expect(result.conflicts).toEqual([
      {
        id: "task:a:title",
        label: "Mine · title",
        local: "Mine",
        remote: "Theirs",
      },
    ]);
    const resolved = reconcileRoutineTaskGraphDraft(draft, remote, {
      "task:a:title": "remote",
    });
    expect(resolved.draft.snapshot.tasks[0]).toMatchObject({
      title: "Theirs",
      x: 42,
      y: 20,
    });
    expect(draft.snapshot.tasks[0].title).toBe("Mine");
  });
  test("deletion conflicts include dependencies added by a collaborator", () => {
    const first = task("a"),
      second = task("b");
    const draft = {
      nodes: [],
      edges: [],
      updatedAt: new Date(),
      snapshot: {
        version: 2 as const,
        definitionVersion: 1,
        baselineTasks: [first, second],
        baselineEdges: [],
        tasks: [first],
      },
    };
    const remote = {
      definitionVersion: 2,
      tasks: [first, second],
      dependencies: [
        {
          routineTaskId: "b",
          previousRoutineTaskId: "a",
          description: "New remote link",
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      updatedAt: new Date(),
    };
    const result = reconcileRoutineTaskGraphDraft(draft, remote);
    expect(result.conflicts.map(conflict => conflict.id)).toEqual(["task:b"]);
    const restored = reconcileRoutineTaskGraphDraft(draft, remote, {
      "task:b": "remote",
    });
    expect(restored.draft.snapshot.tasks).toHaveLength(2);
    expect(restored.draft.edges).toHaveLength(1);
    const removed = reconcileRoutineTaskGraphDraft(draft, remote, {
      "task:b": "local",
    });
    expect(removed.draft.snapshot.tasks).toHaveLength(1);
    expect(removed.draft.edges).toHaveLength(0);
  });
  test("remote deletion, concurrent creation and edge edits retain independent changes", () => {
    const first = task("a"),
      second = task("b"),
      third = task("c");
    const edge = {
      id: "a->b",
      source: "a",
      target: "b",
      description: "Original",
      progress: 0,
    };
    const draft = {
      nodes: [],
      edges: [{ ...edge, description: "Mine" }],
      updatedAt: new Date(),
      snapshot: {
        version: 2 as const,
        definitionVersion: 1,
        baselineTasks: [first, second, third],
        baselineEdges: [edge],
        tasks: [first, second, third, task("new", "Mine")],
      },
    };
    const remote = {
      definitionVersion: 2,
      tasks: [first, second, task("new", "Theirs")],
      dependencies: [
        {
          routineTaskId: "b",
          previousRoutineTaskId: "a",
          description: "Theirs",
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      updatedAt: new Date(),
    };
    const result = reconcileRoutineTaskGraphDraft(draft, remote, {
      "task:new": "remote",
      "edge:a->b": "local",
    });
    expect(result.conflicts.map(conflict => conflict.id)).toEqual([
      "task:new",
      "edge:a->b",
    ]);
    expect(result.draft.snapshot.tasks.map(task => task.id)).toEqual([
      "a",
      "b",
      "new",
    ]);
    expect(result.draft.edges[0].description).toBe("Mine");
    expect(getRoutineTaskGraphChanges(result.draft).tasks).toEqual({
      creates: [],
      updates: [],
      deletes: [],
    });
  });
  test("folds create/update/delete and cascades dependencies without duplicate writes", () => {
    const first = task("existing", "Original");
    const deleted = task("deleted");
    const created = task("new", "Latest create title");
    const draft = {
      nodes: [],
      edges: [
        {
          id: "existing->new",
          source: "existing",
          target: "new",
          description: "final",
          progress: 70,
        },
      ],
      updatedAt: new Date(),
      snapshot: {
        version: 2 as const,
        definitionVersion: 7,
        baselineTasks: [first, deleted],
        tasks: [{ ...first, title: "Latest update", x: 50 }, created],
        baselineEdges: [
          { id: "existing->deleted", source: "existing", target: "deleted" },
        ],
      },
    };
    expect(getRoutineTaskGraphChanges(draft)).toEqual({
      expectedDefinitionVersion: 7,
      tasks: {
        creates: [
          {
            id: "new",
            routineId: "routine",
            kind: "Action",
            title: "Latest create title",
            payload: created.payload,
            priority: 0,
            maxAttempts: 1,
            x: 0,
            y: 0,
          },
        ],
        updates: [
          {
            routineTaskId: "existing",
            values: { title: "Latest update", x: 50 },
          },
        ],
        deletes: ["deleted"],
      },
      dependencies: {
        creates: [
          {
            routineTaskId: "new",
            previousRoutineTaskId: "existing",
            description: "final",
            progress: 70,
          },
        ],
        updates: [],
        deletes: [],
      },
    });
  });
  test("payload property order is not a definition change", () => {
    const baseline = task("a");
    const { schemaVersion, purpose, routineId } = baseline.payload;
    const draft = {
      nodes: [],
      edges: [],
      updatedAt: new Date(),
      snapshot: {
        version: 2 as const,
        definitionVersion: 7,
        baselineTasks: [baseline],
        baselineEdges: [],
        tasks: [
          { ...baseline, payload: { routineId, purpose, schemaVersion } },
        ],
      },
    };
    expect(getRoutineTaskGraphChanges(draft).tasks.updates).toEqual([]);
    expect(
      reconcileRoutineTaskGraphDraft(draft, {
        definitionVersion: 8,
        tasks: [baseline],
        dependencies: [],
        updatedAt: new Date(),
      }).conflicts
    ).toEqual([]);
  });
  test("existing update then delete remains a delete; canceled creates vanish", () => {
    const baseline = task("existing");
    expect(
      getRoutineTaskGraphChanges({
        nodes: [],
        edges: [],
        updatedAt: new Date(),
        snapshot: {
          version: 2,
          definitionVersion: 9,
          baselineTasks: [baseline],
          baselineEdges: [],
          tasks: [],
        },
      }).tasks
    ).toEqual({ creates: [], updates: [], deletes: [baseline.id] });
  });
  test("keeps edge updates and deletes distinct and preserves the original version", () => {
    const tasks = [task("a"), task("b"), task("c")];
    const baselineEdges = [
      { id: "a->b", source: "a", target: "b", description: "old", progress: 0 },
      { id: "a->c", source: "a", target: "c" },
    ];
    const result = getRoutineTaskGraphChanges({
      nodes: [],
      edges: [{ ...baselineEdges[0], description: "latest", progress: 100 }],
      updatedAt: new Date(),
      snapshot: {
        version: 2,
        definitionVersion: 7,
        tasks,
        baselineTasks: tasks,
        baselineEdges,
      },
    });
    expect(result.expectedDefinitionVersion).toBe(7);
    expect(result.tasks).toEqual({ creates: [], updates: [], deletes: [] });
    expect(result.dependencies).toEqual({
      creates: [],
      updates: [
        {
          routineTaskId: "b",
          previousRoutineTaskId: "a",
          description: "latest",
          progress: 100,
        },
      ],
      deletes: [{ routineTaskId: "c", previousRoutineTaskId: "a" }],
    });
  });
});

let contextValue: RoutineTaskDependencyGraphDraftContextType | undefined;

const ContextProbe = () => {
  contextValue = useContext(RoutineTaskDependencyGraphDraftContext);
  return null;
};

const getDraftContext = (routineId: string) => {
  renderToStaticMarkup(
    createElement(RoutineTaskDependencyGraphDraftProvider, {
      routineId: routineId as UUID,
      children: createElement(ContextProbe),
    })
  );
  if (!contextValue) throw new Error("draft provider context is unavailable");
  return contextValue;
};

describe("RoutineTask dependency graph local draft boundary", () => {
  test("restores a confirmed snapshot without changing its original version", async () => {
    const routineId = "11111111-1111-4111-8111-111111111111";
    const task = {
      id: "22222222-2222-4222-8222-222222222222",
      routineId,
      kind: "Start",
      title: "Start",
      x: 0,
      y: 0,
      payload: { schemaVersion: 1, isActive: true },
      priority: 0,
      maxAttempts: 1,
      previousRoutineTaskIds: [],
      createdAt: "2026-10-25T00:00:00.000Z",
      updatedAt: "2026-10-25T00:00:00.000Z",
    };
    const snapshot = {
      version: 2,
      definitionVersion: 7,
      tasks: [task],
      baselineTasks: [task],
      baselineEdges: [],
      confirmed: {
        definitionVersion: 8,
        tasks: [task],
        dependencies: [],
        updatedAt: task.updatedAt,
      },
    };
    mockLoadRows.mockResolvedValue([
      {
        nodes: JSON.stringify({ version: 2, nodes: [], snapshot }),
        edges: "[]",
        updatedAt: new Date(),
      },
    ]);
    const loaded = await getDraftContext(routineId).loadDraft();
    expect(loaded?.snapshot?.definitionVersion).toBe(7);
    expect(loaded?.snapshot?.confirmed?.definitionVersion).toBe(8);
    expect(loaded?.snapshot?.confirmed?.tasks[0].createdAt).toBeInstanceOf(
      Date
    );
    expect(mockInsert).not.toHaveBeenCalled();
  });
  test("returns no draft when the select has no rows", async () => {
    mockLoadRows.mockResolvedValue([]);
    const draftContext = getDraftContext(
      "11111111-1111-4111-8111-111111111111"
    );
    await expect(draftContext.loadDraft()).resolves.toBeNull();
  });

  test("saves and reloads one graph draft by routine id", async () => {
    const routineId = "11111111-1111-4111-8111-111111111111";
    const draftContext = getDraftContext(routineId);
    const draft = {
      nodes: [{ id: "task-a", position: { x: 120, y: 80 } }],
      edges: [
        {
          id: "task-a->task-b",
          source: "task-a",
          target: "task-b",
          syncStatus: "pending" as const,
          operation: "create" as const,
        },
        {
          id: "task-b->task-c",
          source: "task-b",
          target: "task-c",
          description: "updated offline",
          progress: 60,
          syncStatus: "pending" as const,
          operation: "update" as const,
        },
        {
          id: "task-c->task-d",
          source: "task-c",
          target: "task-d",
          syncStatus: "pending" as const,
          operation: "delete" as const,
        },
      ],
    };
    const savedDraft = {
      routineId,
      ...draft,
      updatedAt: new Date("2026-09-03T00:00:00.000Z"),
    };

    await draftContext.saveDraft(draft);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockDraftValues).toHaveBeenCalledWith(
      expect.objectContaining({
        routineId,
        nodes: JSON.stringify({ version: 2, nodes: draft.nodes }),
        edges: JSON.stringify(draft.edges),
      })
    );
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.anything(),
        set: expect.objectContaining({
          nodes: JSON.stringify({ version: 2, nodes: draft.nodes }),
          edges: JSON.stringify(draft.edges),
          updatedAt: expect.any(Date),
        }),
      })
    );

    mockLoadRows.mockResolvedValue([
      {
        ...savedDraft,
        nodes: JSON.stringify(savedDraft.nodes),
        edges: JSON.stringify(savedDraft.edges),
      },
    ]);
    await expect(draftContext.loadDraft()).resolves.toEqual({
      nodes: draft.nodes,
      edges: draft.edges,
      updatedAt: savedDraft.updatedAt,
    });
    expect(mockLoadRows).toHaveBeenCalledTimes(1);
  });

  test("preserves invalid persisted data and reports it instead of silently discarding it", async () => {
    const draftContext = getDraftContext(
      "11111111-1111-4111-8111-111111111111"
    );
    mockLoadRows.mockResolvedValue([
      {
        nodes: "not-json",
        edges: JSON.stringify([]),
        updatedAt: new Date("2026-09-03T00:00:00.000Z"),
      },
    ]);

    await expect(draftContext.loadDraft()).rejects.toThrow();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
