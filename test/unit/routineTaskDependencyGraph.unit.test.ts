import type { RoutineTaskDependency } from "@shared/api/interfaces/routineTaskDependency.interface";
import {
  getRoutineTaskDependencyEdgeId,
  getRoutineTaskDependencyEdges,
  hasRoutineTaskDependencyCycle,
  hasRoutineTaskDependencyEdge,
  isRoutineTaskDependencyInRoutine,
  mergePendingRoutineTaskDependencyEdges,
} from "@shared/graph";
import type { Edge } from "@xyflow/react";

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
