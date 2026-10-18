import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const requiredFiles = [
  "openapi.json",
  "rules/authentication.md",
  "rules/http-contract.md",
  "rules/origins-and-security.md",
  "rules/rate-limits-and-retries.md",
  "rules/versioning.md",
];

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "notegic-public-api-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.symlinkSync(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(root, "node_modules"),
    "dir"
  );
  const script = path.join(root, "scripts/generatePublicApiData.mjs");
  fs.mkdirSync(path.dirname(script), { recursive: true });
  fs.copyFileSync(
    fileURLToPath(new URL("./generatePublicApiData.mjs", import.meta.url)),
    script
  );
  const reference = path.join(
    root,
    "apps/web/src/pages/document/api-reference"
  );
  const contracts = path.join(reference, "contracts");
  fs.mkdirSync(path.join(contracts, "rules"), { recursive: true });
  fs.writeFileSync(
    path.join(contracts, "openapi.json"),
    JSON.stringify({
      openapi: "3.1.0",
      info: { title: "API fixture", version: "1.2.3" },
      servers: [
        { description: "Local development", url: "http://localhost/private" },
        { description: "Production", url: "https://api.example.test/v1" },
      ],
      components: {
        securitySchemes: {
          apiKey: { type: "apiKey", in: "header", name: "X-API-Key" },
        },
      },
      security: [{ apiKey: [] }],
      paths: {
        "/root-shelves": {
          get: {
            operationId: "getRootShelves",
            summary: "GetRootShelves",
            description: "List the root shelves you can access.",
            tags: ["root-shelves"],
            responses: {
              200: {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: { success: { const: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
  );
  for (const file of requiredFiles.slice(1)) {
    fs.writeFileSync(
      path.join(contracts, file),
      "# Rule\n\nSummary.\n\n- Required rule.\n"
    );
  }
  const output = path.join(reference, "generated/publicAPIData.ts");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, "previous generated output");
  return { script, contracts, output };
}

function run(input, ...args) {
  return spawnSync(process.execPath, [input.script, ...args], {
    cwd: os.tmpdir(),
    encoding: "utf8",
  });
}

function generated(input) {
  const context = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(input.output, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    context
  );
  return context.exports;
}

test("reports every missing local input without changing existing output", t => {
  const input = fixture(t);
  for (const file of requiredFiles)
    fs.unlinkSync(path.join(input.contracts, file));
  const result = run(input);
  assert.equal(result.status, 1);
  for (const file of requiredFiles) assert.ok(result.stderr.includes(file));
  assert.equal(
    fs.readFileSync(input.output, "utf8"),
    "previous generated output"
  );
});

for (const file of requiredFiles) {
  test(`requires ${file} before generating`, t => {
    const input = fixture(t);
    fs.unlinkSync(path.join(input.contracts, file));
    const result = run(input);
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(file));
    assert.equal(
      fs.readFileSync(input.output, "utf8"),
      "previous generated output"
    );
  });
}

test("a directory cannot replace a required file", t => {
  const input = fixture(t);
  const file = path.join(input.contracts, "rules/versioning.md");
  fs.unlinkSync(file);
  fs.mkdirSync(file);
  const result = run(input);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes("rules/versioning.md"));
  assert.equal(
    fs.readFileSync(input.output, "utf8"),
    "previous generated output"
  );
});

test("generates solely from the local six-file snapshot, regardless of working directory", t => {
  const input = fixture(t);
  fs.writeFileSync(
    path.join(input.contracts, "rules/unused.md"),
    "# Do not publish this\n"
  );
  const result = run(input);
  assert.equal(result.status, 0, result.stderr);
  const output = fs.readFileSync(input.output, "utf8");
  assert.ok(output.includes('"getRootShelves"'));
  assert.ok(output.includes('"1.2.3"'));
  assert.equal((output.match(/"id":/g) ?? []).length, 6);
  assert.ok(!output.includes("Do not publish this"));
});

test("keeps backend names, identifiers, and descriptions distinct without a duplicate summary", t => {
  const input = fixture(t);
  const file = path.join(input.contracts, "openapi.json");
  const contract = JSON.parse(fs.readFileSync(file, "utf8"));
  contract.paths["/root-shelves"].get.summary = "BrowseAccessibleShelves";
  fs.writeFileSync(file, JSON.stringify(contract));
  const result = run(input);
  assert.equal(result.status, 0, result.stderr);
  const endpoint = generated(input).gatewayEndpointGroups[0].endpoints[0];
  assert.equal(endpoint.operation, "BrowseAccessibleShelves");
  assert.equal(endpoint.operationId, "getRootShelves");
  assert.equal(endpoint.description, "List the root shelves you can access.");
  assert.equal(Object.hasOwn(endpoint, "summary"), false);
});

for (const [field, value] of [
  ["operationId", undefined],
  ["summary", undefined],
  ["summary", "   "],
  ["summary", "Get root shelves"],
  ["summary", "getRootShelves"],
  ["description", undefined],
  ["description", "   "],
]) {
  test(`rejects invalid ${field} (${JSON.stringify(value)}) without replacing output`, t => {
    const input = fixture(t);
    const file = path.join(input.contracts, "openapi.json");
    const contract = JSON.parse(fs.readFileSync(file, "utf8"));
    contract.paths["/root-shelves"].get[field] = value;
    fs.writeFileSync(file, JSON.stringify(contract));
    const result = run(input);
    assert.notEqual(result.status, 0);
    assert.ok(result.stderr.includes("GET /root-shelves"));
    assert.equal(
      fs.readFileSync(input.output, "utf8"),
      "previous generated output"
    );
  });
}

test("invalid JSON does not overwrite the previous output", t => {
  const input = fixture(t);
  fs.writeFileSync(path.join(input.contracts, "openapi.json"), "invalid JSON");
  assert.notEqual(run(input).status, 0);
  assert.equal(
    fs.readFileSync(input.output, "utf8"),
    "previous generated output"
  );
});

test("help does not require contract files or generate output", t => {
  const input = fixture(t);
  for (const file of requiredFiles)
    fs.unlinkSync(path.join(input.contracts, file));
  const result = run(input, "--help");
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes("contracts/"));
  assert.equal(
    fs.readFileSync(input.output, "utf8"),
    "previous generated output"
  );
});

test("rejects legacy external input overrides", t => {
  const input = fixture(t);
  const result = run(input, "--gateway", "/other-repository/openapi.json");
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes("Unsupported arguments"));
  assert.equal(
    fs.readFileSync(input.output, "utf8"),
    "previous generated output"
  );
});

test("retains all success and error specifications, including bodyless responses", t => {
  const input = fixture(t);
  const file = path.join(input.contracts, "openapi.json");
  const contract = JSON.parse(fs.readFileSync(file, "utf8"));
  const operation = contract.paths["/root-shelves"].get;
  operation.responses[201] = {
    description: "Created",
    content: {
      "application/json": {
        example: { id: "created-id" },
        schema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
        },
      },
    },
  };
  operation.responses[204] = { description: "No content" };
  operation.responses[400] = {
    description: "Invalid request",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: { reason: { type: "string", example: "InvalidInput" } },
        },
      },
    },
  };
  operation.responses.default = { description: "Unexpected response" };
  operation.responses["x-note"] = "Not a response";
  contract.paths["/root-shelves"].post = {
    ...operation,
    operationId: "createRootShelf",
  };
  fs.writeFileSync(file, JSON.stringify(contract));
  const result = run(input);
  assert.equal(result.status, 0, result.stderr);

  const endpoints = generated(input).gatewayEndpointGroups[0].endpoints;
  const responses = endpoints[0].responses;
  assert.equal(
    responses.map(response => response.status).join(","),
    "200,201,204,400,default"
  );
  assert.equal(responses[1].example.id, "created-id");
  assert.equal(responses[1].fields[0].name, "id");
  assert.equal(responses[1].fields[0].required, true);
  assert.equal(responses[2].hasBody, false);
  assert.equal(responses[2].fields.length, 0);
  assert.equal(responses[3].example.reason, "InvalidInput");
  assert.equal(responses[3].fields[0].name, "reason");
  assert.equal(responses[0], endpoints[1].responses[0]);
});

test("uses production URLs, security headers and required query values without rewriting protocol strings", t => {
  const input = fixture(t);
  const file = path.join(input.contracts, "openapi.json");
  const contract = JSON.parse(fs.readFileSync(file, "utf8"));
  const operation = contract.paths["/root-shelves"].get;
  operation.parameters = [
    {
      name: "areDeleted",
      in: "query",
      required: false,
      example: true,
      schema: { type: "boolean" },
    },
    {
      name: "kind",
      in: "query",
      required: true,
      example: "ClientGateway",
      schema: { type: "string" },
    },
    {
      name: "X-Context",
      in: "header",
      example: "https://example.test/context",
      schema: { type: "string" },
    },
  ];
  operation.responses[401] = { description: "Authentication or CSRF failed" };
  fs.writeFileSync(file, JSON.stringify(contract));
  const result = run(input);
  assert.equal(result.status, 0, result.stderr);
  const data = generated(input);
  const endpoint = data.gatewayEndpointGroups[0].endpoints[0];
  assert.equal(data.publicApiBaseURL, "https://api.example.test/v1");
  assert.ok(
    endpoint.examples.curl.includes(
      "https://api.example.test/v1/root-shelves?kind=ClientGateway"
    )
  );
  assert.ok(endpoint.examples.curl.includes("X-API-Key: <YOUR_API_KEY>"));
  assert.ok(endpoint.examples.http.includes("X-API-Key: <YOUR_API_KEY>"));
  assert.equal(
    JSON.parse(endpoint.examples.json).headers["X-Context"],
    "https://example.test/context"
  );
  assert.ok(!endpoint.examples.http.includes("areDeleted="));
  assert.ok(!endpoint.examples.http.includes("localhost"));
  assert.ok(
    endpoint.parameters.find(parameter => parameter.name === "X-API-Key")
      .required
  );
  assert.equal(
    endpoint.responses.find(response => response.status === "401").description,
    "API key authentication failed"
  );
});

test("includes every published resource and retains nested array fields and validation constraints", t => {
  const input = fixture(t);
  const file = path.join(input.contracts, "openapi.json");
  const contract = JSON.parse(fs.readFileSync(file, "utf8"));
  const operation = contract.paths["/root-shelves"].get;
  operation.requestBody = {
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              maxItems: 12,
              items: {
                type: "object",
                required: ["color"],
                properties: {
                  color: {
                    type: "string",
                    pattern: "^#[0-9A-Fa-f]{6}$",
                    minLength: 7,
                    maxLength: 7,
                  },
                  purpose: {
                    type: "string",
                    enum: ["ClientGateway", "Gateway"],
                  },
                  priority: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                    default: 0,
                  },
                  child: { $ref: "#/components/schemas/Recursive" },
                },
              },
            },
          },
        },
      },
    },
  };
  contract.components.schemas = {
    Recursive: {
      type: "object",
      properties: { next: { $ref: "#/components/schemas/Recursive" } },
    },
  };
  contract.paths["/routine-task-dependencies"] = {
    get: {
      ...operation,
      operationId: "getDependencies",
      tags: ["routine-task-dependencies"],
    },
  };
  contract.paths["/new-public-resource"] = {
    get: {
      ...operation,
      operationId: "getNewResource",
      tags: ["new-public-resource"],
    },
  };
  fs.writeFileSync(file, JSON.stringify(contract));
  const result = run(input);
  assert.equal(result.status, 0, result.stderr);
  const groups = generated(input).gatewayEndpointGroups;
  assert.equal(groups.length, 3);
  assert.ok(groups.find(group => group.id === "routine-task-dependencies"));
  assert.ok(groups.find(group => group.id === "new-public-resource"));
  const field = groups[0].endpoints[0].requestFields[0];
  assert.equal(field.type, "object[]");
  assert.equal(field.required, true);
  assert.equal(field.constraints.join(","), "minItems: 1,maxItems: 12");
  assert.equal(field.children[0].required, true);
  assert.ok(
    field.children[0].constraints.includes('pattern: "^#[0-9A-Fa-f]{6}$"')
  );
  assert.equal(field.children[1].type, '"ClientGateway" | "Gateway"');
  assert.ok(field.children[2].constraints.includes("default: 0"));
  assert.ok(field.children[2].constraints.includes("maximum: 100"));
});

test("preserves public rule blocks in source order and omits known contributor-only notes", t => {
  const input = fixture(t);
  fs.writeFileSync(
    path.join(input.contracts, "rules/rate-limits-and-retries.md"),
    "# Public rules\n\nFirst paragraph.\n\n- A public rule.\n\nSecond paragraph: reconcile a timed-out mutation.\n\nThe server persists only a SHA-256 digest.\n\n1. Wait.\n2. Retry safely.\n\n```http\nX-RateLimit-Limit: 10\n```\n"
  );
  const result = run(input);
  assert.equal(result.status, 0, result.stderr);
  const rule = generated(input).gatewayRules.find(
    rule => rule.id === "rate-limits-and-retries"
  );
  assert.equal(
    rule.blocks.map(block => block.type).join(","),
    "paragraph,list,paragraph,list,code"
  );
  assert.equal(
    rule.blocks[2].text,
    "Second paragraph: reconcile a timed-out mutation."
  );
  assert.equal(rule.blocks[3].ordered, true);
  assert.equal(rule.blocks[3].items.join(","), "Wait.,Retry safely.");
  assert.ok(!JSON.stringify(rule).includes("SHA-256"));
});

for (const invalid of [
  "production server",
  "API key security",
  "API-key-only security",
]) {
  test(`rejects a contract without ${invalid} before replacing output`, t => {
    const input = fixture(t);
    const file = path.join(input.contracts, "openapi.json");
    const contract = JSON.parse(fs.readFileSync(file, "utf8"));
    if (invalid === "production server")
      contract.servers = [
        { description: "Local development", url: "http://localhost/private" },
      ];
    else if (invalid === "API key security")
      contract.paths["/root-shelves"].get.security = [];
    else
      contract.paths["/root-shelves"].get.security = [
        { apiKey: [] },
        { browserSession: [] },
      ];
    fs.writeFileSync(file, JSON.stringify(contract));
    assert.notEqual(run(input).status, 0);
    assert.equal(
      fs.readFileSync(input.output, "utf8"),
      "previous generated output"
    );
  });
}
