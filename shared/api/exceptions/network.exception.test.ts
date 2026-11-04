import { ServerError } from "@apollo/client/errors";
import { NetworkExceptions } from "./network.exception";

test.each([502, 503, 504])("gateway HTTP %s permits local fallback", status => {
  const error = new ServerError(
    `Response not successful: Received status code ${status}`,
    {
      response: new Response("Gateway unavailable", { status }),
      bodyText: "Gateway unavailable",
    }
  );
  expect(NetworkExceptions.isNetworkFallbackError(error)).toBe(true);
  expect(
    NetworkExceptions.isNetworkFallbackError({ networkError: error })
  ).toBe(true);
});

test.each([
  400, 401, 403, 404, 409, 422, 500,
])("HTTP %s retains its error instead of using cached data", status => {
  const error = new ServerError("Request rejected", {
    response: new Response("Rejected", { status }),
    bodyText: "Rejected",
  });
  expect(NetworkExceptions.isNetworkFallbackError(error)).toBe(false);
  expect(
    NetworkExceptions.isNetworkFallbackError({ networkError: error })
  ).toBe(false);
});

test("a failed fetch permits fallback while cancellation does not", () => {
  expect(
    NetworkExceptions.isNetworkFallbackError(new TypeError("Failed to fetch"))
  ).toBe(true);
  expect(
    NetworkExceptions.isNetworkFallbackError(
      new DOMException("Cancelled", "AbortError")
    )
  ).toBe(false);
});
