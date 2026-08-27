import React, { CSSProperties, useEffect } from "react";
import WrapPlaceholder from "@/components/holders/WrapPlaceholder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface EditWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export const EditWidgetDialog = ({
  open,
  onOpenChange,
  children,
}: EditWidgetDialogProps) => {
  useEffect(() => {
    if (open || typeof document === "undefined") return;
    const timerId = window.setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 100);
    return () => window.clearTimeout(timerId);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

interface EditWidgetDialogOptionProps {
  className?: string;
  style?: CSSProperties;
  title: string;
  description?: string;
  currentValue?: string;
  alignment?: "vertical" | "horizontal";
  children: React.ReactNode;
}

export const EditWidgetDialogOption = ({
  className,
  style,
  title,
  description,
  currentValue,
  alignment = "horizontal",
  children,
}: EditWidgetDialogOptionProps) => {
  return (
    <div
      className={`flex gap-2
        ${
          alignment !== undefined && alignment === "vertical"
            ? `flex-col items-start`
            : `justify-between items-center`
        } ${className}`}
      style={style}
    >
      <div className="w-full flex flex-col gap-1">
        <div className="w-full flex justify-between items-baseline">
          <label className="text-sm font-medium">{title}</label>
          {currentValue && (
            <p className="text-card-foreground font-semibold text-sm mr-2">
              {currentValue}
            </p>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground font-normal text-xs">
            {description}
          </p>
        )}
      </div>
      <div
        className={
          alignment !== undefined && alignment === "vertical" ? "w-full" : ""
        }
      >
        {children}
      </div>
    </div>
  );
};

export const EditWidgetDialogOptionSkeleton = ({
  className,
  style,
  alignment,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  alignment?: "vertical" | "horizontal";
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={`flex gap-2
        ${
          alignment !== undefined && alignment === "vertical"
            ? `flex-col items-start`
            : `justify-between items-center`
        } ${className}`}
      style={style}
    >
      <div className="flex flex-col gap-1.5 w-full">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div
        className={
          alignment !== undefined && alignment === "vertical" ? "w-full" : ""
        }
      >
        {children}
      </div>
    </div>
  );
};

export const EditWidgetDialogSeparator = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={`bg-border pointer-events-none -mx-1 my-1 h-px ${className}`}
    />
  );
};

interface EditWidgetDialogContentProps {
  className?: string;
  style?: CSSProperties;
  title: string;
  children?: React.ReactNode;
}

export const EditWidgetDialogContent = ({
  className,
  style,
  title,
  children,
}: EditWidgetDialogContentProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className={`flex flex-col gap-4 py-4 ${className}`} style={style}>
        {children}
      </div>
    </>
  );
};

export const EditWidgetDialogContentSkeleton = ({
  title,
  count,
}: {
  title: string;
  count: number;
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        {Array.from({ length: count }).map((_, index) => (
          <WrapPlaceholder key={index}>
            <EditWidgetDialogOptionSkeleton>
              <Skeleton className="h-9 w-full min-w-[140px] rounded-md" />
            </EditWidgetDialogOptionSkeleton>
            {index !== count - 1 && <EditWidgetDialogSeparator />}
          </WrapPlaceholder>
        ))}
      </div>
    </>
  );
};
