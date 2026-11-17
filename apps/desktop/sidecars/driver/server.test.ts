import { type ChildProcess, spawn } from "node:child_process";

const token = "desktop-launch-token";

const startSidecar = async (): Promise<{
  child: ChildProcess;
  port: number;
}> => {
  const child = spawn(process.execPath, ["--import", "tsx", "server.ts"], {
    cwd: __dirname,
    env: {
      ...process.env,
      NOTEGIC_SIDECAR_TOKEN: token,
      NOTEGIC_SIDECAR_PORT: "0",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const port = await new Promise<number>((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      reject(new Error(`sidecar did not report a port: ${output}`));
    }, 15_000);
    child.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
      const match = /port (\d+)/.exec(output);
      if (!match) return;
      clearTimeout(timer);
      resolve(Number(match[1]));
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.once("error", error => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", code => {
      clearTimeout(timer);
      reject(new Error(`sidecar exited ${code}: ${output}`));
    });
  });

  return { child, port };
};

describe("desktop driver sidecar", () => {
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
