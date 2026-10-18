import { createRoot } from "react-dom/client";
import EndpointDetails from "@/pages/document/api-reference/EndpointDetails";
import type { DocumentEndpoint } from "@/pages/document/api-reference/generated/publicAPIData";

export const mountResponseExamples = () => {
  const container = document.createElement("div");
  container.id = "api-response-test-root";
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    zIndex: "1000",
    overflow: "auto",
  });
  document.body.append(container);
  const endpoint: DocumentEndpoint = {
    method: "POST",
    path: "/example",
    operation: "Example",
    operationId: "example",
    description: "Create an example resource.",
    tag: "root-shelves",
    parameters: [],
    requestExample: null,
    requestFields: [],
    responses: [
      {
        status: "200",
        description: "OK. [**Response guide**](/document#api-keys)",
        hasBody: true,
        example: { id: "existing" },
        fields: [{ name: "id", type: "string", required: true }],
      },
      {
        status: "201",
        description: "Created",
        hasBody: true,
        example: { id: "created" },
        fields: [{ name: "id", type: "string", required: true }],
      },
      {
        status: "204",
        description: "No content",
        hasBody: false,
        example: null,
        fields: [],
      },
      {
        status: "400",
        description: "Invalid request",
        hasBody: true,
        example: { reason: "InvalidInput" },
        fields: [{ name: "reason", type: "string", required: true }],
      },
    ],
    examples: {
      curl: `curl https://example.test/${"long-path-".repeat(90)}\n${Array.from({ length: 35 }, (_, index) => `# Example line ${index}`).join("\n")}`,
      http: "POST https://example.test/example\nContent-Type: application/json",
      json: "{}",
    },
  };
  createRoot(container).render(<EndpointDetails endpoint={endpoint} />);
};
