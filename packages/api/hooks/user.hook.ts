import { NotegicAPIError } from "@shared/api/exceptions";
import { NotegicFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotegicLocalDatabaseError } from "@shared/api/exceptions/errors/localDatabase.error";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import type { UpdateMeRequest } from "@shared/api/interfaces/user.interface";
import {
  mutationFnUpdateMe,
  queryFnGetMe,
  queryFnGetUserData,
} from "@shared/api/invokers/user.invoker";
import type { Client } from "@shared/api/local/client";
import type { UpsertLoggedInUserInput } from "@shared/api/local/repositories/inputs/user.input";
import { UserRepository } from "@shared/api/local/repositories/user.repository";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useUpsertLoggedInUser = (
  client: Client,
  input: UpsertLoggedInUserInput
) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void UserRepository.UpsertLoggedIn(client, input).then(
      () => {
        if (!cancelled) setReady(true);
      },
      () => undefined
    );
    return () => {
      cancelled = true;
    };
  }, [client, input.displayName, input.email, input.name, input.publicId]);
  return ready;
};

const kept = (error: unknown) =>
  error instanceof NotegicAPIError ||
  error instanceof NotegicFetchError ||
  error instanceof NotegicValidationError ||
  error instanceof NotegicLocalDatabaseError;

export const useGetMe = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetMe>[1],
  request: Parameters<typeof queryFnGetMe>[0]
) => {
  const queryClient = getQueryClient();
  const query = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => UserRepository.GetLoggedIn(client),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetMe(request, func);
        const written = await UserRepository.UpsertLoggedIn(client, {
          publicId: response.data.publicId,
          name: response.data.name,
          displayName: response.data.displayName,
          email: response.data.email,
        });
        if (!written.changed || cancelled) return;
        const account = await UserRepository.GetLoggedIn(client);
        if (!cancelled) queryClient.setQueryData(queryKeys.user.me(), account);
      } catch (error) {
        if (kept(error)) return;
        throw error;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, func, online, queryClient, request]);

  return query;
};

export const useGetUserData = (
  client: Client,
  online: () => Promise<boolean>,
  func: Parameters<typeof queryFnGetUserData>[1],
  request: Parameters<typeof queryFnGetUserData>[0]
) => {
  const queryClient = getQueryClient();
  const query = useQuery({
    queryKey: queryKeys.user.data(),
    queryFn: () => UserRepository.GetLoggedIn(client),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (!(await online())) return;
        const response = await queryFnGetUserData(request, func);
        const written = await UserRepository.UpsertLoggedIn(client, {
          publicId: response.data.publicId,
          name: response.data.name,
          displayName: response.data.displayName,
          email: response.data.email,
        });
        if (!written.changed || cancelled) return;
        const account = await UserRepository.GetLoggedIn(client);
        if (!cancelled)
          queryClient.setQueryData(queryKeys.user.data(), account);
      } catch (error) {
        if (kept(error)) return;
        throw error;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, func, online, queryClient, request]);

  return query;
};

export const useUpdateMe = (
  client: Client,
  func: Parameters<typeof mutationFnUpdateMe>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: UpdateMeRequest) => mutationFnUpdateMe(request, func),
    onSuccess: async (_response, request) => {
      const displayName = request.body.values.displayName;
      if (displayName === undefined) return;
      const current = await UserRepository.GetLoggedIn(client);
      if (!current) return;
      const written = await UserRepository.UpsertLoggedIn(client, {
        ...current,
        displayName,
      });
      if (!written.changed) return;
      const account = await UserRepository.GetLoggedIn(client);
      queryClient.setQueryData(queryKeys.user.me(), account);
      queryClient.setQueryData(queryKeys.user.data(), account);
    },
  });
};
