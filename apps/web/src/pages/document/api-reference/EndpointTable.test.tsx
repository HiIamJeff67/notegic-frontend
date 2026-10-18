import { renderToStaticMarkup } from "react-dom/server";
import EndpointTable from "./EndpointTable";
import type { DocumentEndpoint } from "./generated/publicAPIData";

jest.mock("@/components/commons/Article/Article", () =>
  jest.requireActual("@/components/commons/Article/ArticleInlineText")
);
jest.mock("./EndpointDetails", () => () => null);

const endpoint: DocumentEndpoint = {
  method: "GET",
  path: "/root-shelves",
  operation: "ListRootShelves",
  operationId: "listRootShelves",
  description: "List the root shelves you can access.",
  parameters: [],
  requestExample: null,
  requestFields: [],
  responses: [],
  examples: { curl: "", http: "", json: "" },
  tag: "root-shelves",
};

test("operation names and descriptions render in separate cells without a duplicate summary", () => {
  const markup = renderToStaticMarkup(<EndpointTable endpoints={[endpoint]} />);
  const cells = markup.match(/<td\b[^>]*>.*?<\/td>/g)!;

  expect(cells).toHaveLength(6);
  expect(markup).toContain(">Description</th>");
  expect(markup).toContain(">Operation</th>");
  expect(cells[2].replace(/<[^>]*>/g, "")).toBe("ListRootShelves");
  expect(cells[3].replace(/<[^>]*>/g, "")).toBe(endpoint.description);
  expect(cells[2]).toContain('data-article-operation="listRootShelves"');
});

test.each([
  "ListRootShelves",
  "BrowseAccessibleShelves",
  "GetAPIKeyByID",
])("backend name %s displays unchanged without deriving it from the identifier", operation => {
  const markup = renderToStaticMarkup(
    <EndpointTable endpoints={[{ ...endpoint, operation }]} />
  );
  const cell = markup.match(/<td data-article-operation=.*?<\/td>/)![0];
  expect(cell.replace(/<[^>]*>/g, "")).toBe(operation);
  expect(cell).toContain(`data-article-operation="${endpoint.operationId}"`);
});

test("description text stays escaped while inline code is preserved", () => {
  const markup = renderToStaticMarkup(
    <EndpointTable
      endpoints={[
        { ...endpoint, description: "Read `<script>alert(1)</script>`." },
      ]}
    />
  );
  expect(markup).toContain("&lt;script&gt;alert(1)&lt;/script&gt;</code>");
  expect(markup).not.toContain("<script>");
});
