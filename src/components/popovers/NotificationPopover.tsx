import {
  useMarkNotificationsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@shared/api/hooks/notification.hook";
import type { Notification } from "@shared/api/interfaces/notification.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import {
  CheckCheckIcon,
  BellIcon,
  CircleAlertIcon,
  Loader2Icon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationDialog } from "@/components/dialogs/NotificationDialog";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

export const NotificationPopover = () => {
  const { t } = useTranslation();
  const queryClient = getQueryClient();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const listQuery = useNotifications(open);
  const unreadQuery = useUnreadNotificationCount(true);
  const markReadMutation = useMarkNotificationsRead();
  const notifications =
    listQuery.data?.pages.flatMap(page =>
      page.data.searchEdges.map(edge => edge.node)
    ) ?? [];

  const markRead = useCallback(
    async (notification: Notification) => {
      if (notification.readAt !== null) return;
      const readAt = new Date();
      const previousList = queryClient.getQueryData(
        queryKeys.notification.list()
      );
      const previousUnreadCount = queryClient.getQueryData(
        queryKeys.notification.unreadCount()
      );
      queryClient.setQueryData(queryKeys.notification.list(), (current: any) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page: any) => ({
                ...page,
                data: {
                  ...page.data,
                  searchEdges: page.data.searchEdges.map((edge: any) =>
                    edge.node.id === notification.id
                      ? { ...edge, node: { ...edge.node, readAt } }
                      : edge
                  ),
                },
              })),
            }
          : current
      );
      queryClient.setQueryData(
        queryKeys.notification.unreadCount(),
        (current: any) =>
          current
            ? {
                ...current,
                data: { count: Math.max(0, current.data.count - 1) },
              }
            : current
      );
      try {
        await markReadMutation.mutateAsync({
          body: { notificationIds: [notification.id] },
        });
      } catch {
        queryClient.setQueryData(queryKeys.notification.list(), previousList);
        queryClient.setQueryData(
          queryKeys.notification.unreadCount(),
          previousUnreadCount
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notification.list(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notification.unreadCount(),
        });
      }
    },
    [markReadMutation, queryClient]
  );

  const unreadCount = unreadQuery.data?.data.count ?? 0;

  return (
    <>
      <MenubarMenu>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <MenubarTrigger
              className="relative px-2 py-2 flex items-center justify-center"
              aria-label={t("workspace.navigation.notifications")}
              title={t("workspace.navigation.notifications")}
            >
              <BellIcon size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </MenubarTrigger>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-[22rem] p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="font-semibold">
                  {t("workspace.navigation.notifications")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              </div>
              {unreadCount > 0 && (
                <CheckCheckIcon
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="max-h-[28rem] space-y-2 overflow-y-auto p-3">
              {listQuery.isPending && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {t("common.loading")}
                </div>
              )}
              {listQuery.isError && (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                  <CircleAlertIcon className="size-5 text-destructive" />
                  <span>{listQuery.error.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => listQuery.refetch()}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {!listQuery.isPending &&
                !listQuery.isError &&
                notifications.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                )}
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => void markRead(notification)}
                />
              ))}
              {listQuery.hasNextPage && (
                <Button
                  variant="ghost"
                  className="w-full"
                  disabled={listQuery.isFetchingNextPage}
                  onClick={() => listQuery.fetchNextPage()}
                >
                  {listQuery.isFetchingNextPage ? (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  ) : null}
                  Load more
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full rounded-none border-x-0 border-b-0"
              onClick={() => {
                setOpen(false);
                setDialogOpen(true);
              }}
            >
              manage
            </Button>
          </PopoverContent>
        </Popover>
      </MenubarMenu>
      <NotificationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
