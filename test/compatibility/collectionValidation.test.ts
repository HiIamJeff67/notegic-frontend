import { z } from "zod";

describe("bounded collection validation", () => {
  test.each([
    "max",
    "length",
  ] as const)("array %s rejects oversized input without parsing elements", bound => {
    const parseElement = jest.fn((value: unknown) => value);
    const element = z.preprocess(parseElement, z.string());
    const result = z.array(element)[bound](2).safeParse(Array(1000).fill(0));
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ code: "too_big", maximum: 2, path: [] }),
    ]);
    expect(parseElement).not.toHaveBeenCalled();
  });

  test.each([
    "max",
    "size",
  ] as const)("set %s rejects oversized input without parsing elements", bound => {
    const parseElement = jest.fn((value: unknown) => value);
    const element = z.preprocess(parseElement, z.string());
    const input = new Set(Array.from({ length: 1000 }, (_, index) => index));
    const result = z.set(element)[bound](2).safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ code: "too_big", maximum: 2, path: [] }),
    ]);
    expect(parseElement).not.toHaveBeenCalled();
  });

  test.each([
    "max",
    "size",
  ] as const)("map %s rejects oversized input without parsing keys or values", bound => {
    const parseKey = jest.fn((value: unknown) => value);
    const parseValue = jest.fn((value: unknown) => value);
    const key = z.preprocess(parseKey, z.string());
    const value = z.preprocess(parseValue, z.string());
    const input = new Map(
      Array.from({ length: 1000 }, (_, index) => [index, 0])
    );
    const result = z.map(key, value)[bound](2).safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ code: "too_big", maximum: 2, path: [] }),
    ]);
    expect(parseKey).not.toHaveBeenCalled();
    expect(parseValue).not.toHaveBeenCalled();
  });

  test("async array validation also rejects before parsing elements", async () => {
    const parseElement = jest.fn(async (value: unknown) => value);
    const schema = z.array(z.preprocess(parseElement, z.string())).max(2);
    const result = await schema.safeParseAsync(Array(1000).fill(0));
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ code: "too_big", maximum: 2, path: [] }),
    ]);
    expect(parseElement).not.toHaveBeenCalled();
  });

  test("valid arrays, sets and maps at their limits retain their values", () => {
    expect(z.array(z.string()).max(2).parse(["one", "two"])).toEqual([
      "one",
      "two",
    ]);
    const values = new Set(["one", "two"]);
    expect(z.set(z.string()).size(2).parse(values)).toEqual(values);
    const entries = new Map([
      ["one", "first"],
      ["two", "second"],
    ]);
    expect(z.map(z.string(), z.string()).max(2).parse(entries)).toEqual(
      entries
    );
  });

  test("invalid elements within the limit still fail validation", () => {
    const result = z.array(z.string()).max(2).safeParse(["valid", 0]);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ code: "invalid_type", path: [1] }),
    ]);
  });
});
