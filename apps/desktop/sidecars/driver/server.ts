import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialize } from "./db";

const token = process.env.NOTEGIC_SIDECAR_TOKEN ?? "";
const port = Number(process.env.NOTEGIC_SIDECAR_PORT ?? "0");
const databasePath = process.env.NOTEGIC_LOCAL_DATABASE_PATH;
const driverDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(
  driverDirectory,
  "../../../../packages/api/local/migrations"
);

const opened = databasePath
  ? await initialize(databasePath, migrationsDirectory)
  : undefined;

const server = createServer((request, response) => {
  const header = request.headers.authorization;
  if (token.length === 0 || header !== `Bearer ${token}`) {
    response.writeHead(401);
    response.end();
    return;
  }

  response.writeHead(204);
  response.end();
});

server.on("close", () => {
  opened?.close();
});

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  if (address && typeof address === "object") {
    process.stdout.write(`port ${address.port}\n`);
  }
});
