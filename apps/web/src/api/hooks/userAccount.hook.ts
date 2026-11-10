import {
  type GetMyAccountResponse,
  type PrepareOAuthOperationRequest,
  PrepareOAuthOperationRequestSchema,
} from "@shared/api/interfaces/userAccount.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { parseRequest } from "@shared/api/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PrepareOAuthOperation } from "@/api/functions/userAccount.serverFn";
import {
  mutationFnBindGoogleAccount,
  mutationFnBindGithubAccount,
  mutationFnBindXAccount,
  mutationFnUnbindGoogleAccount,
  mutationFnUnbindGithubAccount,
  mutationFnUnbindXAccount,
  mutationFnUpdateMyAccount,
  queryFnGetMyAccount,
} from "@/api/invokers/userAccount.invoker";

export const useGetMyAccount = () =>
  useQuery({
    queryKey: queryKeys.userAccount.my(),
    queryFn: queryFnGetMyAccount,
    staleTime: 0,
    networkMode: "online",
    refetchOnReconnect: true,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
  });

export const useUpdateMyAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyAccount,
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

export const usePrepareOAuthOperation = () =>
  useMutation({
    mutationFn: (request: PrepareOAuthOperationRequest) =>
      PrepareOAuthOperation({
        data: parseRequest(PrepareOAuthOperationRequestSchema, request),
      }),
    retry: false,
  });

export const useBindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBindGoogleAccount,
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
    mutationFn: mutationFnBindGithubAccount,
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
    mutationFn: mutationFnBindXAccount,
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
    mutationFn: mutationFnUnbindGoogleAccount,
    retry: false,
  });

export const useUnbindGithubAccount = () =>
  useMutation({
    mutationFn: mutationFnUnbindGithubAccount,
    retry: false,
  });

export const useUnbindXAccount = () =>
  useMutation({
    mutationFn: mutationFnUnbindXAccount,
    retry: false,
  });
