import { useApolloClient } from "@apollo/client/react";
import type { GetMyAccountResponse } from "@shared/api/interfaces/userAccount.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type QueryClient,
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { clearClientCSRFToken, setClientCSRFToken } from "@/api/clientHeaders";
import {
  mutationFnDeleteMe,
  mutationFnForgetPassword,
  mutationFnLogin,
  mutationFnLoginViaGoogle,
  mutationFnLoginViaGithub,
  mutationFnLoginViaX,
  mutationFnLoginViaDiscord,
  mutationFnLogout,
  mutationFnRegister,
  mutationFnRegisterViaGoogle,
  mutationFnRegisterViaGithub,
  mutationFnRegisterViaX,
  mutationFnRegisterViaDiscord,
  mutationFnResetEmail,
  mutationFnResetMe,
  mutationFnSendAuthCode,
  mutationFnValidateEmail,
} from "@/api/invokers/auth.invoker";
import { AuthLocalSynchronizer } from "@/api/local/synchronizers/auth.synchronizer";
import { clearSearchItems } from "@/api/policies/searchItems.policy";
import { clearSearchRootShelves } from "@/api/policies/searchRootShelves.policy";
import { clearSearchRoutines } from "@/api/policies/searchRoutines.policy";
import { clearSearchRoutineTags } from "@/api/policies/searchRoutineTags.policy";
import { clearSearchRoutineTasks } from "@/api/policies/searchRoutineTasks.policy";
import { clearSearchStations } from "@/api/policies/searchStations.policy";

const markAccountEmailVerified = async (queryClient: QueryClient) => {
  const queryKey = queryKeys.userAccount.my();
  await queryClient.cancelQueries({ queryKey });
  queryClient.setQueryData<GetMyAccountResponse>(queryKey, current =>
    current
      ? { ...current, data: { ...current.data, emailVerified: true } }
      : undefined
  );
  void queryClient.invalidateQueries({ queryKey });
};

export const useRegister = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRegister,
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
    mutationFn: mutationFnRegisterViaGoogle,
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
    mutationFn: mutationFnRegisterViaGithub,
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
    mutationFn: mutationFnRegisterViaX,
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
    mutationFn: mutationFnRegisterViaDiscord,
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
    mutationFn: mutationFnLogin,
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
    mutationFn: mutationFnLoginViaGoogle,
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
    mutationFn: mutationFnLoginViaGithub,
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
    mutationFn: mutationFnLoginViaX,
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
    mutationFn: mutationFnLoginViaDiscord,
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
    mutationFn: mutationFnLogout,
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
    mutationFn: mutationFnSendAuthCode,
    onError: error => {},
  });

  return mutation;
};

export const useValidateEmail = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: mutationFnValidateEmail,
    onSuccess: () => markAccountEmailVerified(queryClient),
    onError: error => {},
  });

  return mutation;
};

export const useResetEmail = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnResetEmail,
    onSuccess: async (response, request) => {
      if (response.data.verificationRequired) return;
      await AuthLocalSynchronizer.syncResetEmail(request, response);
      await markAccountEmailVerified(queryClient);
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
    mutationFn: mutationFnForgetPassword,
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
    mutationFn: mutationFnResetMe,
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
    mutationFn: mutationFnDeleteMe,
    onSuccess: async response => {
      await AuthLocalSynchronizer.syncDeleteMe(response);
      clearClientCSRFToken();
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
    },
    onError: error => {},
  });

  return mutation;
};
