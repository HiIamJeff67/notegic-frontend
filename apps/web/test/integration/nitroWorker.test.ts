import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const fixture = join(__dirname, "nitroWorkerTestSupport.mjs");

describe("Nitro's installed default Node worker", () => {
  it.each([
    ["ready", "entry-1"],
    ["slow", "entry-1"],
    ["reload", "entry-2"],
  ])(
    "serves the completed %s entry on the first request",
    async (scenario, body) => {
      const { stdout } = await execute(process.execPath, [fixture, scenario], {
        timeout: 9_000,
      });
      const result = JSON.parse(stdout);
      expect(result.status).toBe(200);
      expect(result.body).toBe(body);
      expect(result.imports).toBe(scenario === "reload" ? 2 : 1);
      if (scenario === "slow") expect(result.elapsedMs).toBeGreaterThan(3_100);
    },
    10_000
  );

  it.each<[string, number, string]>([
    ["importError", 500, "fixture import failed"],
    ["handlerError", 418, "fixture handler failed"],
    ["handlerRejection", 502, "fixture handler rejected"],
    ["missingHandler", 500, "No fetch handler exported"],
  ])(
    "completes the %s HTTP error response",
    async (scenario, status, message) => {
      const { stdout } = await execute(process.execPath, [fixture, scenario], {
        timeout: 9_000,
      });
      const result = JSON.parse(stdout);
      expect(result.status).toBe(status);
      expect(result.contentType).toContain("application/json");
      expect(JSON.parse(result.body).message).toContain(message);
    },
    10_000
  );

  it("returns HTTP 503 when the entry never finishes, rather than leaving the request pending", async () => {
    const { stdout } = await execute(process.execPath, [fixture, "stuck"], {
      timeout: 38_000,
    });
    const result = JSON.parse(stdout);
    expect(result.status).toBe(503);
    expect(result.contentType).toContain("application/json");
    expect(JSON.parse(result.body).message).toBe(
      'Vite environment "nitro" is unavailable'
    );
  }, 40_000);
});
