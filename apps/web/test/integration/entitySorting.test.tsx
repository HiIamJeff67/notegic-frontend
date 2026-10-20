import { renderToStaticMarkup } from "react-dom/server";
import type { RoutineNode } from "@shared/types/routineNode.type";
import RootShelfMenu from "@/components/menus/RootShelfMenu/RootShelfMenu";
import RoutineMenu from "@/components/menus/RoutineMenu/RoutineMenu";

let mockEdges: Array<{
  node: { id: string; name: string };
  encodedSearchCursor: string;
}>;
let mockShelves: Map<string, { root: { id: string; name: string } }>;

jest.mock("@/hooks", () => ({
  useShelfItem: () => ({
    rootShelfEdges: mockEdges,
    expandedShelves: mockShelves,
  }),
  useStationRoutine: () => ({ getStationById: () => ({ id: "station" }) }),
}));
jest.mock("@/components/ui/sidebar", () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
}));
jest.mock("@/components/menus/RootShelfMenu/RootShelfMenuItemSkeleton", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/menus/RootShelfMenu/RootShelfMenuItem", () => ({
  __esModule: true,
  default: ({
    rootShelfEdge,
  }: {
    rootShelfEdge: { node: { id: string; name: string } };
  }) => (
    <li data-id={rootShelfEdge.node.id}>
      {mockShelves.get(rootShelfEdge.node.id)?.root.name ??
        rootShelfEdge.node.name}
    </li>
  ),
}));
jest.mock("@/components/menus/RoutineMenu/RoutineMenuItemSkeleton", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/menus/RoutineMenu/RoutineMenuItem", () => ({
  __esModule: true,
  default: ({ routine }: { routine: { id: string; title: string } }) => (
    <li data-id={routine.id}>{routine.title}</li>
  ),
}));

const ids = (markup: string) =>
  [...markup.matchAll(/data-id="([^"]+)"/g)].map(match => match[1]);

beforeEach(() => {
  mockEdges = [
    { node: { id: "b", name: "Same" }, encodedSearchCursor: "cursor-b" },
    { node: { id: "a", name: "Same" }, encodedSearchCursor: "cursor-a" },
    { node: { id: "c", name: "Alpha" }, encodedSearchCursor: "cursor-c" },
  ];
  mockShelves = new Map();
});

test("root shelf order stays fixed across fetched orders and added pages without changing cursor data", () => {
  const original = JSON.stringify(mockEdges);
  expect(ids(renderToStaticMarkup(<RootShelfMenu />))).toEqual(["c", "a", "b"]);
  expect(JSON.stringify(mockEdges)).toBe(original);
  mockEdges.reverse();
  expect(ids(renderToStaticMarkup(<RootShelfMenu />))).toEqual(["c", "a", "b"]);
  mockEdges.push({
    node: { id: "d", name: "0 first" },
    encodedSearchCursor: "page-2-cursor",
  });
  expect(ids(renderToStaticMarkup(<RootShelfMenu />))).toEqual([
    "d",
    "c",
    "a",
    "b",
  ]);
  expect(mockEdges.at(-1)?.encodedSearchCursor).toBe("page-2-cursor");
});

test("root shelf rename and rollback use the visible local name", () => {
  mockShelves.set("b", { root: { id: "b", name: "0 renamed" } });
  expect(ids(renderToStaticMarkup(<RootShelfMenu />))).toEqual(["b", "c", "a"]);
  mockShelves.get("b")!.root.name = "Same";
  expect(ids(renderToStaticMarkup(<RootShelfMenu />))).toEqual(["c", "a", "b"]);
});

test("routine menu uses title then ID without mutating provider arrays", () => {
  const routines = Object.freeze([
    { id: "b", title: "Routine 2", stationId: "station" },
    { id: "z", title: "Routine 10", stationId: "station" },
    { id: "a", title: "Routine 2", stationId: "station" },
  ]);
  expect(
    ids(
      renderToStaticMarkup(
        <RoutineMenu routines={routines as unknown as RoutineNode[]} />
      )
    )
  ).toEqual(["z", "a", "b"]);
  expect(routines.map(routine => routine.id)).toEqual(["b", "z", "a"]);
});
