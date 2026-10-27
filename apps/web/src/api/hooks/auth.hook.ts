import { useApolloClient } from "@apollo/client/react";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { type QueryKey, useMutation } from "@tanstack/react-query";
import { clearClientCSRFToken, setClientCSRFToken } from "@/api/clientHeaders";
import {
  mutationFnDeleteMe,
  mutationFnForgetPassword,
  mutationFnLogin,
  mutationFnLoginViaGoogle,
  mutationFnLogout,
  mutationFnRegister,
  mutationFnRegisterViaGoogle,
  mutationFnResetEmail,
  mutationFnResetMe,
  mutationFnSendAuthCode,
  mutationFnValidateEmail,
} from "@/api/invokers/auth.invoker";
import { AuthLocalSynchronizer } from "@/api/local/synchronizers/auth.synchronizer";

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
    onSuccess: async response => {
      setClientCSRFToken(
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken
      );
      await AuthLocalSynchronizer.syncRegisterViaGoogle(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
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
      await AuthLocalSynchronizer.syncLoginViaGoogle(response);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
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
  const mutation = useMutation({
    mutationFn: mutationFnValidateEmail,
    onError: error => {},
  });

  return mutation;
};

export const useResetEmail = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnResetEmail,
    onSuccess: async (response, request) => {
      await AuthLocalSynchronizer.syncResetEmail(request, response);
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
    onSuccess: async response => {
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
      await AuthLocalSynchronizer.syncResetMe(response);
      apolloClient.cache.evict({ fieldName: "searchRootShelves" });
      const targetKeys: QueryKey[] = [
        queryKeys.user.data(),
        queryKeys.userInfo.all(),
        queryKeys.rootShelf.all(),
        queryKeys.subShelf.all(),
        queryKeys.material.all(),
        queryKeys.blockPack.all(),
        queryKeys.block.all(),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
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
