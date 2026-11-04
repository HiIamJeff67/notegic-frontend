import { QueryClient, QueryObserver } from "@tanstack/react-query";
import type { UUID } from "crypto";
import { queryKeys } from "@shared/api/queryKeys";
import { invalidateDeletedResources } from "./availablity.policy";

const id = "12345678-1234-4234-8234-123456789abc" as UUID;
let client: QueryClient;
beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
});
afterEach(() => client.clear());

test.each([
  queryKeys.blockPack.oneById(id),
  queryKeys.material.oneById(id, true),
  queryKeys.routine.oneById(id),
  queryKeys.routineTask.oneById(id),
])("confirmed deletion notifies an open observer without discarding other resources: %j", async (...key) => {
  const response = { success: true, data: { id, name: "Original" } };
  const unrelated = ["unrelated"];
  client.setQueryData(key, response);
  client.setQueryData(unrelated, response);
  const read = jest.fn(async () => response);
  const observer = new QueryObserver(client, {
    queryKey: key,
    queryFn: read,
    staleTime: Infinity,
  });
  const changes: unknown[] = [];
  const unsubscribe = observer.subscribe(result => changes.push(result.data));
  await invalidateDeletedResources(client, [key]);
  expect(observer.getCurrentResult().data).toEqual({
    success: true,
    data: null,
  });
  expect(read).not.toHaveBeenCalled();
  expect(client.getQueryData(unrelated)).toBe(response);
  expect(changes).toContainEqual({ success: true, data: null });
  // Restore refetches through the same observer rather than a forced remount.
  await client.invalidateQueries({ queryKey: key });
  expect(observer.getCurrentResult().data).toEqual(response);
  unsubscribe();
});

test("material deletion includes both detail variants and cancels a stale pending read", async () => {
  const plain = queryKeys.material.oneById(id);
  const parent = queryKeys.material.oneById(id, true);
  client.setQueryData(plain, { data: { id } });
  client.setQueryData(parent, { data: { id } });
  let release!: (value: { data: { id: UUID } }) => void;
  const pending = client
    .fetchQuery({
      queryKey: parent,
      queryFn: () =>
        new Promise(resolve => {
          release = resolve;
        }),
    })
    .catch(() => undefined);
  await invalidateDeletedResources(client, [queryKeys.material.byId(id)]);
  release({ data: { id } });
  await pending;
  expect(client.getQueryData(parent)).toEqual({ data: null });
  expect(client.getQueryData(plain)).toEqual({ data: null });
});

test("deletion during the first read publishes absence before any detail was cached", async () => {
  const key = queryKeys.routineTask.oneById(id);
  let release!: (value: unknown) => void;
  const observer = new QueryObserver(client, {
    queryKey: key,
    queryFn: () =>
      new Promise(resolve => {
        release = resolve;
      }),
  });
  const unsubscribe = observer.subscribe(() => {});
  await invalidateDeletedResources(client, [key]);
  expect(observer.getCurrentResult().data).toMatchObject({ data: null });
  release({ data: { id } });
  await Promise.resolve();
  expect(observer.getCurrentResult().data).toMatchObject({ data: null });
  unsubscribe();
});
