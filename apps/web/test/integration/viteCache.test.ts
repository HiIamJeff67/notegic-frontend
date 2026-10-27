import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

it.each([
  {
    name: "reproduces missing chunks when two servers share an optimizer cache",
    profile: "shared",
    status: 404,
    preserved: false,
  },
  {
    name: "keeps development chunks intact when the E2E server optimizes and restarts",
    profile: "isolated",
    status: 200,
    preserved: true,
  },
])("$name", async ({ profile, status, preserved }) => {
  const { stdout } = await execute(
    process.execPath,
    [join(__dirname, "viteCacheTestSupport.mjs"), profile],
    { timeout: 15_000 }
  );
  const result = JSON.parse(stdout);
  expect(result.results).toEqual([
    {
      status,
      javascript: preserved,
      fileMatches: preserved,
      metadataMatches: preserved,
    },
    {
      status,
      javascript: preserved,
      fileMatches: preserved,
      metadataMatches: preserved,
    },
  ]);
  expect(result.separateCaches).toBe(preserved);
}, 20_000);
