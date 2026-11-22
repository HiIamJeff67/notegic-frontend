import type {
  BindDiscordAccountRequest,
  BindGithubAccountRequest,
  BindGoogleAccountRequest,
  BindXAccountRequest,
  GetMyAccountResponse,
  PrepareOAuthOperationRequest,
  UnbindDiscordAccountRequest,
  UnbindGithubAccountRequest,
  UnbindGoogleAccountRequest,
  UnbindXAccountRequest,
  UpdateMyAccountRequest,
} from "@shared/api/interfaces/userAccount.interface";
import { PrepareOAuthOperationRequestSchema } from "@shared/api/interfaces/userAccount.interface";
import {
  mutationFnBindDiscordAccount,
  mutationFnBindGithubAccount,
  mutationFnBindGoogleAccount,
  mutationFnBindXAccount,
  mutationFnUnbindDiscordAccount,
  mutationFnUnbindGithubAccount,
  mutationFnUnbindGoogleAccount,
  mutationFnUnbindXAccount,
  mutationFnUpdateMyAccount,
  queryFnGetMyAccount,
} from "@shared/api/invokers/userAccount.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { parse } from "@shared/api/validation";
import { useMutation, useQuery } from "@tanstack/react-query";

const refreshAccount = () => {
  void getQueryClient().invalidateQueries({
    queryKey: queryKeys.userAccount.all(),
  });
};

export const usePrepareOAuthOperation = (
  func: (request: PrepareOAuthOperationRequest) => Promise<unknown>
) =>
  useMutation({
    mutationFn: (request: PrepareOAuthOperationRequest) =>
      func(parse(PrepareOAuthOperationRequestSchema, request)),
  });

export const useGetMyAccount = (
  func: Parameters<typeof queryFnGetMyAccount>[0]
) =>
  useQuery<GetMyAccountResponse, Error>({
    queryKey: queryKeys.userAccount.my(),
    queryFn: () => queryFnGetMyAccount(func),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

export const useUpdateMyAccount = (
  func: Parameters<typeof mutationFnUpdateMyAccount>[1]
) =>
  useMutation({
    mutationFn: (request: UpdateMyAccountRequest) =>
      mutationFnUpdateMyAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useBindGoogleAccount = (
  func: Parameters<typeof mutationFnBindGoogleAccount>[1]
) =>
  useMutation({
    mutationFn: (request: BindGoogleAccountRequest) =>
      mutationFnBindGoogleAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useBindGithubAccount = (
  func: Parameters<typeof mutationFnBindGithubAccount>[1]
) =>
  useMutation({
    mutationFn: (request: BindGithubAccountRequest) =>
      mutationFnBindGithubAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useBindXAccount = (
  func: Parameters<typeof mutationFnBindXAccount>[1]
) =>
  useMutation({
    mutationFn: (request: BindXAccountRequest) =>
      mutationFnBindXAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useBindDiscordAccount = (
  func: Parameters<typeof mutationFnBindDiscordAccount>[1]
) =>
  useMutation({
    mutationFn: (request: BindDiscordAccountRequest) =>
      mutationFnBindDiscordAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useUnbindGoogleAccount = (
  func: Parameters<typeof mutationFnUnbindGoogleAccount>[1]
) =>
  useMutation({
    mutationFn: (request: UnbindGoogleAccountRequest) =>
      mutationFnUnbindGoogleAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useUnbindGithubAccount = (
  func: Parameters<typeof mutationFnUnbindGithubAccount>[1]
) =>
  useMutation({
    mutationFn: (request: UnbindGithubAccountRequest) =>
      mutationFnUnbindGithubAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useUnbindXAccount = (
  func: Parameters<typeof mutationFnUnbindXAccount>[1]
) =>
  useMutation({
    mutationFn: (request: UnbindXAccountRequest) =>
      mutationFnUnbindXAccount(request, func),
    onSuccess: refreshAccount,
  });

export const useUnbindDiscordAccount = (
  func: Parameters<typeof mutationFnUnbindDiscordAccount>[1]
) =>
  useMutation({
    mutationFn: (request: UnbindDiscordAccountRequest) =>
      mutationFnUnbindDiscordAccount(request, func),
    onSuccess: refreshAccount,
  });
