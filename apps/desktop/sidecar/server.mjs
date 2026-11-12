import { createServer } from "node:http";

const token = process.env.NOTEGIC_SIDECAR_TOKEN ?? "";
const port = Number(process.env.NOTEGIC_SIDECAR_PORT ?? "0");

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

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  if (address && typeof address === "object") {
    process.stdout.write(`port ${address.port}\n`);
  }
});
