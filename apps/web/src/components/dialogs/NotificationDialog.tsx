import {
  useDeleteNotifications,
  useNotifications,
} from "@/api/hooks/notification.hook";
import type {
  ListNotificationsResponse,
  Notification,
} from "@shared/api/interfaces/notification.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import type { InfiniteData } from "@tanstack/react-query";
import { CircleAlertIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationDetailPopover } from "@/components/popovers/NotificationDetailPopover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const NotificationDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation();
  const queryClient = getQueryClient();
  const listQuery = useNotifications(open);
  const deleteMutation = useDeleteNotifications();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailNotificationId, setDetailNotificationId] = useState<
    string | null
  >(null);
  const closeTimerRef = useRef<number | null>(null);
  const notifications =
    listQuery.data?.pages.flatMap(page =>
      page.data.searchEdges.map(edge => edge.node)
    ) ?? [];
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected =
    notifications.length > 0 && selectedIds.length === notifications.length;
  const payloadText = (notification: Notification, key: string) => {
    const value = notification.payload[key];
    return typeof value === "string" && value.trim().length > 0
      ? value
      : notification.templateKey;
  };
  const truncate = (value: string, length = 80) =>
    value.length > length ? `${value.slice(0, length - 1)}…` : value;
  const formatNotificationDate = (date: Date) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  const formatPayload = (payload: Notification["payload"]) => {
    try {
      return JSON.stringify(payload);
    } catch {
      return "Unable to display payload";
    }
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  const toggleSelected = (notification: Notification, selected: boolean) => {
    setSelectedIds(current =>
      selected
        ? current.includes(notification.id)
          ? current
          : [...current, notification.id]
        : current.filter(id => id !== notification.id)
    );
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const ids = new Set(selectedIds);
    const previousList = queryClient.getQueryData<
      InfiniteData<ListNotificationsResponse>
    >(queryKeys.notification.list());
    const previousUnreadCount = queryClient.getQueryData(
      queryKeys.notification.unreadCount()
    );
    const deletedUnreadCount = notifications.filter(
      notification => ids.has(notification.id) && notification.readAt === null
    ).length;

    queryClient.setQueryData<InfiniteData<ListNotificationsResponse>>(
      queryKeys.notification.list(),
      current =>
        current
          ? {
              ...current,
              pages: current.pages.map(page => ({
                ...page,
                data: {
                  ...page.data,
                  searchEdges: page.data.searchEdges.filter(
                    edge => !ids.has(edge.node.id)
                  ),
                },
              })),
            }
          : current
    );
    if (deletedUnreadCount > 0) {
      queryClient.setQueryData(
        queryKeys.notification.unreadCount(),
        (current: any) =>
          current
            ? {
                ...current,
                data: {
                  count: Math.max(0, current.data.count - deletedUnreadCount),
                },
              }
            : current
      );
    }

    try {
      for (let index = 0; index < selectedIds.length; index += 100) {
        await deleteMutation.mutateAsync({
          body: { notificationIds: selectedIds.slice(index, index + 100) },
        });
      }
      setSelectedIds([]);
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
  };

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (nextOpen) {
          if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
          }
          onOpenChange(true);
          return;
        }

        setDetailNotificationId(null);
        setSelectedIds([]);
        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current);
        }
        // Let the nested modal popover finish unmounting before Dialog does.
        closeTimerRef.current = window.setTimeout(() => {
          closeTimerRef.current = null;
          onOpenChange(false);
        }, 250);
      }}
    >
      <DialogContent className="flex max-h-[min(90vh,52rem)] flex-col sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.navigation.notifications")}</DialogTitle>
          <DialogDescription>
            Select notifications to remove from your inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between border-y py-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={
                allSelected
                  ? true
                  : selectedIds.length > 0
                    ? "indeterminate"
                    : false
              }
              disabled={notifications.length === 0}
              onCheckedChange={checked =>
                setSelectedIds(
                  checked === true ? notifications.map(item => item.id) : []
                )
              }
            />
            Select all
          </label>
          <span className="text-xs text-muted-foreground">
            {selectedIds.length} selected
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto pr-1">
          {listQuery.isPending && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              {t("common.loading")}
            </div>
          )}
          {listQuery.isError && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
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
          {!listQuery.isPending &&
            !listQuery.isError &&
            notifications.length > 0 && (
              <Table className="min-w-[58rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map(notification => {
                    const summary = payloadText(notification, "summary");
                    const content =
                      summary !== notification.templateKey
                        ? summary
                        : payloadText(notification, "body");
                    const payload = formatPayload(notification.payload);

                    return (
                      <NotificationDetailPopover
                        key={notification.id}
                        notification={notification}
                        open={detailNotificationId === notification.id}
                        onOpenChange={nextOpen =>
                          setDetailNotificationId(
                            nextOpen ? notification.id : null
                          )
                        }
                      >
                        <TableRow
                          className="cursor-pointer"
                          data-state={
                            selectedSet.has(notification.id)
                              ? "selected"
                              : undefined
                          }
                        >
                          <TableCell onClick={event => event.stopPropagation()}>
                            <Checkbox
                              checked={selectedSet.has(notification.id)}
                              aria-label={`Select ${payloadText(notification, "title")}`}
                              onCheckedChange={checked =>
                                toggleSelected(notification, checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {notification.type}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {notification.priority}
                          </TableCell>
                          <TableCell>
                            <span
                              className="block max-w-[16rem] truncate"
                              title={content}
                            >
                              {truncate(content)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <code
                              className="block max-w-[16rem] truncate text-xs"
                              title={payload}
                            >
                              {truncate(payload)}
                            </code>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs">
                            {formatNotificationDate(notification.createdAt)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {notification.readAt === null ? "Unread" : "Read"}
                          </TableCell>
                        </TableRow>
                      </NotificationDetailPopover>
                    );
                  })}
                </TableBody>
              </Table>
            )}
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

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={selectedIds.length === 0 || deleteMutation.isPending}
            onClick={() => void deleteSelected()}
          >
            {deleteMutation.isPending ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2Icon className="mr-2 size-4" />
            )}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
