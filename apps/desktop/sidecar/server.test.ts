import { type ChildProcess, spawn } from "node:child_process";

const token = "desktop-launch-token";

const startSidecar = async (): Promise<{
  child: ChildProcess;
  port: number;
}> => {
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: __dirname,
    env: {
      ...process.env,
      NOTEGIC_SIDECAR_TOKEN: token,
      NOTEGIC_SIDECAR_PORT: "0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const port = await new Promise<number>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("sidecar did not report a port"));
    }, 5_000);
    child.stdout?.once("data", (chunk: Buffer) => {
      clearTimeout(timer);
      const match = /port (\d+)/.exec(chunk.toString());
      if (!match) {
        reject(new Error(`unexpected sidecar output: ${chunk.toString()}`));
        return;
      }
      resolve(Number(match[1]));
    });
    child.once("error", error => {
      clearTimeout(timer);
      reject(error);
    });
  });

  return { child, port };
};

describe("desktop sidecar", () => {
  let child: ChildProcess | undefined;
  let port = 0;

  beforeAll(async () => {
    const started = await startSidecar();
    child = started.child;
    port = started.port;
  });

  afterAll(async () => {
    if (!child) return;
    child.kill();
    await new Promise<void>(resolve => {
      child?.once("exit", () => resolve());
    });
  });

  it("rejects a request that lacks the launch token", async () => {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    expect(response.status).toBe(401);
  });

  it("accepts the launch token", async () => {
    const response = await fetch(`http://127.0.0.1:${port}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(204);
  });
});
