import { useApolloClient } from "@apollo/client/react";
import type { GetMyAccountResponse } from "@shared/api/interfaces/userAccount.interface";
import {
  mutationFnDeleteMe,
  mutationFnForgetPassword,
  mutationFnLogin,
  mutationFnLoginViaDiscord,
  mutationFnLoginViaGithub,
  mutationFnLoginViaGoogle,
  mutationFnLoginViaX,
  mutationFnLogout,
  mutationFnRegister,
  mutationFnRegisterViaDiscord,
  mutationFnRegisterViaGithub,
  mutationFnRegisterViaGoogle,
  mutationFnRegisterViaX,
  mutationFnResetEmail,
  mutationFnResetMe,
  mutationFnSendAuthCode,
  mutationFnValidateEmail,
} from "@shared/api/invokers/auth.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  DeleteMe,
  ForgetPassword,
  Login,
  LoginViaDiscord,
  LoginViaGithub,
  LoginViaGoogle,
  LoginViaX,
  Logout,
  Register,
  RegisterViaDiscord,
  RegisterViaGithub,
  RegisterViaGoogle,
  RegisterViaX,
  ResetEmail,
  ResetMe,
  SendAuthCode,
  ValidateEmail,
} from "@/api/functions/auth.serverFn";
import {
  clearClientCSRFToken,
  setClientCSRFToken,
} from "@/api/functions/headers/csrfToken";
import { clearSearchItems } from "@/api/hooks/graphql/policies/searchItems.policy";
import { clearSearchRootShelves } from "@/api/hooks/graphql/policies/searchRootShelves.policy";
import { clearSearchRoutines } from "@/api/hooks/graphql/policies/searchRoutines.policy";
import { clearSearchRoutineTags } from "@/api/hooks/graphql/policies/searchRoutineTags.policy";
import { clearSearchRoutineTasks } from "@/api/hooks/graphql/policies/searchRoutineTasks.policy";
import { clearSearchStations } from "@/api/hooks/graphql/policies/searchStations.policy";
import { AuthLocalSynchronizer } from "@/api/local/synchronizers/auth.synchronizer";

export const useRegister = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnRegister>[0]) =>
      mutationFnRegister(request, Register),
    onSuccess: async (response, request) => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncRegister(request, response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useRegisterViaGoogle = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnRegisterViaGoogle>[0]) =>
      mutationFnRegisterViaGoogle(request, RegisterViaGoogle),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncRegisterViaOAuth(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useRegisterViaGithub = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnRegisterViaGithub>[0]) =>
      mutationFnRegisterViaGithub(request, RegisterViaGithub),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncRegisterViaOAuth(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useRegisterViaX = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnRegisterViaX>[0]) =>
      mutationFnRegisterViaX(request, RegisterViaX),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncRegisterViaOAuth(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useRegisterViaDiscord = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnRegisterViaDiscord>[0]) =>
      mutationFnRegisterViaDiscord(request, RegisterViaDiscord),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncRegisterViaOAuth(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });

  return mutation;
};

export const useLogin = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLogin>[0]) =>
      mutationFnLogin(request, Login),
    // Credentials and single-use verification tokens require an explicit retry.
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncLogin(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useLoginViaGoogle = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLoginViaGoogle>[0]) =>
      mutationFnLoginViaGoogle(request, LoginViaGoogle),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncLogin(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useLoginViaGithub = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLoginViaGithub>[0]) =>
      mutationFnLoginViaGithub(request, LoginViaGithub),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncLogin(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useLoginViaX = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLoginViaX>[0]) =>
      mutationFnLoginViaX(request, LoginViaX),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncLogin(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useLoginViaDiscord = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLoginViaDiscord>[0]) =>
      mutationFnLoginViaDiscord(request, LoginViaDiscord),
    retry: false,
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncLogin(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });

  return mutation;
};

export const useLogout = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnLogout>[0]) =>
      mutationFnLogout(request, Logout),
    onSuccess: async (response, request) => {
      clearClientCSRFToken();
      await AuthLocalSynchronizer.syncLogout(response);
      queryClient.removeQueries();
      apolloClient.clearStore();
    },
    onSettled: async () => {
      clearClientCSRFToken();
      queryClient.removeQueries();
      await apolloClient.clearStore();
    },
  });

  return mutation;
};

export const useSendAuthCode = () => {
  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnSendAuthCode>[0]) =>
      mutationFnSendAuthCode(request, SendAuthCode),
    onError: error => {},
  });

  return mutation;
};

export const useValidateEmail = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnValidateEmail>[0]) =>
      mutationFnValidateEmail(request, ValidateEmail),
    onSuccess: async () => {
      const queryKey = queryKeys.userAccount.my();
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<GetMyAccountResponse>(queryKey, current =>
        current
          ? { ...current, data: { ...current.data, emailVerified: true } }
          : undefined
      );
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: error => {},
  });

  return mutation;
};

export const useResetEmail = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnResetEmail>[0]) =>
      mutationFnResetEmail(request, ResetEmail),
    onSuccess: async (response, request) => {
      if (response.data.verificationRequired) return;
      await AuthLocalSynchronizer.syncResetEmail(request, response);
      const queryKey = queryKeys.userAccount.my();
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<GetMyAccountResponse>(queryKey, current =>
        current
          ? { ...current, data: { ...current.data, emailVerified: true } }
          : undefined
      );
      void queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useForgetPassword = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnForgetPassword>[0]) =>
      mutationFnForgetPassword(request, ForgetPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};

export const useResetMe = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnResetMe>[0]) =>
      mutationFnResetMe(request, ResetMe),
    onSuccess: async response => {
      const targetKeys: QueryKey[] = [
        queryKeys.user.data(),
        queryKeys.user.data(true),
        queryKeys.userInfo.all(),
        queryKeys.rootShelf.all(),
        queryKeys.subShelf.all(),
        queryKeys.material.all(),
        queryKeys.blockPack.all(),
        queryKeys.block.all(),
        queryKeys.station.all(),
        queryKeys.routine.all(),
        queryKeys.routineTag.all(),
        queryKeys.routineTask.all(),
        queryKeys.routineTaskDependency.all(),
        queryKeys.routineTaskRecord.all(),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.cancelQueries({ queryKey }))
      );
      await AuthLocalSynchronizer.syncResetMe(response);
      clearSearchItems(apolloClient.cache);
      clearSearchRootShelves(apolloClient.cache);
      clearSearchRoutines(apolloClient.cache);
      clearSearchRoutineTags(apolloClient.cache);
      clearSearchRoutineTasks(apolloClient.cache);
      clearSearchStations(apolloClient.cache);
      await Promise.all(
        targetKeys.map(queryKey => queryClient.resetQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMe = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Parameters<typeof mutationFnDeleteMe>[0]) =>
      mutationFnDeleteMe(request, DeleteMe),
    onSuccess: async response => {
      await AuthLocalSynchronizer.syncDeleteMe(response);
      clearClientCSRFToken();
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
    },
    onError: error => {},
  });

  return mutation;
};
