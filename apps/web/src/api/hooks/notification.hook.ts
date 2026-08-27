import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@/api/clientHeaders";
import { NotegicAPIError } from "@shared/api/exceptions";
import type {
  DeleteNotificationsRequest,
  DeleteNotificationsResponse,
  GetUnreadNotificationCountResponse,
  ListNotificationsRequest,
  ListNotificationsResponse,
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
} from "@shared/api/interfaces/notification.interface";
import {
  mutationFnDeleteNotifications,
  mutationFnMarkNotificationsRead,
  queryFnGetUnreadNotificationCount,
  queryFnListNotifications,
} from "@/api/invokers/notification.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export const useNotifications = (enabled = true) =>
  useInfiniteQuery<
    ListNotificationsResponse,
    Error,
    InfiniteData<ListNotificationsResponse>,
    ReturnType<typeof queryKeys.notification.list>,
    string | undefined
  >({
    queryKey: queryKeys.notification.list(),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const request: ListNotificationsRequest = {
        header: getClientRequestHeaders(),
        param: { first: 20, ...(pageParam ? { after: pageParam } : {}) },
      };
      return queryFnListNotifications(request);
    },
    getNextPageParam: lastPage =>
      lastPage.data.searchPageInfo.hasNextPage
        ? (lastPage.data.searchPageInfo.endEncodedSearchCursor ?? undefined)
        : undefined,
    staleTime: 6 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    networkMode: "always",
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof NotegicAPIError &&
      error.unWrap.retryable === true,
    enabled,
  });

export const useUnreadNotificationCount = (enabled = true) =>
  useQuery<GetUnreadNotificationCountResponse, Error>({
    queryKey: queryKeys.notification.unreadCount(),
    queryFn: () =>
      queryFnGetUnreadNotificationCount({
        header: getClientRequestHeaders(),
      }),
    staleTime: 6 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    networkMode: "always",
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof NotegicAPIError &&
      error.unWrap.retryable === true,
    enabled,
  });

export const useMarkNotificationsRead = () => {
  const queryClient = getQueryClient();
  return useMutation<
    MarkNotificationsReadResponse,
    Error,
    Omit<MarkNotificationsReadRequest, "header">
  >({
    mutationFn: request =>
      mutationFnMarkNotificationsRead({
        ...request,
        header: getClientMutationHeaders(),
      }),
    onSuccess: response => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.list(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.unreadCount(),
      });
    },
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof NotegicAPIError &&
      error.unWrap.retryable === true,
  });
};

export const useDeleteNotifications = () => {
  const queryClient = getQueryClient();
  return useMutation<
    DeleteNotificationsResponse,
    Error,
    Omit<DeleteNotificationsRequest, "header">
  >({
    mutationFn: request =>
      mutationFnDeleteNotifications({
        ...request,
        header: getClientMutationHeaders(),
      }),
    onSuccess: response => {
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.list(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.unreadCount(),
      });
    },
    retry: (failureCount, error) =>
      failureCount < 1 &&
      error instanceof NotegicAPIError &&
      error.unWrap.retryable === true,
  });
};
