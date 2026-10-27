import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const nitroRequire = createRequire(require.resolve("nitro/package.json"));
const { loadRunner } = await import(nitroRequire.resolve("env-runner"));
const scenario = process.argv[2];
const worker = await loadRunner("node-worker", {
  name: "notegic-nitro-regression",
  data: {
    entry: fileURLToPath(
      new URL("./nitroWorkerBootstrap.mjs", import.meta.url)
    ),
  },
});
let imports = 0;

worker.onMessage(message => {
  if (
    message?.event !== "vite:invoke" ||
    !message.data?.id?.startsWith("send:")
  )
    return;

  const { id, name } = message.data;
  let data;
  if (name === "getBuiltins") {
    data = { result: [] };
  } else {
    assert.equal(name, "fetchModule");
    imports++;
    if (scenario === "reload" && imports === 1) {
      for (let index = 0; index < 3; index++)
        worker.sendMessage({ type: "full-reload", viteEnv: "nitro" });
    }

    let code;
    switch (scenario) {
      case "importError":
        code = 'throw new Error("fixture import failed");';
        break;
      case "handlerError":
        code =
          '__vite_ssr_exports__.fetch = () => { throw Object.assign(new Error("fixture handler failed"), { status: 418 }); };';
        break;
      case "handlerRejection":
        code =
          '__vite_ssr_exports__.fetch = async () => { throw Object.assign(new Error("fixture handler rejected"), { status: 502 }); };';
        break;
      case "missingHandler":
        code = "__vite_ssr_exports__.value = true;";
        break;
      case "stuck":
        code = "await new Promise(() => {});";
        break;
      default:
        code = `await new Promise(resolve => setTimeout(resolve, ${scenario === "slow" ? 4500 : scenario === "reload" ? 200 : 0})); __vite_ssr_exports__.fetch = () => new Response("entry-${imports}");`;
    }

    data = {
      result: {
        id: "/notegic-nitro-fixture.mjs",
        file: "/notegic-nitro-fixture.mjs",
        url: "/notegic-nitro-fixture.mjs",
        code,
        invalidate: true,
      },
    };
  }
  worker.sendMessage({
    type: "custom",
    event: "vite:invoke",
    viteEnv: "nitro",
    data: { name, id: id.replace("send:", "response:"), data },
  });
});

try {
  await worker.waitForReady();
  worker.sendMessage({
    type: "custom",
    event: "nitro:vite-env",
    data: { name: "nitro", entry: "/notegic-nitro-fixture.mjs" },
  });
  const start = performance.now();
  const response = await worker.fetch("http://nitro-fixture.test/", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(scenario === "stuck" ? 35_000 : 8_000),
  });
  console.log(
    JSON.stringify({
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: await response.text(),
      imports,
      elapsedMs: Math.round(performance.now() - start),
    })
  );
} finally {
  await worker.close();
}
