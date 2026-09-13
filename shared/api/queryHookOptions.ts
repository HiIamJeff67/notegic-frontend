import { FetchQueryOptions, UseQueryOptions } from "@tanstack/react-query";

export const PresignedObjectURLStaleTime = 5 * 60 * 1000;

// ! Do NOT directly expand this in the prefetchQuery as the default FetchQueryOptions
export const PrefetchQueryDefaultOptions: Partial<
  FetchQueryOptions<any, Error>
> = {
  staleTime: (6 * 60 * 60 * 1000) as number,
};

// ! Do NOT directly expand this in the useQuery as the default UseQueryOptions
export const UseQueryDefaultOptions: Partial<UseQueryOptions<any, Error>> = {
  staleTime: (6 * 60 * 60 * 1000) as number,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

// ! Do NOT directly expand this in the queryAsync as the default FetchQueryOptions
export const QueryAsyncDefaultOptions: Partial<FetchQueryOptions<any, Error>> =
  {
    staleTime: (6 * 60 * 60 * 1000) as number,
  };
