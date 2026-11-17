import {
  type GetMyAccountResponse,
  type PrepareOAuthOperationRequest,
  PrepareOAuthOperationRequestSchema,
} from "@shared/api/interfaces/userAccount.interface";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BindDiscordAccount,
  BindGithubAccount,
  BindGoogleAccount,
  BindXAccount,
  GetMyAccount,
  PrepareOAuthOperation,
  UnbindDiscordAccount,
  UnbindGithubAccount,
  UnbindGoogleAccount,
  UnbindXAccount,
  UpdateMyAccount,
} from "@/api/functions/userAccount.serverFn";

export const usePrepareOAuthOperation = () =>
  useMutation({
    mutationFn: (request: PrepareOAuthOperationRequest) =>
      PrepareOAuthOperation(parse(PrepareOAuthOperationRequestSchema, request)),
    retry: false,
  });

export const useGetMyAccount = () =>
  useQuery({
    queryKey: queryKeys.userAccount.my(),
    queryFn: () => queryFnGetMyAccount(GetMyAccount),
    staleTime: 0,
    networkMode: "online",
    refetchOnReconnect: true,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

export const useUpdateMyAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnUpdateMyAccount>[0]) =>
      mutationFnUpdateMyAccount(request, UpdateMyAccount),
    onSuccess: async ({ data: { backupEmail, countryCode, phoneNumber } }) => {
      const queryKey = queryKeys.userAccount.my();
      if (
        backupEmail !== undefined ||
        countryCode !== undefined ||
        phoneNumber !== undefined
      ) {
        await queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData<GetMyAccountResponse>(queryKey, current =>
          current
            ? {
                ...current,
                data: {
                  ...current.data,
                  backupEmail:
                    backupEmail === undefined
                      ? current.data.backupEmail
                      : backupEmail,
                  countryCode:
                    countryCode === undefined
                      ? current.data.countryCode
                      : countryCode,
                  phoneNumber:
                    phoneNumber === undefined
                      ? current.data.phoneNumber
                      : phoneNumber,
                },
              }
            : undefined
        );
      }
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return mutation;
};

export const useBindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnBindGoogleAccount>[0]) =>
      mutationFnBindGoogleAccount(request, BindGoogleAccount),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userAccount.my(),
      });
    },
  });

  return mutation;
};

export const useBindGithubAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnBindGithubAccount>[0]) =>
      mutationFnBindGithubAccount(request, BindGithubAccount),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userAccount.my(),
      });
    },
  });

  return mutation;
};

export const useBindXAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnBindXAccount>[0]) =>
      mutationFnBindXAccount(request, BindXAccount),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userAccount.my(),
      });
    },
  });

  return mutation;
};

export const useBindDiscordAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnBindDiscordAccount>[0]) =>
      mutationFnBindDiscordAccount(request, BindDiscordAccount),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userAccount.my(),
      });
    },
  });

  return mutation;
};

export const useUnbindGoogleAccount = () =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUnbindGoogleAccount>[0]
    ) => mutationFnUnbindGoogleAccount(request, UnbindGoogleAccount),
    retry: false,
  });

export const useUnbindGithubAccount = () =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUnbindGithubAccount>[0]
    ) => mutationFnUnbindGithubAccount(request, UnbindGithubAccount),
    retry: false,
  });

export const useUnbindXAccount = () =>
  useMutation({
    mutationFn: (request: Parameters<typeof mutationFnUnbindXAccount>[0]) =>
      mutationFnUnbindXAccount(request, UnbindXAccount),
    retry: false,
  });

export const useUnbindDiscordAccount = () =>
  useMutation({
    mutationFn: (
      request: Parameters<typeof mutationFnUnbindDiscordAccount>[0]
    ) => mutationFnUnbindDiscordAccount(request, UnbindDiscordAccount),
    retry: false,
  });
