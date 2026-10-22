import { useLazyQuery, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { isLocalPreferenceEnabled } from "@/api/local/policy";
import { isNetworkFallbackError } from "@/api/graphql/hooks/error";
import type { SearchLocalAdapter } from "../adapters/searchLocal.adapter";

export const useLocalSearchLazyQuery = <TData, TVariables extends object>(
  document: any,
  options: useLazyQuery.Options<TData, TVariables> | undefined,
  adapter: SearchLocalAdapter
): useLazyQuery.ResultTuple<TData, TVariables> => {
  const [execute, result] = useLazyQuery<TData, TVariables>(document, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
  const resultRef = useRef(result);
  resultRef.current = result;
  const latestSyncedSignatureRef = useRef<string>("");

  const syncOnce = useCallback(
    async (data?: TData): Promise<void> => {
      const nextSignature = adapter.signature(data);
      if (nextSignature === latestSyncedSignatureRef.current) return;
      await adapter.sync(data);
      latestSyncedSignatureRef.current = nextSignature;
    },
    [adapter]
  );

  const writeFallback = useCallback(
    async (variables?: TVariables) => {
      if (!isLocalPreferenceEnabled("localVault")) {
        throw new Error("Local database is disabled.");
      }
      const input = (variables as any)?.input;
      if (input === undefined) throw new Error("missing search input");
      const fallback = await adapter.simulate(input);
      const data = { __typename: "Query", [adapter.fieldName]: fallback };
      resultRef.current.client.writeQuery({ query: document, variables, data });
      return { data } as any;
    },
    [adapter, document]
  );

  const executeWithSync = useCallback(
    ((...args: any[]) => {
      const executeOptions = args[0];
      const queryPromise = (execute as any)(...args);
      const handledPromise = queryPromise
        .then(async (queryResult: any) => {
          await syncOnce(queryResult.data);
          return queryResult;
        })
        .catch(async (error: unknown) => {
          if (!isNetworkFallbackError(error)) throw error;
          return writeFallback(
            (executeOptions?.variables as TVariables | undefined) ??
              (resultRef.current.variables as TVariables | undefined)
          );
        }) as ReturnType<typeof execute>;

      handledPromise.retain = () => {
        queryPromise.retain();
        return handledPromise;
      };
      return handledPromise;
    }) as typeof execute,
    [execute, syncOnce, writeFallback]
  );

  const fetchMoreWithFallback = useCallback(
    (async fetchMoreOptions => {
      try {
        const fetchResult = await resultRef.current.fetchMore(fetchMoreOptions);
        await syncOnce(fetchResult.data as TData);
        return fetchResult;
      } catch (error) {
        if (!isNetworkFallbackError(error)) throw error;
        const current = resultRef.current;
        const variables = {
          ...current.variables,
          ...fetchMoreOptions.variables,
          input: {
            ...(current.variables as any)?.input,
            ...(fetchMoreOptions.variables as any)?.input,
          },
        } as TVariables;
        const fallback = await writeFallback(variables);
        if (fetchMoreOptions.updateQuery && current.data) {
          const data = fetchMoreOptions.updateQuery(current.data, {
            fetchMoreResult: fallback.data,
            variables,
          } as any);
          current.client.writeQuery({
            query: document,
            variables: current.variables,
            data,
          });
        }
        return fallback;
      }
    }) as typeof result.fetchMore,
    [document, syncOnce, writeFallback]
  );

  return [
    executeWithSync,
    useMemo(
      () => ({ ...result, fetchMore: fetchMoreWithFallback }),
      [fetchMoreWithFallback, result]
    ),
  ];
};

export const useLocalSearchQuery = <TData, TVariables extends object>(
  document: any,
  variables: TVariables,
  options: Omit<useQuery.Options<TData, TVariables>, "variables"> | undefined,
  adapter: SearchLocalAdapter
) => {
  const queryResult = useQuery<TData, TVariables>(document, {
    variables,
    notifyOnNetworkStatusChange: true,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");
  const latestFallbackKeyRef = useRef<string>("");

  const syncOnce = (data?: TData) => {
    const nextSignature = adapter.signature(data);
    if (nextSignature === latestSyncedSignatureRef.current) return;
    latestSyncedSignatureRef.current = nextSignature;
    void adapter
      .sync(data)
      .catch(error => console.error(adapter.syncErrorMessage, error));
  };

  const writeFallback = async (fallbackVariables?: TVariables) => {
    if (!isLocalPreferenceEnabled("localVault")) {
      throw new Error("Local database is disabled.");
    }
    const input = (fallbackVariables as any)?.input;
    if (input === undefined) throw new Error("missing search input");
    const fallback = await adapter.simulate(input);
    const data = { __typename: "Query", [adapter.fieldName]: fallback };
    queryResult.client.writeQuery({
      query: document,
      variables: fallbackVariables,
      data,
    });
    return { data } as any;
  };

  useEffect(() => {
    syncOnce(queryResult.data);
  }, [queryResult.data]);

  useEffect(() => {
    if (queryResult.error === undefined) return;
    if (!isNetworkFallbackError(queryResult.error)) return;

    const fallbackVariables =
      (queryResult.variables as TVariables | undefined) ?? variables;
    const fallbackKey = JSON.stringify((fallbackVariables as any)?.input);
    if (fallbackKey === latestFallbackKeyRef.current) return;
    latestFallbackKeyRef.current = fallbackKey;

    let cancelled = false;
    void writeFallback(fallbackVariables)
      .then(() => {
        if (cancelled) return;
      })
      .catch(error => console.error(adapter.simulateErrorMessage, error));
    return () => {
      cancelled = true;
    };
  }, [queryResult.client, queryResult.error, queryResult.variables, variables]);

  const fetchMoreWithFallback = (async fetchMoreOptions => {
    try {
      const fetchResult = await queryResult.fetchMore(fetchMoreOptions);
      syncOnce(fetchResult.data as TData);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;
      const fallbackVariables = {
        ...queryResult.variables,
        ...fetchMoreOptions.variables,
        input: {
          ...(queryResult.variables as any)?.input,
          ...(fetchMoreOptions.variables as any)?.input,
        },
      } as TVariables;
      const fallback = await writeFallback(fallbackVariables);
      if (fetchMoreOptions.updateQuery && queryResult.data) {
        const data = fetchMoreOptions.updateQuery(queryResult.data, {
          fetchMoreResult: fallback.data,
          variables: fallbackVariables,
        } as any);
        queryResult.client.writeQuery({
          query: document,
          variables: queryResult.variables,
          data,
        });
      }
      return fallback;
    }
  }) as typeof queryResult.fetchMore;

  return useMemo(
    () => ({ ...queryResult, fetchMore: fetchMoreWithFallback }),
    [fetchMoreWithFallback, queryResult]
  );
};
