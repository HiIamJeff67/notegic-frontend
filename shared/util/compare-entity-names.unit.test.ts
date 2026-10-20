import { compareEntityNames } from "./compare-entity-names";

describe("entity display order", () => {
  test("uses string ordering, including numbers and case", () => {
    const nodes = [
      { id: "d", name: "note 2" },
      { id: "c", name: "note 10" },
      { id: "b", name: "Note 2" },
      { id: "a", name: "Note 10" },
    ];
    expect(nodes.sort(compareEntityNames).map(node => node.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  test("breaks equal names with ID regardless of fetch or page order", () => {
    const nodes = [
      { id: "b", name: "Same" },
      { id: "a", name: "Same" },
      { id: "c", name: "Alpha" },
    ];
    for (const input of [
      nodes,
      [...nodes].reverse(),
      [nodes[1], nodes[2], nodes[0]],
    ]) {
      expect([...input].sort(compareEntityNames).map(node => node.id)).toEqual([
        "c",
        "a",
        "b",
      ]);
    }
  });

  test("supports routine titles and selection labels", () => {
    expect(
      [
        { id: "b", title: "Daily" },
        { id: "a", title: "Daily" },
      ]
        .sort(compareEntityNames)
        .map(node => node.id)
    ).toEqual(["a", "b"]);
    expect(
      [
        { id: "z", label: "B" },
        { id: "a", label: "A" },
      ]
        .sort(compareEntityNames)
        .map(node => node.id)
    ).toEqual(["a", "z"]);
  });

  test("compares Unicode and empty names without OS locale rules", () => {
    const names = ["筆記", "Alpha", "", "é", "中", "A", "a"];
    expect(
      names
        .map((name, index) => ({ id: String(index), name }))
        .sort(compareEntityNames)
        .map(node => node.name)
    ).toEqual([...names].sort());
  });

  test("resorts renamed entries and keeps the source cache array intact", () => {
    const source = Object.freeze([
      { id: "b", name: "B" },
      { id: "a", name: "A" },
    ]);
    expect([...source].sort(compareEntityNames).map(node => node.id)).toEqual([
      "a",
      "b",
    ]);
    expect(source.map(node => node.id)).toEqual(["b", "a"]);
    source[0].name = "0";
    expect([...source].sort(compareEntityNames).map(node => node.id)).toEqual([
      "b",
      "a",
    ]);
    expect(compareEntityNames(source[0], source[0])).toBe(0);
  });
});
