import { expect, test } from "@playwright/test";
import { parse } from "graphql";
import { SearchRoutineRecordsDocument } from "../../../../shared/api/graphql/generated/graphql";

test("Apollo stores consecutive renewals before surfacing GraphQL errors", async ({
  page,
}) => {
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  const tokens: Array<string | undefined> = [];
  const connection = {
    searchEdges: [],
    searchPageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startEncodedSearchCursor: null,
      endEncodedSearchCursor: null,
    },
    totalCount: 0,
    searchTime: 0,
  };
  await page.route("**/graphql/", async route => {
    tokens.push(route.request().headers()["x-csrf-token"]);
    const index = tokens.length;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: index === 2 ? null : { searchRoutineRecords: connection },
        ...(index === 2 || index === 4
          ? {
              errors: [
                {
                  message: index === 2 ? "Invalid cursor" : "Partial result",
                  path: ["searchRoutineRecords"],
                  locations: [{ line: 1, column: 1 }],
                  extensions: {
                    reason:
                      index === 2 ? "CursorDecodeFailed" : "PartialFailure",
                    httpStatus: 400,
                  },
                },
              ],
            }
          : {}),
        ...([1, 2, 4].includes(index)
          ? { refreshableTokens: { newCSRFToken: `fixture-renewal-${index}` } }
          : {}),
      }),
    });
  });
  const result = await page.evaluate(async document => {
    sessionStorage.setItem(
      "notegic_CSRFToken",
      JSON.stringify("fixture-initial")
    );
    const path = "/src/api/apolloClient.ts";
    const { createApolloClient } = await import(/* @vite-ignore */ path);
    const client = createApolloClient();
    const states = [];
    try {
      for (let index = 1; index <= 5; index++) {
        let reason: string | undefined;
        let count: number | undefined;
        try {
          const result = await client.query({
            query: document,
            variables: { input: { query: "", routineIds: [], first: 1 } },
            fetchPolicy: "no-cache",
            errorPolicy: index === 4 ? "all" : "none",
          });
          count = result.data.searchRoutineRecords.totalCount;
          reason = result.error?.errors?.[0]?.extensions?.reason;
        } catch (error) {
          reason = (
            error as { errors?: Array<{ extensions?: { reason?: string } }> }
          ).errors?.[0]?.extensions?.reason;
        }
        states.push({
          reason,
          count,
          token: JSON.parse(sessionStorage.getItem("notegic_CSRFToken")!),
        });
      }
    } finally {
      client.stop();
    }
    return states;
  }, SearchRoutineRecordsDocument);
  expect(result).toEqual([
    { count: 0, token: "fixture-renewal-1" },
    { reason: "CursorDecodeFailed", token: "fixture-renewal-2" },
    { count: 0, token: "fixture-renewal-2" },
    { count: 0, reason: "PartialFailure", token: "fixture-renewal-4" },
    { count: 0, token: "fixture-renewal-4" },
  ]);
  expect(tokens).toEqual([
    "fixture-initial",
    "fixture-renewal-1",
    "fixture-renewal-2",
    "fixture-renewal-2",
    "fixture-renewal-4",
  ]);
});

test("Apollo preserves stored CSRF on malformed metadata and transport failures", async ({
  page,
}) => {
  test.skip(process.env.E2E_PRODUCTION === "true", "Uses Vite source imports");
  await page.goto("/document");
  await page.waitForLoadState("networkidle");
  const replies = [
    ...[
      undefined,
      null,
      {},
      { newCSRFToken: "" },
      { newCSRFToken: "  " },
      { newCSRFToken: 7 },
      { newCSRFToken: false },
    ].map(refreshableTokens => ({
      status: 200,
      body: JSON.stringify({
        data: { __typename: "Query" },
        refreshableTokens,
      }),
    })),
    ...[401, 403, 500].map(status => ({
      status,
      body: JSON.stringify({
        errors: [{ message: "Request rejected" }],
        refreshableTokens: { newCSRFToken: "fixture-rejected-token" },
      }),
    })),
    { status: 200, body: "{" },
    { status: 0, body: "" },
    { status: 200, body: JSON.stringify({ data: { __typename: "Query" } }) },
  ];
  const tokens: Array<string | undefined> = [];
  await page.route("**/graphql/", async route => {
    const reply = replies[tokens.length];
    tokens.push(route.request().headers()["x-csrf-token"]);
    if (reply.status === 0) await route.abort("failed");
    else
      await route.fulfill({
        status: reply.status,
        contentType: "application/json",
        body: reply.body,
      });
  });
  const states = await page.evaluate(
    async ({ document, rounds }) => {
      sessionStorage.setItem(
        "notegic_CSRFToken",
        JSON.stringify("fixture-retained")
      );
      const path = "/src/api/apolloClient.ts";
      const { createApolloClient } = await import(/* @vite-ignore */ path);
      const client = createApolloClient();
      const states = [];
      try {
        for (let index = 0; index < rounds; index++) {
          let failed = false;
          try {
            await client.query({ query: document, fetchPolicy: "no-cache" });
          } catch {
            failed = true;
          }
          states.push({
            failed,
            retained:
              JSON.parse(sessionStorage.getItem("notegic_CSRFToken")!) ===
              "fixture-retained",
          });
        }
      } finally {
        client.stop();
      }
      return states;
    },
    {
      document: parse("query SessionProbe { __typename }"),
      rounds: replies.length,
    }
  );
  expect(states.map(state => state.retained)).toEqual(replies.map(() => true));
  expect(states.map(state => state.failed)).toEqual([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);
  expect(tokens).toEqual(replies.map(() => "fixture-retained"));
});
