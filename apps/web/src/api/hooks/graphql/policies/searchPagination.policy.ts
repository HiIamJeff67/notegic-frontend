import type { FieldPolicy, Reference, StoreObject } from "@apollo/client";
import { searchContext } from "@shared/lib/search/searchPage";

export const readSearchFieldInput = (storeFieldName: string) =>
  JSON.parse(storeFieldName.slice(storeFieldName.indexOf(":") + 1)).input;

export const searchFieldKey = (
  fieldName: string,
  args: Record<string, any> | null | undefined
): Record<string, unknown> => {
  const input = args?.input ?? {};
  const context = searchContext(fieldName, {
    ...input,
    query: typeof input.query === "string" ? input.query : "",
  });
  return {
    ...context.filters,
    sortBy: context.sortBy,
    sortOrder: context.sortOrder,
  };
};

export const searchPaginationPolicy: FieldPolicy = {
  keyArgs(args, { fieldName }) {
    return JSON.stringify({ input: searchFieldKey(fieldName, args) });
  },
  merge(existing, incoming, { args, readField }) {
    if (!incoming) return existing;
    if (!Array.isArray(incoming.searchEdges)) return incoming;
    const edges = new Map();
    const appending = Boolean(
      args?.input?.after && existing?.searchEdges?.length
    );
    const pages = appending ? [existing, incoming] : [incoming];
    for (const page of pages) {
      for (const edge of page.searchEdges ?? []) {
        const node = edge.node as Reference | StoreObject;
        const id = node
          ? (readField("id", node) ?? readField("publicId", node))
          : undefined;
        const identity =
          id === undefined
            ? edge.encodedSearchCursor
            : JSON.stringify([
                readField("__typename", node),
                id,
                readField("type", node),
              ]);
        edges.set(identity, edge);
      }
    }
    const searchEdges = [...edges.values()];
    const firstCursor = searchEdges[0]?.encodedSearchCursor ?? null;
    const includesPreviousStart =
      firstCursor !== null &&
      firstCursor === existing?.searchPageInfo?.startEncodedSearchCursor;
    return {
      ...incoming,
      searchEdges,
      totalCount: searchEdges.length,
      searchPageInfo: {
        ...incoming.searchPageInfo,
        startEncodedSearchCursor: firstCursor,
        endEncodedSearchCursor:
          incoming.searchPageInfo?.endEncodedSearchCursor ??
          searchEdges.at(-1)?.encodedSearchCursor ??
          null,
        hasPreviousPage:
          appending || includesPreviousStart
            ? (existing?.searchPageInfo?.hasPreviousPage ??
              incoming.searchPageInfo?.hasPreviousPage)
            : incoming.searchPageInfo?.hasPreviousPage,
      },
    };
  },
};
