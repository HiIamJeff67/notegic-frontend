import {
  useDeleteNotifications,
  useNotifications,
} from "@shared/api/hooks/notification.hook";
import type {
  ListNotificationsResponse,
  Notification,
} from "@shared/api/interfaces/notification.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import type { InfiniteData } from "@tanstack/react-query";
import { CircleAlertIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  const notifications =
    listQuery.data?.pages.flatMap(page =>
      page.data.searchEdges.map(edge => edge.node)
    ) ?? [];
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected =
    notifications.length > 0 && selectedIds.length === notifications.length;

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
        if (!nextOpen) setSelectedIds([]);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex max-h-[min(90vh,52rem)] flex-col sm:max-w-2xl">
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

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
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
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              selectable
              selected={selectedSet.has(notification.id)}
              onSelectedChange={selected =>
                toggleSelected(notification, selected)
              }
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
