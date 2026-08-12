import type { Notification } from "@shared/api/interfaces/notification.interface";
import { cn } from "@shared/util/utils";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  NewspaperIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const payloadText = (notification: Notification, key: string): string => {
  const value = notification.payload[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : notification.templateKey;
};

const NotificationTypeIcon = ({ type }: { type: Notification["type"] }) => {
  if (type === "news") return <NewspaperIcon className="size-4" />;
  if (type === "warning") return <AlertTriangleIcon className="size-4" />;
  if (type === "important") return <AlertCircleIcon className="size-4" />;
  return <InfoIcon className="size-4" />;
};

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

export const NotificationItem = ({
  notification,
  onClick,
  selectable = false,
  selected = false,
  onSelectedChange,
}: {
  notification: Notification;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) => {
  const isUnread = notification.readAt === null;

  return (
    <article
      className={cn(
        "group rounded-md border p-3 transition-colors",
        isUnread ? "bg-accent/35 border-primary/30" : "bg-background/40",
        onClick && "cursor-pointer hover:bg-accent/60"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {selectable && (
          <Checkbox
            checked={selected}
            aria-label={`Select ${payloadText(notification, "title")}`}
            onCheckedChange={value => onSelectedChange?.(value === true)}
            onClick={event => event.stopPropagation()}
          />
        )}
        <span
          className={cn(
            "mt-0.5 shrink-0",
            priorityClassName[notification.priority]
          )}
          aria-hidden="true"
        >
          <NotificationTypeIcon type={notification.type} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn("text-sm", isUnread && "font-semibold")}>
            {payloadText(notification, "title")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {payloadText(notification, "summary") !== notification.templateKey
              ? payloadText(notification, "summary")
              : payloadText(notification, "body")}
          </p>
          <time
            className="mt-2 block text-[10px] text-muted-foreground"
            dateTime={notification.createdAt.toISOString()}
          >
            {formatNotificationDate(notification.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
};
