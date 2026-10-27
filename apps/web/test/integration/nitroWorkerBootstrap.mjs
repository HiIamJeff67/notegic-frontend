import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { runtimeDir } from "nitro/meta";
import * as moduleRunner from "vite/module-runner";

const entry = await import(
  pathToFileURL(join(runtimeDir, "internal/vite/dev-worker.mjs"))
);
// Match Nitro's generated worker entry, without replacing its runtime behavior.
entry.setModuleRunner?.(moduleRunner);

export default entry;
