import {
  getClientMutationHeaders,
  getClientRequestHeaders,
} from "@shared/api/clientHeaders";
import { NotezyAPIError } from "@shared/api/exceptions";
import type {
  DeleteNotificationsRequest,
  DeleteNotificationsResponse,
  GetUnreadNotificationCountResponse,
  ListNotificationsRequest,
  ListNotificationsResponse,
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
  Notification,
} from "@shared/api/interfaces/notification.interface";
import {
  mutationFnDeleteNotifications,
  mutationFnMarkNotificationsRead,
  queryFnGetUnreadNotificationCount,
  queryFnListNotifications,
} from "@shared/api/invokers/notification.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

const persistCSRFToken = (response: {
  refreshableTokens?: { newCSRFToken?: string };
  embedded?: { publicId?: string };
}) => {
  if (!response.refreshableTokens?.newCSRFToken) return;
  SessionStorageManipulator.ensureItem(
    SessionStorageKey.csrfToken,
    response.refreshableTokens.newCSRFToken,
    response.embedded?.publicId
  );
};

const notificationRetryPolicy = (failureCount: number, error: Error) =>
  failureCount < 1 &&
  error instanceof NotezyAPIError &&
  error.unWrap.retryable === true;

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
    retry: notificationRetryPolicy,
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
    retry: notificationRetryPolicy,
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
      persistCSRFToken(response);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.list(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.unreadCount(),
      });
    },
    retry: notificationRetryPolicy,
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
      persistCSRFToken(response);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.list(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.unreadCount(),
      });
    },
    retry: notificationRetryPolicy,
  });
};

export const mergeRealtimeNotificationIntoCache = (
  notification: Notification
) => {
  const queryClient = getQueryClient();
  queryClient.setQueryData<InfiniteData<ListNotificationsResponse>>(
    queryKeys.notification.list(),
    current => {
      if (!current || current.pages.length === 0) return current;
      if (
        current.pages.some(page =>
          page.data.searchEdges.some(edge => edge.node.id === notification.id)
        )
      ) {
        return current;
      }
      const [firstPage, ...restPages] = current.pages;
      return {
        ...current,
        pages: [
          {
            ...firstPage,
            data: {
              ...firstPage.data,
              searchEdges: [
                {
                  // Client-inserted entries are never used as pagination cursors.
                  encodedSearchCursor: notification.id,
                  node: notification,
                },
                ...firstPage.data.searchEdges,
              ],
            },
          },
          ...restPages,
        ],
      };
    }
  );
  void queryClient.invalidateQueries({
    queryKey: queryKeys.notification.unreadCount(),
  });
};

export const refetchNotifications = () => {
  const queryClient = getQueryClient();
  void queryClient.invalidateQueries({
    queryKey: queryKeys.notification.list(),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.notification.unreadCount(),
  });
};
