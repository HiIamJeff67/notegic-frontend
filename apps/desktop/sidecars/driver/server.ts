import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialize } from "./db";

const token = process.env.NOTEGIC_SIDECAR_TOKEN ?? "";
const port = Number(process.env.NOTEGIC_SIDECAR_PORT ?? "0");
const databasePath = process.env.NOTEGIC_LOCAL_DATABASE_PATH;
const transactionIdleMs = 5_000;
const driverDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(
  driverDirectory,
  "../../../../packages/api/local/migrations"
);

const opened = databasePath
  ? await initialize(databasePath, migrationsDirectory)
  : undefined;

let pending = Promise.resolve();
const enqueue = <T>(operation: () => T) => {
  const result = pending.then(operation, operation);
  pending = result.then(
    () => undefined,
    () => undefined
  );
  return result;
};

let transactionClientId: string | undefined;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
const waiting: (() => void)[] = [];

const endTransaction = () => {
  transactionClientId = undefined;
  if (idleTimer !== undefined) clearTimeout(idleTimer);
  idleTimer = undefined;
  const pendingWaiters = waiting.splice(0);
  for (const resolve of pendingWaiters) resolve();
};

const armIdleTimer = () => {
  if (idleTimer !== undefined) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    void enqueue(() => {
      if (transactionClientId === undefined || opened === undefined) return;
      opened.db.$client.exec("ROLLBACK");
      endTransaction();
    });
  }, transactionIdleMs);
};

const transactionSql = /^(begin|commit|rollback|savepoint|release)\b/i;
const beginsTransaction = (sql: string) => /^begin\b/i.test(sql);
const endsTransaction = (sql: string) =>
  /^commit\b/i.test(sql) ||
  (/^rollback\b/i.test(sql) && !/^rollback\s+to\b/i.test(sql));

const readBody = async (request: AsyncIterable<unknown>) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks).toString("utf8");
};

const rowsFor = (sql: string, params: unknown[], method: string) => {
  if (opened === undefined) return [];
  const sqlite = opened.db.$client;
  const text = sql.trim();
  if (method === "run" && transactionSql.test(text)) {
    sqlite.exec(text);
    return [];
  }
  const statement = sqlite.prepare(sql);
  const bound = params as never[];
  if (method === "run") {
    statement.run(...bound);
    return [];
  }
  if (method === "get") {
    return (statement.raw().get(...bound) as unknown[] | undefined) ?? null;
  }
  return statement.raw().all(...bound);
};

const runSql = async (body: {
  clientId: string;
  sql: string;
  params: unknown[];
  method: string;
}) => {
  while (
    transactionClientId !== undefined &&
    transactionClientId !== body.clientId
  ) {
    await new Promise<void>(resolve => {
      waiting.push(resolve);
    });
  }
  const outcome = await enqueue(() => {
    if (
      transactionClientId !== undefined &&
      transactionClientId !== body.clientId
    ) {
      return { retry: true as const };
    }
    const text = body.sql.trim();
    const rows = rowsFor(body.sql, body.params, body.method);
    if (beginsTransaction(text)) {
      transactionClientId = body.clientId;
      armIdleTimer();
    } else if (transactionClientId === body.clientId && endsTransaction(text)) {
      endTransaction();
    } else if (transactionClientId === body.clientId) {
      armIdleTimer();
    }
    return { retry: false as const, rows };
  });
  if (outcome.retry) return runSql(body);
  return outcome.rows;
};

const server = createServer(async (request, response) => {
  const header = request.headers.authorization;
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "authorization, content-type"
  );
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
  if (token.length === 0 || header !== `Bearer ${token}`) {
    response.writeHead(401);
    response.end();
    return;
  }

  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  if (request.method === "POST" && pathname === "/sql") {
    if (opened === undefined) {
      response.writeHead(503);
      response.end();
      return;
    }
    try {
      const body = JSON.parse(await readBody(request)) as {
        clientId?: string;
        sql?: string;
        params?: unknown[];
        method?: string;
      };
      if (
        body.clientId === undefined ||
        body.sql === undefined ||
        body.method === undefined
      ) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end("{}");
        return;
      }
      const rows = await runSql({
        clientId: body.clientId,
        sql: body.sql,
        params: body.params ?? [],
        method: body.method,
      });
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ rows }));
    } catch {
      response.writeHead(400, { "content-type": "application/json" });
      response.end("{}");
    }
    return;
  }

  response.writeHead(204);
  response.end();
});

server.on("close", () => {
  if (idleTimer !== undefined) clearTimeout(idleTimer);
  opened?.close();
});

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  if (address && typeof address === "object") {
    process.stdout.write(`port ${address.port}\n`);
  }
});
