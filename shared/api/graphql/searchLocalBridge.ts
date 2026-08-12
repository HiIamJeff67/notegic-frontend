import { useLazyQuery, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { isNetworkFallbackError } from "./hooks/error";

type LocalSearchAdapter = {
  fieldName: string;
  sync: (data?: any) => Promise<void>;
  simulate: (input: any) => Promise<any>;
  signature: (data?: any) => string;
  syncErrorMessage: string;
  simulateErrorMessage: string;
};

export const useLocalSearchLazyQuery = <TData, TVariables extends object>(
  document: any,
  options: useLazyQuery.Options<TData, TVariables> | undefined,
  adapter: LocalSearchAdapter
): useLazyQuery.ResultTuple<TData, TVariables> => {
  const [execute, result] = useLazyQuery<TData, TVariables>(document, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
  const resultRef = useRef(result);
  resultRef.current = result;
  const latestSyncedSignatureRef = useRef<string>("");

  const syncOnce = useCallback(
    (data?: TData) => {
      const nextSignature = adapter.signature(data);
      if (nextSignature === latestSyncedSignatureRef.current) return;
      latestSyncedSignatureRef.current = nextSignature;
      void adapter
        .sync(data)
        .catch(error => console.error(adapter.syncErrorMessage, error));
    },
    [adapter]
  );

  const writeFallback = useCallback(
    async (variables?: TVariables) => {
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
        .then((queryResult: any) => {
          syncOnce(queryResult.data);
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
        syncOnce(fetchResult.data as TData);
        return fetchResult;
      } catch (error) {
        if (!isNetworkFallbackError(error)) throw error;
        return writeFallback(fetchMoreOptions.variables as TVariables);
      }
    }) as typeof result.fetchMore,
    [syncOnce, writeFallback]
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
  options: useQuery.Options<TData, TVariables> | undefined,
  adapter: LocalSearchAdapter
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
      return writeFallback(fetchMoreOptions.variables as TVariables);
    }
  }) as typeof queryResult.fetchMore;

  return useMemo(
    () => ({ ...queryResult, fetchMore: fetchMoreWithFallback }),
    [fetchMoreWithFallback, queryResult]
  );
};
