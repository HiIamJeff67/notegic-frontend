const mockFindFirst = jest.fn();
const mockInsert = jest.fn();
const mockValues = jest.fn();
const mockOnConflictDoUpdate = jest.fn();

jest.mock("@/api/local/db", () => ({
  localDB: {
    isEnabled: true,
    isReady: true,
    query: {
      RoutineTaskDependencyGraphDraft: {
        findFirst: mockFindFirst,
      },
    },
    insert: mockInsert,
  },
}));

import {
  loadRoutineTaskDependencyGraphDraft,
  saveRoutineTaskDependencyGraphDraft,
} from "@/api/local/routine-task-dependency-graph-draft";

describe("RoutineTask dependency graph local draft boundary", () => {
  beforeEach(() => {
    mockFindFirst.mockReset();
    mockInsert.mockReset();
    mockValues.mockReset();
    mockOnConflictDoUpdate.mockReset();
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({
      onConflictDoUpdate: mockOnConflictDoUpdate,
    });
    mockOnConflictDoUpdate.mockResolvedValue(undefined);
  });

  test("saves and reloads one graph draft by routine id", async () => {
    const routineId = "11111111-1111-4111-8111-111111111111";
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

    await saveRoutineTaskDependencyGraphDraft(routineId, draft);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockValues).toHaveBeenCalledWith(
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

    mockFindFirst.mockResolvedValue({
      ...savedDraft,
      nodes: JSON.stringify(savedDraft.nodes),
      edges: JSON.stringify(savedDraft.edges),
    });
    await expect(
      loadRoutineTaskDependencyGraphDraft(routineId)
    ).resolves.toEqual({
      nodes: draft.nodes,
      edges: draft.edges,
      updatedAt: savedDraft.updatedAt,
    });
    expect(mockFindFirst).toHaveBeenCalledTimes(1);
  });

  test("ignores an invalid graph draft instead of throwing during local mapping", async () => {
    mockFindFirst.mockResolvedValue({
      nodes: "not-json",
      edges: JSON.stringify([]),
      updatedAt: new Date("2026-09-03T00:00:00.000Z"),
    });

    await expect(
      loadRoutineTaskDependencyGraphDraft(
        "11111111-1111-4111-8111-111111111111"
      )
    ).resolves.toBeNull();
  });
});
