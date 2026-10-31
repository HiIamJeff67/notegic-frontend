#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const referenceRoot = path.join(projectRoot, "apps/web/src/pages/document/api");
const contractRoot = path.join(referenceRoot, "sources");
const output = path.join(referenceRoot, "generated.ts");
const ruleFiles = [
  "authentication.md",
  "http-contract.md",
  "origins-and-security.md",
  "rate-limits-and-retries.md",
  "versioning.md",
];

if (process.argv.length === 3 && process.argv[2] === "--help") {
  console.log(`Usage: npm run generate:public-api

Manually copy the backend's published contract into:
  apps/web/src/pages/document/api/sources/

Required files:
  @openapi.json (OpenAPI 3.1 JSON)
${ruleFiles.map(file => `  @${file}`).join("\n")}

All six files must exist before generation. Missing inputs leave the existing output unchanged.
Output: apps/web/src/pages/document/api/generated.ts
`);
  process.exit(0);
}

if (process.argv.length > 2) {
  console.error(
    "Unsupported arguments. Run npm run generate:public-api:help for usage."
  );
  process.exit(1);
}

const requiredFiles = ["@openapi.json", ...ruleFiles.map(file => `@${file}`)];
const missingFiles = requiredFiles.filter(file => {
  const filePath = path.join(contractRoot, file);
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return !fs.statSync(filePath).isFile();
  } catch {
    return true;
  }
});

if (missingFiles.length > 0) {
  console.error(`Cannot generate public API documentation. Missing or unreadable required files:
${missingFiles.map(file => `  - ${path.relative(projectRoot, path.join(contractRoot, file))}`).join("\n")}
Copy all six published contract files into ${path.relative(projectRoot, contractRoot)} and run the command again.
The existing generated output has not been changed.`);
  process.exit(1);
}

const refName = ref => ref?.split("/").pop();
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
  const types = [resolved.type].flat();
  if (types.includes("array")) {
    return `${schemaType(resolved.items || {}, document)}[]${types.includes("null") ? " | null" : ""}`;
  }
  if (Array.isArray(resolved.type)) return resolved.type.join(" | ");
  if (resolved.format)
    return `${resolved.type || "value"} (${resolved.format})`;
  return resolved.type || (resolved.properties ? "object" : "value");
};

const schemaExample = (schema, document, seen = new Set()) => {
  if (schema?.$ref && seen.has(schema.$ref)) return null;
  const resolved = schema?.$ref
    ? resolveSchema(schema, document, seen)
    : schema || {};
  const nextSeen = schema?.$ref ? new Set([...seen, schema.$ref]) : seen;
  if (resolved.example !== undefined) return resolved.example;
  if (resolved.const !== undefined) return resolved.const;
  if (resolved.enum?.length) return resolved.enum[0];
  if (resolved.oneOf?.length)
    return schemaExample(resolved.oneOf[0], document, nextSeen);
  if (resolved.anyOf?.length)
    return schemaExample(resolved.anyOf[0], document, nextSeen);
  if ([resolved.type].flat().includes("array"))
    return [schemaExample(resolved.items, document, nextSeen)];
  if (
    [resolved.type].flat().includes("object") ||
    resolved.properties ||
    resolved.allOf
  ) {
    const properties = combinedProperties(schema, document, seen);
    return Object.fromEntries(
      Object.entries(properties).map(([name, property]) => [
        name,
        schemaExample(property, document, nextSeen),
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

const schemaConstraints = schema =>
  [
    "default",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "minLength",
    "maxLength",
    "pattern",
    "minItems",
    "maxItems",
    "uniqueItems",
  ]
    .filter(key => schema[key] !== undefined)
    .map(key => `${key}: ${JSON.stringify(schema[key])}`);

const schemaFields = (schema, document, seen = new Set()) => {
  if (schema?.$ref && seen.has(schema.$ref)) return [];
  const resolved = resolveSchema(schema, document, seen);
  const nextSeen = schema?.$ref ? new Set([...seen, schema.$ref]) : seen;
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
      example: schemaExample(property, document, seen),
      constraints: schemaConstraints(propertySchema),
      children: schemaFields(
        [propertySchema.type].flat().includes("array")
          ? propertySchema.items
          : property,
        document,
        nextSeen
      ),
    };
  });
};

const contentSchema = content =>
  content?.["application/json"]?.schema ||
  content?.["application/octet-stream"]?.schema ||
  null;

const operationExample = (operation, document) => {
  const media = operation.requestBody?.content?.["application/json"];
  return (
    media?.example ??
    (media?.examples ? Object.values(media.examples)[0]?.value : undefined) ??
    schemaExample(media?.schema, document)
  );
};

const parameterDetails = (operation, pathItem, document) =>
  [...(pathItem.parameters || []), ...(operation.parameters || [])].map(
    parameter => ({
      name: parameter.name,
      location: parameter.in,
      required: Boolean(parameter.required),
      type: schemaType(parameter.schema, document),
      example: parameter.example ?? schemaExample(parameter.schema, document),
      description: parameter.description,
      constraints: schemaConstraints(resolveSchema(parameter.schema, document)),
    })
  );

const shellQuote = value => `'${String(value).replaceAll("'", "'\\''")}'`;

const endpointExamples = (
  route,
  method,
  parameters,
  requestExample,
  server
) => {
  const pathParameters = new Map(
    parameters
      .filter(parameter => parameter.location === "path")
      .map(parameter => [parameter.name, parameter.example])
  );
  const resolvedPath = route.replace(/\{([^}]+)\}/g, (_, name) =>
    encodeURIComponent(String(pathParameters.get(name) ?? `{${name}}`))
  );
  const query = parameters
    .filter(parameter => parameter.location === "query" && parameter.required)
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
        httpHeaders.map(line => {
          const separator = line.indexOf(":");
          return [line.slice(0, separator), line.slice(separator + 1).trim()];
        })
      ),
      body: requestExample ?? null,
    },
    null,
    2
  );
  return { curl, http, json };
};

const tagInfo = {
  "block-packs": [
    "Block Packs",
    "Create, read, move, restore, and update Block Pack resources.",
  ],
  blocks: ["Blocks", "Read blocks directly or by their containing Block Pack."],
  "root-shelves": [
    "Root Shelves",
    "CRUD, memberships, ownership, permissions, and recovery.",
  ],
  "routine-tags": ["Routine Tags", "Routine tag CRUD and permanent deletion."],
  "routine-task-dependencies": [
    "Routine Task Dependencies",
    "Read and manage the execution dependencies between routine tasks.",
  ],
  "routine-tasks": [
    "Routine Tasks",
    "Read and manage the steps that make up a routine.",
  ],
  routines: [
    "Routines",
    "Routine CRUD, linking, scheduling, and visualizations.",
  ],
  stations: [
    "Stations",
    "CRUD, memberships, permissions, ownership, and visualizations.",
  ],
  "sub-shelves": [
    "Sub Shelves",
    "CRUD, ordering, item traversal, and recovery.",
  ],
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
    left.operationId.localeCompare(right.operationId)
  );
};

const endpointGroups = (document, server) => {
  const groups = new Map();
  for (const [route, pathItem] of Object.entries(document.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!Object.hasOwn(methodOrder, method.toUpperCase())) continue;
      const name =
        typeof operation.summary === "string" ? operation.summary.trim() : "";
      const description =
        typeof operation.description === "string"
          ? operation.description.trim()
          : "";
      if (
        typeof operation.operationId !== "string" ||
        !operation.operationId.trim() ||
        !/^[A-Z][A-Za-z0-9]*$/.test(name) ||
        !description
      ) {
        throw new Error(
          `Cannot publish ${method.toUpperCase()} ${route}: a stable operationId, a BigCamelCase summary name, and a non-empty description are required. The existing generated output has not been changed.`
        );
      }
      const tag = operation.tags?.[0] || route.split("/")[1];
      const schema = contentSchema(operation.requestBody?.content);
      const responses = Object.entries(operation.responses || {})
        .filter(([status]) => !status.startsWith("x-"))
        .map(([status, response]) => {
          const schema = contentSchema(response.content);
          const media = response.content?.["application/json"];
          return {
            status,
            description:
              response.description === "Authentication or CSRF failed"
                ? "API key authentication failed"
                : response.description || "Response",
            hasBody: Object.keys(response.content || {}).length > 0,
            fields: schemaFields(schema, document),
            example:
              media?.example ??
              Object.values(media?.examples || {})[0]?.value ??
              schemaExample(schema, document),
          };
        });
      const parameters = parameterDetails(operation, pathItem, document);
      const security = operation.security ?? document.security ?? [];
      const schemes = Object.keys(security[0] ?? {});
      const scheme = document.components?.securitySchemes?.[schemes[0]];
      if (
        security.length !== 1 ||
        schemes.length !== 1 ||
        scheme?.type !== "apiKey" ||
        scheme.in !== "header" ||
        !scheme.name
      ) {
        throw new Error(
          `Cannot publish ${method.toUpperCase()} ${route}: an API-key header security requirement is required.`
        );
      }
      if (
        !parameters.some(
          parameter =>
            parameter.location === "header" &&
            parameter.name.toLowerCase() === scheme.name.toLowerCase()
        )
      ) {
        parameters.unshift({
          name: scheme.name,
          location: "header",
          required: true,
          type: "string",
          example: "<YOUR_API_KEY>",
        });
      }
      const requestExample = operationExample(operation, document);
      const endpoint = {
        method: method.toUpperCase(),
        path: route,
        operation: name,
        operationId: operation.operationId,
        description,
        parameters,
        requestExample,
        requestFields: schemaFields(schema, document),
        responses,
        examples: endpointExamples(
          route,
          method.toUpperCase(),
          parameters,
          requestExample,
          server
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

// shortcut: exclude known contributor notes until the backend publishes reviewed public-only rules; this is not a secret scanner.
const publicRuleText = text => {
  text = text
    .replace(
      "Keys can be expired or revoked; revoked keys fail immediately even if a cache entry exists.",
      "Keys can expire or be revoked. Revoke keys that are no longer needed."
    )
    .replace(
      "HTTPS is mandatory outside local development.",
      "Use HTTPS for all public API requests."
    )
    .replace(
      "Do not log request bodies containing credentials, `X-API-Key`, Cookie, Set-Cookie, or CSRF values.",
      "Do not log credentials or the `X-API-Key` header."
    )
    .replace(
      "Cross-origin browser access works only for origins configured in the APIGateway allowlist.",
      "Keep API-key integrations on a trusted server or CLI; do not expose the key in browser code."
    )
    .replace(
      "Never commit Postman environments after adding credentials.",
      "Never commit files containing credentials."
    );
  if (
    /Local base path:|server persists|cache entry|Unauthorized rate limits|x-go-|CLI and server clients should omit|outside local development|Treat all IDs and permissions|Public documentation does not itself|development namespace|changes must ship together|Compare generated OpenAPI/.test(
      text
    )
  )
    return "";
  return text
    .replace(/ An authenticated-user limiter exists internally[^.]*\./g, "")
    .replace(" with a 100 requests/second token bucket and burst 10", "")
    .replaceAll("IP/fingerprint", "IP address")
    .replaceAll("APIGateway", "Public API")
    .replaceAll(
      "authenticated ClientGateway flow",
      "API key area in Account settings"
    )
    .replaceAll("Repository release tags", "Product releases");
};

const markdownRules = directory =>
  ruleFiles.map(file => {
    const tokens = marked.lexer(
      fs.readFileSync(path.join(directory, `@${file}`), "utf8")
    );
    const title =
      tokens.find(token => token.type === "heading" && token.depth === 1)
        ?.text || file;
    const blocks = tokens.flatMap(token => {
      if (
        token.type === "space" ||
        (token.type === "heading" && token.depth === 1)
      )
        return [];
      if (token.type === "list") {
        const items = token.items
          .map(item => publicRuleText(item.text))
          .filter(Boolean);
        return items.length
          ? [{ type: "list", items, ordered: token.ordered }]
          : [];
      }
      const text = publicRuleText(token.text ?? token.raw);
      return text
        ? [{ type: token.type === "code" ? "code" : "paragraph", text }]
        : [];
    });
    return {
      id: file.replace(/\.md$/, ""),
      title,
      summary: blocks.find(block => block.type === "paragraph")?.text || title,
      blocks,
    };
  });

const gateway = JSON.parse(
  fs.readFileSync(path.join(contractRoot, "@openapi.json"), "utf8")
);
const productionServer = gateway.servers?.find(
  server =>
    server.description?.toLowerCase() === "production" &&
    server.url.startsWith("https://")
);
if (!productionServer)
  throw new Error(
    "The public contract must declare an HTTPS Production server. The existing output has not been changed."
  );
const publicApiBaseURL = productionServer.url.replace(/\/$/, "");
const gatewayEndpointData = endpointGroups(gateway, publicApiBaseURL);
const gatewayRuleData = markdownRules(contractRoot);
const responseSpecifications = [];
const responseIndexes = new Map();
const groupSources = gatewayEndpointData.map(({ endpoints, ...group }) => {
  const endpointSources = endpoints.map(({ responses, ...endpoint }) => {
    const references = responses.map(response => {
      const serialized = JSON.stringify(response);
      let index = responseIndexes.get(serialized);
      if (index === undefined) {
        index = responseSpecifications.length;
        responseIndexes.set(serialized, index);
        responseSpecifications.push(response);
      }
      return `responseSpecifications[${index}]`;
    });
    return `${JSON.stringify(endpoint, null, 2).slice(0, -2)},\n"responses": [${references.join(", ")}]\n}`;
  });
  return `${JSON.stringify(group, null, 2).slice(0, -2)},\n"endpoints": [${endpointSources.join(",\n")}]\n}`;
});
const result = `// Generated by scripts/generatePublicApiData.mjs. Do not edit by hand.\n\n${[
  "export type DocumentField = { name: string; type: string; required: boolean; description?: string; enum?: readonly unknown[]; example?: unknown; constraints?: readonly string[]; children?: DocumentField[] };",
  `export type DocumentParameter = { name: string; location: string; required: boolean; type: string; example?: unknown; description?: string; constraints?: readonly string[] };`,
  'export type DocumentRuleBlock = { type: "paragraph" | "code"; text: string } | { type: "list"; items: readonly string[]; ordered: boolean };',
  "export type DocumentRule = { id: string; title: string; summary: string; blocks: readonly DocumentRuleBlock[] };",
  "export type DocumentExamples = { curl: string; http: string; json: string };",
  "export type DocumentResponse = { status: string; description: string; hasBody: boolean; fields: DocumentField[]; example: unknown };",
  `export type DocumentEndpoint = { method: string; path: string; operation: string; operationId: string; description: string; parameters: DocumentParameter[]; requestExample: unknown; requestFields: DocumentField[]; responses: DocumentResponse[]; examples: DocumentExamples; tag: string };`,
  `export type DocumentEndpointGroup = { id: string; title: string; description: string; endpoints: DocumentEndpoint[] };`,
  `const responseSpecifications: DocumentResponse[] = ${JSON.stringify(responseSpecifications, null, 2)};`,
  `export const gatewayEndpointGroups: DocumentEndpointGroup[] = [${groupSources.join(",\n")}];`,
  `export const gatewayRules: DocumentRule[] = ${JSON.stringify(gatewayRuleData, null, 2)};`,
  `export const contractVersion = ${JSON.stringify(gateway.info.version)} as const;`,
  `export const publicApiBaseURL = ${JSON.stringify(publicApiBaseURL)} as const;`,
].join("\n\n")}\n`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, result);
console.log(
  `Generated ${output} from the local public API contract with ${gatewayEndpointData.reduce((count, group) => count + group.endpoints.length, 0)} operations.`
);
