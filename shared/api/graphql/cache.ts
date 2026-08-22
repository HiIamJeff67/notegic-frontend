import type { useApolloClient } from "@apollo/client/react";
import { FragmentedBasicPrivateSearchableRoutineFragmentDoc } from "@shared/api/graphql/generated/graphql";

type ApolloClient = ReturnType<typeof useApolloClient>;

export const upsertSearchRoutineTask = (
  apolloClient: ApolloClient,
  routineTask: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = JSON.parse(
          storeFieldName.slice(storeFieldName.indexOf("(") + 1, -1)
        ).input;
        if (input.after) return existing;
        const query = input.query.trim().toLowerCase();
        if (
          (query && !routineTask.title.toLowerCase().includes(query)) ||
          (input.routineIds.length > 0 &&
            !input.routineIds.includes(routineTask.routineId))
        ) {
          return existing;
        }

        const existed = existing.searchEdges.some(
          (edge: any) => readField("id", edge.node) === routineTask.id
        );
        const edges = existing.searchEdges.filter(
          (edge: any) => readField("id", edge.node) !== routineTask.id
        );
        const nextEdges = [
          {
            __typename: "SearchRoutineTaskEdge",
            encodedSearchCursor: routineTask.id,
            node: routineTask,
          },
          ...edges,
        ];
        return {
          ...existing,
          totalCount: existed
            ? (existing.totalCount ?? nextEdges.length)
            : Math.max(existing.totalCount ?? 0, edges.length) + 1,
          searchEdges: nextEdges,
        };
      },
    },
  });
};

export const patchSearchRoutineTask = (
  apolloClient: ApolloClient,
  routineTaskId: string,
  patch: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = JSON.parse(
          storeFieldName.slice(storeFieldName.indexOf("(") + 1, -1)
        ).input;
        const query = input.query.trim().toLowerCase();
        const nextEdges = existing.searchEdges.flatMap((edge: any) => {
          if (readField("id", edge.node) !== routineTaskId) return [edge];
          const node = {
            ...edge.node,
            id: routineTaskId,
            routineId: readField("routineId", edge.node),
            title: readField("title", edge.node),
            ...patch,
          };
          return query && !node.title.toLowerCase().includes(query)
            ? []
            : input.routineIds.length > 0 &&
                !input.routineIds.includes(node.routineId)
              ? []
              : [{ ...edge, node }];
        });
        return {
          ...existing,
          totalCount: Math.max(
            0,
            (existing.totalCount ?? nextEdges.length) -
              (existing.searchEdges.length - nextEdges.length)
          ),
          searchEdges: nextEdges,
        };
      },
    },
  });
};

export const removeSearchRoutineTasks = (
  apolloClient: ApolloClient,
  routineTaskIds: string[]
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField }) {
        if (!existing?.searchEdges) return existing;
        const nextEdges = existing.searchEdges.filter(
          (edge: any) =>
            !routineTaskIds.includes(readField("id", edge.node) as string)
        );
        return {
          ...existing,
          totalCount: Math.max(
            0,
            (existing.totalCount ?? nextEdges.length) -
              (existing.searchEdges.length - nextEdges.length)
          ),
          searchEdges: nextEdges,
        };
      },
    },
  });
};

export const upsertSearchRoutine = (
  apolloClient: ApolloClient,
  routine: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = JSON.parse(
          storeFieldName.slice(storeFieldName.indexOf("(") + 1, -1)
        ).input;
        if (input.after) return existing;
        const query = input.query.trim().toLowerCase();
        if (
          (query && !routine.title.toLowerCase().includes(query)) ||
          (input.stationIds.length > 0 &&
            !input.stationIds.includes(routine.stationId)) ||
          (input.tagIds.length > 0 &&
            !input.tagIds.some((tagId: string) =>
              routine.tagIds.includes(tagId)
            ))
        ) {
          return existing;
        }

        const existed = existing.searchEdges.some(
          (edge: any) => readField("id", edge.node) === routine.id
        );
        const edges = existing.searchEdges.filter(
          (edge: any) => readField("id", edge.node) !== routine.id
        );
        const nextEdges = [
          {
            __typename: "SearchRoutineEdge",
            encodedSearchCursor: routine.id,
            node: routine,
          },
          ...edges,
        ];
        return {
          ...existing,
          totalCount: existed
            ? (existing.totalCount ?? nextEdges.length)
            : Math.max(existing.totalCount ?? 0, edges.length) + 1,
          searchEdges: nextEdges,
        };
      },
    },
  });
};

export const patchSearchRoutine = (
  apolloClient: ApolloClient,
  routineId: string,
  patch: any
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField, storeFieldName }) {
        if (!existing?.searchEdges) return existing;
        const input = JSON.parse(
          storeFieldName.slice(storeFieldName.indexOf("(") + 1, -1)
        ).input;
        const query = input.query.trim().toLowerCase();
        const nextEdges = existing.searchEdges.flatMap((edge: any) => {
          if (readField("id", edge.node) !== routineId) return [edge];
          const node = {
            ...edge.node,
            id: routineId,
            stationId: readField("stationId", edge.node),
            title: readField("title", edge.node),
            tagIds: (readField("tagIds", edge.node) as string[]) ?? [],
            ...patch,
          };
          return query && !node.title.toLowerCase().includes(query)
            ? []
            : input.stationIds.length > 0 &&
                !input.stationIds.includes(node.stationId)
              ? []
              : input.tagIds.length > 0 &&
                  !input.tagIds.some((tagId: string) =>
                    node.tagIds.includes(tagId)
                  )
                ? []
                : [{ ...edge, node }];
        });
        return {
          ...existing,
          totalCount: Math.max(
            0,
            (existing.totalCount ?? nextEdges.length) -
              (existing.searchEdges.length - nextEdges.length)
          ),
          searchEdges: nextEdges,
        };
      },
    },
  });
};

export const patchSearchRoutineIdList = (
  apolloClient: ApolloClient,
  routineId: string,
  fieldName: "tagIds" | "taskIds" | "itemIds",
  value: string,
  isRemove: boolean
) => {
  const cachedRoutine = apolloClient.cache.readFragment<any>({
    id: apolloClient.cache.identify({
      __typename: "PrivateSearchableRoutine",
      id: routineId,
    }),
    fragment: FragmentedBasicPrivateSearchableRoutineFragmentDoc,
  });
  const currentIds = (cachedRoutine?.[fieldName] as string[] | undefined) ?? [];
  const nextIds = isRemove
    ? currentIds.filter(id => id !== value)
    : Array.from(new Set([...currentIds, value]));
  const patchedRoutine = cachedRoutine
    ? { ...cachedRoutine, [fieldName]: nextIds }
    : null;

  const cacheId = apolloClient.cache.identify({
    __typename: "PrivateSearchableRoutine",
    id: routineId,
  });
  if (cacheId) {
    apolloClient.cache.modify({
      id: cacheId,
      fields: {
        [fieldName](existing: any = []) {
          return isRemove
            ? existing.filter((id: string) => id !== value)
            : Array.from(new Set([...existing, value]));
        },
      },
    });
  }

  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField, storeFieldName, toReference }) {
        if (!existing?.searchEdges) return existing;
        const input = JSON.parse(
          storeFieldName.slice(storeFieldName.indexOf("(") + 1, -1)
        ).input;
        const query = input.query.trim().toLowerCase();
        let existed = false;
        const nextEdges = existing.searchEdges.flatMap((edge: any) => {
          if (readField("id", edge.node) !== routineId) return [edge];
          existed = true;
          const current = (readField(fieldName, edge.node) as string[]) ?? [];
          const node = patchedRoutine ?? {
            ...edge.node,
            id: routineId,
            stationId: readField("stationId", edge.node),
            title: readField("title", edge.node),
            tagIds:
              fieldName === "tagIds"
                ? isRemove
                  ? current.filter(id => id !== value)
                  : Array.from(new Set([...current, value]))
                : ((readField("tagIds", edge.node) as string[]) ?? []),
          };
          return query && !node.title.toLowerCase().includes(query)
            ? []
            : input.stationIds.length > 0 &&
                !input.stationIds.includes(node.stationId)
              ? []
              : input.tagIds.length > 0 &&
                  !input.tagIds.some((tagId: string) =>
                    node.tagIds.includes(tagId)
                  )
                ? []
                : [
                    {
                      ...edge,
                      node: patchedRoutine
                        ? (toReference(patchedRoutine, true) ?? patchedRoutine)
                        : node,
                    },
                  ];
        });
        if (
          !existed &&
          patchedRoutine &&
          (!query || patchedRoutine.title.toLowerCase().includes(query)) &&
          (input.stationIds.length === 0 ||
            input.stationIds.includes(patchedRoutine.stationId)) &&
          (input.tagIds.length === 0 ||
            input.tagIds.some((tagId: string) =>
              patchedRoutine.tagIds.includes(tagId)
            ))
        ) {
          nextEdges.unshift({
            __typename: "SearchRoutineEdge",
            encodedSearchCursor: routineId,
            node: toReference(patchedRoutine, true) ?? patchedRoutine,
          });
        }
        return {
          ...existing,
          totalCount:
            (existing.totalCount ?? existing.searchEdges.length) +
            nextEdges.length -
            existing.searchEdges.length,
          searchEdges: nextEdges,
        };
      },
    },
  });
};

export const patchSearchRoutineTaskRoutineIds = (
  apolloClient: ApolloClient,
  routineTaskId: string,
  routineId: string,
  isRemove: boolean
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutineTasks(existing, { readField }) {
        if (!existing?.searchEdges) return existing;
        return {
          ...existing,
          searchEdges: existing.searchEdges.map((edge: any) => {
            if (readField("id", edge.node) !== routineTaskId) return edge;
            const current =
              (readField("routineIds", edge.node) as string[]) ?? [];
            const routineIds = isRemove
              ? current.filter(id => id !== routineId)
              : Array.from(new Set([...current, routineId]));
            return { ...edge, node: { ...edge.node, routineIds } };
          }),
        };
      },
    },
  });
};

export const removeSearchRoutines = (
  apolloClient: ApolloClient,
  routineIds: string[]
) => {
  apolloClient.cache.modify({
    fields: {
      searchRoutines(existing, { readField }) {
        if (!existing?.searchEdges) return existing;
        const nextEdges = existing.searchEdges.filter(
          (edge: any) =>
            !routineIds.includes(readField("id", edge.node) as string)
        );
        return {
          ...existing,
          totalCount: Math.max(
            0,
            (existing.totalCount ?? nextEdges.length) -
              (existing.searchEdges.length - nextEdges.length)
          ),
          searchEdges: nextEdges,
        };
      },
    },
  });
};
