import type {
  ListNotificationsResponse,
  Notification,
} from "@shared/api/interfaces/notification.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import type { InfiniteData } from "@tanstack/react-query";

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
