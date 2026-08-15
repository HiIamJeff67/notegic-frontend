import {
  useMarkNotificationsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@shared/api/hooks/notification.hook";
import type { Notification } from "@shared/api/interfaces/notification.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { cn } from "@shared/util/utils";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BellIcon,
  CircleAlertIcon,
  InfoIcon,
  Loader2Icon,
  NewspaperIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationDialog } from "@/components/dialogs/NotificationDialog";
import { NotificationDetailPopover } from "@/components/popovers/NotificationDetailPopover";
import { Button } from "@/components/ui/button";
import { MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const NotificationPopover = ({ mobile = false }: { mobile?: boolean }) => {
  const { t } = useTranslation();
  const queryClient = getQueryClient();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailNotificationId, setDetailNotificationId] = useState<
    string | null
  >(null);
  const manageTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (manageTimerRef.current !== null) {
        window.clearTimeout(manageTimerRef.current);
      }
    },
    []
  );
  const listQuery = useNotifications(open);
  const unreadQuery = useUnreadNotificationCount(true);
  const markReadMutation = useMarkNotificationsRead();
  const notifications =
    listQuery.data?.pages.flatMap(page =>
      page.data.searchEdges.map(edge => edge.node)
    ) ?? [];
  const priorityClassName: Record<Notification["priority"], string> = {
    low: "text-muted-foreground",
    normal: "text-primary",
    high: "text-orange-500",
    critical: "text-destructive",
  };
  const formatNotificationDate = (date: Date) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  const payloadText = (notification: Notification, key: string) => {
    const value = notification.payload[key];
    return typeof value === "string" && value.trim().length > 0
      ? value
      : notification.templateKey;
  };

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
  const totalCount = listQuery.data?.pages[0]?.data.totalCount ?? 0;

  const notificationMenu = (
    <Popover
          open={open}
          onOpenChange={nextOpen => {
            setOpen(nextOpen);
            if (nextOpen && manageTimerRef.current !== null) {
              window.clearTimeout(manageTimerRef.current);
              manageTimerRef.current = null;
            }
            if (!nextOpen) setDetailNotificationId(null);
          }}
        >
          <PopoverTrigger asChild>
            {mobile ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative shrink-0 [&_svg]:size-5"
                aria-label={t("workspace.navigation.notifications")}
                title={t("workspace.navigation.notifications")}
              >
                <BellIcon size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            ) : (
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
            )}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[22rem] p-0"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold">
                {t("workspace.navigation.notifications")}
              </h2>
              <span
                className="text-xs text-muted-foreground"
                aria-label={`${unreadCount} unread of ${totalCount}`}
              >
                {unreadCount} / {totalCount}
              </span>
            </div>
            <div className="max-h-[28rem] space-y-px overflow-y-auto p-2">
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
              {notifications.map(notification => {
                const isUnread = notification.readAt === null;
                const title = payloadText(notification, "title");
                const summary = payloadText(notification, "summary");
                const content =
                  summary !== notification.templateKey
                    ? summary
                    : payloadText(notification, "body");
                const typeIcon =
                  notification.type === "news" ? (
                    <NewspaperIcon className="size-4" />
                  ) : notification.type === "warning" ? (
                    <AlertTriangleIcon className="size-4" />
                  ) : notification.type === "important" ? (
                    <AlertCircleIcon className="size-4" />
                  ) : (
                    <InfoIcon className="size-4" />
                  );

                return (
                  <NotificationDetailPopover
                    key={notification.id}
                    notification={notification}
                    open={detailNotificationId === notification.id}
                    onOpenChange={nextOpen =>
                      setDetailNotificationId(nextOpen ? notification.id : null)
                    }
                  >
                    <button
                      type="button"
                      className={cn(
                        "w-full rounded-none border p-3 text-left transition-colors",
                        isUnread
                          ? "border-primary/30 bg-accent/35"
                          : "bg-background/40",
                        "hover:bg-accent/60"
                      )}
                      onClick={() => {
                        void markRead(notification);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-0.5 shrink-0",
                            priorityClassName[notification.priority]
                          )}
                          aria-hidden="true"
                        >
                          {typeIcon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className={cn(
                                "line-clamp-1 text-sm",
                                isUnread && "font-semibold"
                              )}
                            >
                              {title}
                            </h3>
                            <time
                              className="shrink-0 text-[10px] text-muted-foreground"
                              dateTime={notification.createdAt.toISOString()}
                            >
                              {formatNotificationDate(notification.createdAt)}
                            </time>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {content}
                          </p>
                        </div>
                      </div>
                    </button>
                  </NotificationDetailPopover>
                );
              })}
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
                manageTimerRef.current = window.setTimeout(() => {
                  manageTimerRef.current = null;
                  setDialogOpen(true);
                }, 250);
              }}
            >
              manage
            </Button>
          </PopoverContent>
        </Popover>
  );

  return (
    <>
      {mobile ? notificationMenu : <MenubarMenu>{notificationMenu}</MenubarMenu>}
      <NotificationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
