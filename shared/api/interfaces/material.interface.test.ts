import { HardDeleteMyMaterialsByIdsRequestSchema } from "./material.interface";

const materialIds = Array.from(
  { length: 1025 },
  (_, index) =>
    `${index.toString(16).padStart(8, "0")}-0000-4000-8000-000000000000`
);

describe("Material hard-delete request", () => {
  it.each([1, 1024])("accepts %s distinct material IDs", count => {
    expect(
      HardDeleteMyMaterialsByIdsRequestSchema.safeParse({
        body: { materialIds: materialIds.slice(0, count) },
      }).success
    ).toBe(true);
  });

  it.each([
    { name: "empty", ids: [] },
    { name: "duplicates", ids: [materialIds[0], materialIds[0]] },
    { name: "over limit", ids: materialIds },
    { name: "malformed UUID", ids: ["not-a-uuid"] },
    { name: "zero UUID", ids: ["00000000-0000-0000-0000-000000000000"] },
  ])("rejects $name before transport", ({ ids }) => {
    expect(
      HardDeleteMyMaterialsByIdsRequestSchema.safeParse({
        body: { materialIds: ids },
      }).success
    ).toBe(false);
  });
});
