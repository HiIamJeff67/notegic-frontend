#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const backendRoot = path.resolve(projectRoot, "../notegic-backend");
const defaults = {
  gateway: path.join(
    backendRoot,
    "contracts/api-gateway/v1/public/openapi/openapi.json"
  ),
  gatewayRules: path.join(backendRoot, "contracts/api-gateway/v1/public/rules"),
  output: path.join(
    projectRoot,
    "apps/web/src/pages/document/publicApiData.ts"
  ),
};

const args = {};
for (let index = 0; index < process.argv.length - 2; index += 1) {
  const argument = process.argv[index + 2];
  if (!argument.startsWith("--")) continue;
  const [key, inlineValue] = argument.slice(2).split("=", 2);
  const nextValue = process.argv[index + 3];
  const value =
    inlineValue ??
    (nextValue && !nextValue.startsWith("--") ? nextValue : true);
  args[key] = value;
  if (inlineValue === undefined && value !== true) index += 1;
}

if (args.help === true) {
  console.log(`Usage: npm run generate:public-api -- [options]

Paths may be absolute or relative to the frontend project root.

Options:
  --gateway <path>        API Gateway public OpenAPI JSON
  --gatewayRules <path>   API Gateway public rules directory
  --output <path>         Generated TypeScript output
`);
  process.exit(0);
}

const input = key => {
  const value = args[key] ?? defaults[key];
  if (value === true) throw new Error(`Missing value for --${key}`);
  return path.isAbsolute(value) ? value : path.resolve(projectRoot, value);
};
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const readText = file => fs.readFileSync(file, "utf8");
const refName = ref => ref?.split("/").pop();
const sanitizeDocumentation = value => {
  if (typeof value === "string") {
    return value
      .replace(/`?x-go-[\w-]*dto`?/gi, "schema metadata")
      .replace(/\bGo DTOs?\b/gi, "server schemas")
      .replace(/\bDTOs?\b/gi, "schemas")
      .replace(/\bAPI Gateway\b/gi, "public API")
      .replace(/\bClientGateway\b/g, "web app")
      .replace(/\bRealtimeGateway\b/g, "realtime service")
      .replace(/\bGateway\b/gi, "API");
  }
  if (Array.isArray(value)) return value.map(sanitizeDocumentation);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sanitizeDocumentation(entry),
      ])
    );
  }
  return value;
};

const resolveSchema = (schema, document, seen = new Set()) => {
  if (!schema) return {};
  if (schema.$ref) {
    const name = refName(schema.$ref);
    if (!name || seen.has(name)) return {};
    return resolveSchema(
      document.components?.schemas?.[name],
      document,
      new Set([...seen, name])
    );
  }
  return schema;
};

const combinedProperties = (schema, document, seen = new Set()) => {
  const resolved = resolveSchema(schema, document, seen);
  const variants = resolved.oneOf || resolved.anyOf || [];
  return [resolved, ...variants].reduce((properties, variant) => {
    const current = resolveSchema(variant, document, seen);
    if (current.allOf) {
      Object.assign(
        properties,
        ...current.allOf.map(part => combinedProperties(part, document, seen))
      );
    }
    Object.assign(properties, current.properties || {});
    return properties;
  }, {});
};

const schemaType = (schema, document) => {
  const resolved = resolveSchema(schema, document);
  if (resolved.const !== undefined) return JSON.stringify(resolved.const);
  if (resolved.enum)
    return resolved.enum.map(value => JSON.stringify(value)).join(" | ");
  if (Array.isArray(resolved.type)) return resolved.type.join(" | ");
  if (resolved.type === "array") {
    return `${schemaType(resolved.items || {}, document)}[]`;
  }
  if (resolved.format)
    return `${resolved.type || "value"} (${resolved.format})`;
  return resolved.type || (resolved.properties ? "object" : "value");
};

const exampleForSchema = (schema, document, seen = new Set()) => {
  const resolved = schema?.$ref
    ? resolveSchema(schema, document, seen)
    : schema || {};
  if (resolved.example !== undefined) return resolved.example;
  if (resolved.const !== undefined) return resolved.const;
  if (resolved.enum?.length) return resolved.enum[0];
  if (resolved.oneOf?.length)
    return exampleForSchema(resolved.oneOf[0], document, seen);
  if (resolved.anyOf?.length)
    return exampleForSchema(resolved.anyOf[0], document, seen);
  if (resolved.type === "array")
    return [exampleForSchema(resolved.items, document, seen)];
  if (resolved.type === "object" || resolved.properties || resolved.$ref) {
    const properties = combinedProperties(schema, document, seen);
    return Object.fromEntries(
      Object.entries(properties).map(([name, property]) => [
        name,
        exampleForSchema(property, document, seen),
      ])
    );
  }
  if (resolved.format === "uuid") return "00000000-0000-4000-8000-000000000001";
  if (resolved.format === "date-time") return "2026-01-01T00:00:00Z";
  if (resolved.type === "boolean") return false;
  if (resolved.type === "integer" || resolved.type === "number") return 0;
  if (resolved.type === "string") return "example";
  return null;
};

const fieldsForSchema = (schema, document, seen = new Set()) => {
  const resolved = resolveSchema(schema, document, seen);
  const properties = combinedProperties(schema, document, seen);
  const required = new Set(resolved.required || []);
  return Object.entries(properties).map(([name, property]) => {
    const propertySchema = resolveSchema(property, document, seen);
    return {
      name,
      type: schemaType(property, document),
      required: required.has(name),
      description: propertySchema.description,
      enum: propertySchema.enum,
      example: exampleForSchema(property, document, seen),
      children:
        propertySchema.type === "object" ||
        propertySchema.properties ||
        propertySchema.$ref
          ? fieldsForSchema(property, document, seen)
          : undefined,
    };
  });
};

const contentSchema = (content, document) =>
  content?.["application/json"]?.schema ||
  content?.["application/octet-stream"]?.schema ||
  null;

const operationExample = (operation, document) => {
  const media = operation.requestBody?.content?.["application/json"];
  return (
    media?.example ??
    (media?.examples ? Object.values(media.examples)[0]?.value : undefined) ??
    exampleForSchema(media?.schema, document)
  );
};

const responseDetails = (operation, document) => {
  const status = Object.keys(operation.responses || {}).find(code =>
    /^2/.test(code)
  );
  const response = status ? operation.responses[status] : undefined;
  const schema = contentSchema(response?.content, document);
  return {
    status: status || null,
    fields: fieldsForSchema(schema, document),
    example: exampleForSchema(schema, document),
  };
};

const errorDetails = operation =>
  Object.entries(operation.responses || {})
    .filter(([status]) => !/^2/.test(status))
    .map(([status, response]) => ({
      status,
      description: response.description || "Request failed",
      message: `The server returned HTTP ${status}. ${response.description || "Request failed"}`,
    }));

const parameterDetails = (operation, pathItem, document) =>
  [...(pathItem.parameters || []), ...(operation.parameters || [])].map(
    parameter => ({
      name: parameter.name,
      location: parameter.in,
      required: Boolean(parameter.required),
      type: schemaType(parameter.schema, document),
      example:
        parameter.example ?? exampleForSchema(parameter.schema, document),
      description: parameter.description,
    })
  );

const shellQuote = value => `'${String(value).replaceAll("'", "'\\''")}'`;

const endpointExamples = (
  route,
  method,
  parameters,
  requestExample,
  document
) => {
  const server =
    document.servers?.[0]?.url || "http://localhost/api/development/v1";
  const pathParameters = new Map(
    parameters
      .filter(parameter => parameter.location === "path")
      .map(parameter => [parameter.name, parameter.example])
  );
  const resolvedPath = route.replace(/\{([^}]+)\}/g, (_, name) =>
    encodeURIComponent(String(pathParameters.get(name) ?? `{${name}}`))
  );
  const query = parameters
    .filter(parameter => parameter.location === "query")
    .map(
      parameter =>
        `${encodeURIComponent(parameter.name)}=${encodeURIComponent(String(parameter.example))}`
    )
    .join("&");
  const url = `${server}${resolvedPath}${query ? `?${query}` : ""}`;
  const headers = parameters.filter(
    parameter => parameter.location === "header"
  );
  const headerLines = headers
    .map(
      parameter => `-H ${shellQuote(`${parameter.name}: ${parameter.example}`)}`
    )
    .join(" \\\n  ");
  const hasBody = requestExample !== null && requestExample !== undefined;
  const contentHeader = hasBody
    ? `-H ${shellQuote("Content-Type: application/json")}`
    : "";
  const body = hasBody
    ? `--data-raw ${shellQuote(JSON.stringify(requestExample, null, 2))}`
    : "";
  const curl = [
    `curl --request ${method} ${shellQuote(url)}`,
    headerLines,
    contentHeader,
    body,
  ]
    .filter(Boolean)
    .join(" \\\n  ");
  const httpHeaders = [
    ...headers.map(parameter => `${parameter.name}: ${parameter.example}`),
    ...(hasBody ? ["Content-Type: application/json"] : []),
  ];
  const http = [
    `${method} ${url}`,
    ...httpHeaders,
    ...(hasBody ? ["", JSON.stringify(requestExample, null, 2)] : []),
  ].join("\n");
  const json = JSON.stringify(
    {
      headers: Object.fromEntries(
        httpHeaders.map(line => line.split(/:\s*/, 2))
      ),
      body: requestExample ?? null,
    },
    null,
    2
  );
  return { curl, http, json };
};

const tagInfo = {
  auth: [
    "Authentication",
    "Register and login establish the Beta cookie session.",
  ],
  "block-packs": [
    "Block Packs",
    "Create, read, move, restore, and update Block Pack resources.",
  ],
  blocks: ["Blocks", "Read blocks directly or by their containing Block Pack."],
  graphql: [
    "GraphQL",
    "GraphQL-over-HTTP endpoint and bundled schema examples.",
  ],
  materials: [
    "Materials",
    "Manage uploaded materials, content, parents, and recovery.",
  ],
  "user-account": [
    "User account",
    "Account identity and linked Google account operations.",
  ],
  "user-info": [
    "User info",
    "Public profile and personal information operations.",
  ],
  "user-settings": [
    "User settings",
    "Read and update persisted user settings.",
  ],
  notifications: [
    "Notifications",
    "Search, count, read, and delete notifications.",
  ],
  realtime: [
    "Realtime tickets",
    "Gateway-issued connection and channel tickets.",
  ],
  "root-shelves": [
    "Root Shelves",
    "CRUD, memberships, ownership, permissions, and recovery.",
  ],
  "routine-tags": ["Routine Tags", "Routine tag CRUD and permanent deletion."],
  "routine-task-records": [
    "Routine task records",
    "History queries and visualizations.",
  ],
  "routine-tasks": [
    "Routine Tasks",
    "Task queries, lifecycle actions, and visualizations.",
  ],
  routines: [
    "Routines",
    "Routine CRUD, linking, scheduling, and visualizations.",
  ],
  static: ["Static assets", "Public global assets such as avatars."],
  stations: [
    "Stations",
    "CRUD, memberships, permissions, ownership, and visualizations.",
  ],
  "sub-shelves": [
    "Sub Shelves",
    "CRUD, ordering, item traversal, and recovery.",
  ],
  users: ["Users", "Authenticated user data and self profile endpoints."],
};

const tagForPath = pathValue => {
  const tag = pathValue.split("/")[1];
  return tag === "me" ? "user-account" : tagInfo[tag] ? tag : "users";
};

const methodOrder = { GET: 0, POST: 1, PUT: 2, PATCH: 3, DELETE: 4 };
const endpointSort = (left, right) => {
  const methodDifference =
    (methodOrder[left.method] ?? Number.MAX_SAFE_INTEGER) -
    (methodOrder[right.method] ?? Number.MAX_SAFE_INTEGER);
  if (methodDifference !== 0) return methodDifference;

  const leftPath = left.path.replace(/\{[^}]+\}/g, ":param");
  const rightPath = right.path.replace(/\{[^}]+\}/g, ":param");
  return (
    leftPath.split("/").length - rightPath.split("/").length ||
    leftPath.localeCompare(rightPath) ||
    left.operation.localeCompare(right.operation)
  );
};

const endpointGroups = document => {
  const groups = new Map();
  for (const [route, pathItem] of Object.entries(document.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (method.startsWith("x") || method === "parameters") continue;
      const tag = operation.tags?.[0] || tagForPath(route);
      const schema = contentSchema(operation.requestBody?.content, document);
      const response = responseDetails(operation, document);
      const parameters = parameterDetails(operation, pathItem, document);
      const requestExample = operationExample(operation, document);
      const summary =
        tag === "graphql"
          ? `GraphQL ${method.toUpperCase()}`
          : operation.summary || operation.operationId;
      const endpoint = {
        method: method.toUpperCase(),
        path: route,
        operation: operation.operationId,
        summary,
        description: operation.description,
        parameters,
        requestExample,
        requestFields: fieldsForSchema(schema, document),
        responseStatus: response.status,
        responseFields: response.fields,
        responseExample: response.example,
        errors: errorDetails(operation),
        examples: endpointExamples(
          route,
          method.toUpperCase(),
          parameters,
          requestExample,
          document
        ),
        tag,
      };
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push(endpoint);
    }
  }
  return [...groups.entries()].map(([id, endpoints]) => ({
    id,
    title: tagInfo[id]?.[0] || id,
    description: tagInfo[id]?.[1] || "",
    endpoints: endpoints.sort(endpointSort),
  }));
};

const humanizeDocumentation = value =>
  typeof value === "string"
    ? value
        .replaceAll("APIGateway", "API Gateway")
        .replaceAll("BlockPacks", "Block Packs")
        .replaceAll("BlockPack", "Block Pack")
    : value;

const markdownRules = directory =>
  fs
    .readdirSync(directory)
    .filter(file => file.endsWith(".md"))
    .sort()
    .map(file => {
      const lines = readText(path.join(directory, file)).split(/\r?\n/);
      const title = lines.find(line => line.startsWith("# "))?.slice(2) || file;
      const bullets = lines
        .filter(line => line.startsWith("- "))
        .map(line =>
          line
            .slice(2)
            .trim()
            .replace(/Go DTOs?/g, "server schemas")
        );
      const summary = lines
        .slice(1)
        .find(
          line => line.trim() && !line.startsWith("- ") && !line.startsWith("|")
        )
        ?.trim();
      return {
        id: file.replace(/\.md$/, ""),
        title: humanizeDocumentation(title),
        summary: humanizeDocumentation(summary),
        bullets: bullets.map(humanizeDocumentation),
      };
    });

const gateway = readJson(input("gateway"));
const apiGatewayDomainIds = new Set([
  "root-shelves",
  "sub-shelves",
  "materials",
  "block-packs",
  "blocks",
  "stations",
  "routines",
  "routine-tasks",
  "routine-tags",
]);
const gatewayEndpointData = sanitizeDocumentation(
  endpointGroups(gateway).filter(group => apiGatewayDomainIds.has(group.id))
);
const gatewayRuleData = sanitizeDocumentation(
  markdownRules(input("gatewayRules"))
);
const result = `// Generated by scripts/generatePublicApiData.mjs. Do not edit by hand.\n\n${[
  "export type DocumentField = { name: string; type: string; required: boolean; description?: string; enum?: readonly unknown[]; example?: unknown; children?: DocumentField[] };",
  `export type DocumentParameter = { name: string; location: string; required: boolean; type: string; example?: unknown; description?: string };`,
  "export type DocumentExamples = { curl: string; http: string; json: string };",
  "export type DocumentError = { status: string; description: string; message: string };",
  `export type DocumentEndpoint = { method: string; path: string; operation: string; summary: string; description?: string; parameters: DocumentParameter[]; requestExample: unknown; requestFields: DocumentField[]; responseStatus: string | null; responseFields: DocumentField[]; responseExample: unknown; errors: DocumentError[]; examples: DocumentExamples; tag: string };`,
  `export type DocumentEndpointGroup = { id: string; title: string; description: string; endpoints: DocumentEndpoint[] };`,
  `export const gatewayEndpointGroups: DocumentEndpointGroup[] = ${JSON.stringify(gatewayEndpointData, null, 2)};`,
  `export const gatewayRules = ${JSON.stringify(gatewayRuleData, null, 2)} as const;`,
  `export const documentSources = ${JSON.stringify(
    [
      {
        title: `API ${gateway.info.version}`,
        format: "OpenAPI 3.1",
        path: "Public API reference",
        detail:
          "The canonical public API contract for external integrations and API-key authentication.",
      },
      {
        title: "Rules and examples",
        format: "Markdown + JSON + HTTP",
        path: "*/rules/ and */examples/",
        detail: "Operational constraints and sanitized request examples.",
      },
    ],
    null,
    2
  )} as const;`,
].join("\n\n")}\n`;

fs.mkdirSync(path.dirname(input("output")), { recursive: true });
fs.writeFileSync(input("output"), result);
console.log(
  `Generated ${input("output")} from the public API contract with ${Object.values(gateway.paths || {}).reduce((count, item) => count + Object.keys(item).filter(key => !key.startsWith("x") && key !== "parameters").length, 0)} operations.`
);
