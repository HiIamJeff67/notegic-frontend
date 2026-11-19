import { localSchemaHead } from "@shared/api/local/schemaHead";
import { localSchemaVersion } from "./schemaVersion";

test("desktop schema version does not pass the shared head", () => {
  expect(localSchemaVersion).toBeLessThanOrEqual(localSchemaHead);
  expect(localSchemaVersion).toBeGreaterThan(0);
});
