import type {
  DeleteNotificationsRequest,
  GetUnreadNotificationCountRequest,
  ListNotificationsRequest,
  MarkNotificationsReadRequest,
} from "@shared/api/interfaces/notification.interface";
import {
  mutationFnDeleteNotifications,
  mutationFnMarkNotificationsRead,
  queryFnGetUnreadNotificationCount,
  queryFnListNotifications,
} from "@shared/api/invokers/notification.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";

const queryOptions = {
  staleTime: UseQueryDefaultOptions.staleTime,
  refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
  refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
};

export const useNotifications = (
  func: Parameters<typeof queryFnListNotifications>[1],
  request?: Parameters<typeof queryFnListNotifications>[0]
) =>
  useQuery({
    queryKey: queryKeys.notification.list(),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnListNotifications(request as ListNotificationsRequest, func),
    ...queryOptions,
  });

export const useUnreadNotificationCount = (
  func: Parameters<typeof queryFnGetUnreadNotificationCount>[1],
  request?: Parameters<typeof queryFnGetUnreadNotificationCount>[0]
) =>
  useQuery({
    queryKey: queryKeys.notification.unreadCount(),
    enabled: request !== undefined,
    queryFn: () =>
      queryFnGetUnreadNotificationCount(
        request as GetUnreadNotificationCountRequest,
        func
      ),
    ...queryOptions,
  });

export const useMarkNotificationsRead = (
  func: Parameters<typeof mutationFnMarkNotificationsRead>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: MarkNotificationsReadRequest) =>
      mutationFnMarkNotificationsRead(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.all(),
      });
    },
  });
};

export const useDeleteNotifications = (
  func: Parameters<typeof mutationFnDeleteNotifications>[1]
) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: (request: DeleteNotificationsRequest) =>
      mutationFnDeleteNotifications(request, func),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notification.all(),
      });
    },
  });
};
