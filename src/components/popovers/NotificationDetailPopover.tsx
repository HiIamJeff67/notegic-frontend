import type { Notification } from "@shared/api/interfaces/notification.interface";
import { cn } from "@shared/util/utils";
import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Unable to display value";
    }
  }
  return String(value).trim() || "—";
};

const DetailField = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: unknown;
  valueClassName?: string;
}) => (
  <div className="min-w-0 rounded-md border bg-muted/20 px-2.5 py-1.5">
    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </dt>
    <dd className={cn("mt-0.5 break-words text-sm", valueClassName)}>
      {formatValue(value)}
    </dd>
  </div>
);

export const NotificationDetailPopover = ({
  notification,
  children,
  open,
  onOpenChange,
}: {
  notification: Notification;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const title =
    typeof notification.payload.title === "string" &&
    notification.payload.title.trim().length > 0
      ? notification.payload.title.trim()
      : notification.templateKey;
  const summary =
    typeof notification.payload.summary === "string"
      ? notification.payload.summary.trim()
      : "";
  const payloadEntries = Object.entries(notification.payload).filter(
    ([key]) => !["title", "summary", "body"].includes(key)
  );

  return (
    <Popover modal open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[min(70vh,36rem)] w-[min(90vw,32rem)] overflow-y-auto"
      >
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Notification</p>
            <h2 className="mt-0.5 break-words font-semibold">{title}</h2>
            {summary && (
              <p className="mt-0.5 break-words text-sm text-muted-foreground">
                {summary}
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-1.5">
            <DetailField label="Type" value={notification.type} />
            <DetailField label="Priority" value={notification.priority} />
          </dl>

          {payloadEntries.length > 0 && (
            <div className="border-t pt-2">
              <dl className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {payloadEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[minmax(5rem,auto)_1fr] gap-2 border-b pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <dt className="break-words text-xs font-medium text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="min-w-0 break-words text-sm">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="border-t pt-2">
            <div className="min-h-28 rounded-md border bg-muted/20 px-2.5 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Body
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                {formatValue(notification.payload.body)}
              </p>
            </div>
          </div>

          <div className="border-t pt-2">
            <dl className="grid grid-cols-3 gap-1.5">
              <DetailField label="Template" value={notification.templateKey} />
              <DetailField
                label="Version"
                value={notification.templateVersion}
              />
              <DetailField
                label="Status"
                value={notification.readAt ? "Read" : "Unread"}
              />
            </dl>
            <dl className="mt-1.5 grid grid-cols-2 gap-1.5">
              <DetailField
                label="ID"
                value={notification.id}
                valueClassName="hide-scrollbar overflow-x-auto whitespace-nowrap"
              />
              <DetailField
                label="Recipient"
                value={notification.recipientUserPublicId}
                valueClassName="hide-scrollbar overflow-x-auto whitespace-nowrap"
              />
              <DetailField label="Expires" value={notification.expiresAt} />
              <DetailField label="Created" value={notification.createdAt} />
              <DetailField label="Read at" value={notification.readAt} />
            </dl>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
