import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  readBlockPackDocument,
  saveBlockPackDocument,
} from "./blockPackDocument";
import { initialize, readRootShelf, saveRootShelf } from "./db";

const token = "desktop-launch-token";
const timestamp = new Date("2026-01-01T00:00:00.000Z");

const stopSidecar = async (child: ChildProcess | undefined) => {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await new Promise<void>(resolve => {
    child.once("exit", () => resolve());
  });
};

const startSidecar = async (
  databasePath?: string
): Promise<{
  child: ChildProcess;
  port: number;
}> => {
  const child = spawn(process.execPath, ["--import", "tsx", "server.ts"], {
    cwd: __dirname,
    env: {
      ...process.env,
      NOTEGIC_SIDECAR_TOKEN: token,
      NOTEGIC_SIDECAR_PORT: "0",
      ...(databasePath ? { NOTEGIC_LOCAL_DATABASE_PATH: databasePath } : {}),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const port = await new Promise<number>((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      reject(new Error(`sidecar did not report a port: ${output}`));
    }, 20_000);
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

const authorized = (port: number) =>
  fetch(`http://127.0.0.1:${port}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

describe("desktop driver sidecar", () => {
  let child: ChildProcess | undefined;
  let port = 0;

  beforeAll(async () => {
    const started = await startSidecar();
    child = started.child;
    port = started.port;
  });

  afterAll(async () => {
    await stopSidecar(child);
  });

  it("rejects a request that lacks the launch token", async () => {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    expect(response.status).toBe(401);
  });

  it("accepts the launch token", async () => {
    const response = await authorized(port);
    expect(response.status).toBe(204);
  });
});

describe("desktop driver sidecar restart", () => {
  it("keeps the shelf and document after the sidecar process is killed", async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "notegic-sidecar-"));
    const filePath = path.join(directory, "notegic.sqlite");
    const shelfId = "11111111-1111-4111-8111-111111111111";
    const blockPackId = "22222222-2222-4222-8222-222222222222";
    const update = Uint8Array.from([1, 2, 3, 4]);
    const stateVector = Uint8Array.from([9, 8]);
    const opened = await initialize(filePath);
    saveRootShelf(opened.db, {
      id: shelfId,
      name: "Desk",
      createdAt: timestamp,
      updatedAt: timestamp,
      lastAnalyzedAt: timestamp,
    });
    saveBlockPackDocument(opened.db, {
      blockPackId,
      update,
      stateVector,
      needsFlush: true,
      updatedAt: timestamp,
    });
    opened.close();

    const first = await startSidecar(filePath);
    expect((await authorized(first.port)).status).toBe(204);
    await stopSidecar(first.child);

    const second = await startSidecar(filePath);
    expect((await authorized(second.port)).status).toBe(204);
    await stopSidecar(second.child);

    const reopened = await initialize(filePath);
    const shelf = readRootShelf(reopened.db, shelfId);
    const document = readBlockPackDocument(reopened.db, blockPackId);
    reopened.close();

    expect(shelf).toMatchObject({ id: shelfId, name: "Desk" });
    expect(Array.from(document?.update ?? [])).toEqual(Array.from(update));
    expect(Array.from(document?.stateVector ?? [])).toEqual(
      Array.from(stateVector)
    );
  }, 60_000);
});
