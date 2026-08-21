import { useApolloClient } from "@apollo/client/react";
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
} from "@shared/api/invokers/auth.invoker";
import { AuthLocalSynchronizer } from "@shared/api/local/synchronizers/auth.synchronizer";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { type QueryKey, useMutation } from "@tanstack/react-query";

export const useRegister = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRegister,
    onSuccess: async (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.data?.publicId
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
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.data?.publicId
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
    onSuccess: async response => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.data?.publicId
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
    onSuccess: async response => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ?? response.data?.csrfToken,
        response.data?.publicId
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
      SessionStorageManipulator.removeItem(
        SessionStorageKey.csrfToken,
        response.embedded.publicId
      );
      await AuthLocalSynchronizer.syncLogout(response);
      queryClient.removeQueries();
      apolloClient.clearStore();
    },
  });

  return mutation;
};

export const useSendAuthCode = () => {
  const mutation = useMutation({
    mutationFn: mutationFnSendAuthCode,
    onSuccess: async response => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useValidateEmail = () => {
  const mutation = useMutation({
    mutationFn: mutationFnValidateEmail,
    onSuccess: async response => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useResetEmail = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnResetEmail,
    onSuccess: async (response, request) => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
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
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
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
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken ??
          response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
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
      SessionStorageManipulator.removeItem(
        SessionStorageKey.csrfToken,
        response.embedded.publicId
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
    },
    onError: error => {},
  });

  return mutation;
};
