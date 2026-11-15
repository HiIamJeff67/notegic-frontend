import type { QueryClient, QueryKey } from "@tanstack/react-query";

// A confirmed deletion must notify open editors even when no refetch can run.
// Keep the query and its observer so Restore can make the resource available again.
export async function invalidateDeletedResources(
  client: QueryClient,
  keys: readonly QueryKey[]
): Promise<void> {
  await Promise.all(keys.map(queryKey => client.cancelQueries({ queryKey })));
  for (const queryKey of keys) {
    client.setQueriesData({ queryKey }, (cached: unknown) =>
      cached !== null && typeof cached === "object" && "data" in cached
        ? { ...cached, data: null }
        : cached === undefined
          ? {
              success: true,
              data: null,
              exception: null,
              embedded: { publicId: "" },
            }
          : cached
    );
    await client.invalidateQueries({ queryKey, refetchType: "none" });
  }
}
