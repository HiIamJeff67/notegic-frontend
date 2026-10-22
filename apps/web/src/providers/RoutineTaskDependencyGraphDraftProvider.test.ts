import type { UUID } from "crypto";
import { NotegicAPIError, NotegicException } from "@shared/api/exceptions";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import { createElement, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "@/i18n";
import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import type { Edge } from "@xyflow/react";
import {
  type RoutineTaskGraphNode,
  type RoutineTaskDependencyGraphDraftContextType,
  RoutineTaskDependencyGraphDraftContext,
  RoutineTaskDependencyGraphDraftProvider,
  hasGraphOverlap,
  realignGraph,
  getRoutineTaskDependencyEdgeId,
  getRoutineTaskDependencyEdges,
  hasRoutineTaskDependencyCycle,
  hasRoutineTaskDependencyEdge,
  isRoutineTaskDependencyInRoutine,
  mergePendingRoutineTaskDependencyEdges,
} from "./RoutineTaskDependencyGraphDraftProvider";

const mockCreateDependency = jest.fn();
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
jest.mock("@/api/hooks/routineTask.hook", () => ({
  useCreateRoutineTaskByRoutineId: () => ({}),
  useGetMyRoutineTasksByRoutineId: () => ({}),
  useUpdateMyRoutineTaskById: () => ({}),
}));
jest.mock("@/api/hooks/routineTaskDependency.hook", () => ({
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
jest.mock("@shared/lib/toast", () => ({
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

describe("dependency creation failure drafts", () => {
  afterEach(async () => {
    mockCreateDependency.mockReset();
    mockDraftValues.mockClear();
    await i18n.changeLanguage("en");
  });

  test.each([
    [
      "server rejection",
      new NotegicAPIError(
        new NotegicException({
          reason: "InvalidDto",
          domain: "core",
          operation: "create",
          message: "invalid input",
          retryable: false,
        })
      ),
      "server.error.InvalidDto",
      "invalid",
    ],
    [
      "UI presentation",
      new NotegicAPIError(
        new NotegicException({
          reason: "InvalidDto",
          domain: "core",
          operation: "create",
          message: "invalid input",
          retryable: false,
        })
      ).setPresentation("auth.turnstileRequired"),
      "auth.turnstileRequired",
      "invalid",
    ],
    [
      "validation",
      new NotegicValidationError(
        new NotegicException({
          reason: "InvalidDto",
          domain: "core",
          operation: "create",
          message: "invalid input",
          retryable: false,
        })
      ),
      "server.error.InvalidDto",
      "pending",
    ],
    [
      "unknown failure",
      new Error("raw server text"),
      "error.encounterUnknownError",
      "pending",
    ],
  ])("persists locale-neutral keys for %s", async (_name, error, key, status) => {
    mockCreateDependency.mockRejectedValue(error);
    let context: RoutineTaskDependencyGraphDraftContextType | undefined;
    const Probe = () => {
      context = useContext(RoutineTaskDependencyGraphDraftContext);
      return null;
    };
    renderToStaticMarkup(
      createElement(RoutineTaskDependencyGraphDraftProvider, {
        routineId: "12345678-1234-4234-8234-123456789abc",
        children: createElement(Probe),
      })
    );
    await context!.connectDependency({
      source: "source",
      target: "target",
      sourceHandle: null,
      targetHandle: null,
    });
    const stored = JSON.parse(mockDraftValues.mock.calls.at(-1)![0].edges)[0];
    expect(stored).toMatchObject({
      id: "source->target",
      operation: "create",
      syncStatus: status,
      errorKey: key,
    });
    expect(stored.errorMessage).toBeUndefined();
    await i18n.changeLanguage("zh-TW");
    expect(i18n.exists(stored.errorKey)).toBe(true);
    if (key === "server.error.InvalidDto")
      expect(i18n.t(stored.errorKey)).toBe("提交的資料有部分格式不正確。");
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
        nodes: JSON.stringify(draft.nodes),
        edges: JSON.stringify(draft.edges),
      })
    );
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.anything(),
        set: expect.objectContaining({
          nodes: JSON.stringify(draft.nodes),
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

  test("ignores an invalid graph draft instead of throwing during local mapping", async () => {
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

    await expect(draftContext.loadDraft()).resolves.toBeNull();
  });
});
