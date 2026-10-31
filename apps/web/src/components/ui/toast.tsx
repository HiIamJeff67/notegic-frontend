"use client";

// Adapted from shadcn/ui's Base UI Toast: https://ui.shadcn.com/docs/components/base/toast.
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import type { ToastPosition } from "@shared/lib/toast/toast";
import { cn } from "@shared/lib/className/cn";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const toastManager = ToastPrimitive.createToastManager<{
  position?: ToastPosition;
}>();
const ToastProvider = ToastPrimitive.Provider;
const ToastPortal = ToastPrimitive.Portal;
const useToastManager = ToastPrimitive.useToastManager;

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 top-4 z-[100] mx-auto w-auto max-w-sm outline-none",
        className
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute top-0 z-[calc(1000-var(--toast-index))] w-full origin-top rounded-md bg-background text-foreground shadow-lg outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
        "[--toast-stack-index:var(--toast-index)] [--toast-stack-offset:var(--toast-offset-y)] [--toast-stack-direction:1] [--toast-gap:0.5rem] sm:[--toast-stack-index:var(--toast-position-index)] sm:[--toast-stack-offset:var(--toast-position-offset)]",
        "opacity-100 [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--toast-stack-index)*var(--toast-stack-direction)*10px))_scale(max(0.84,calc(1-var(--toast-stack-index)*0.04)))] transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1.15,0.3,1)] motion-reduce:transition-none",
        "data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-stack-offset)+var(--toast-stack-index)*var(--toast-gap))*var(--toast-stack-direction)))] data-limited:invisible data-limited:pointer-events-none data-ending-style:pointer-events-none",
        "data-starting-style:[transform:translateY(calc((100%+1rem)*var(--toast-stack-direction)*-1))_scale(0.94)] data-ending-style:duration-[160ms] data-ending-style:ease-in",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(calc((100%+1rem)*var(--toast-stack-direction)*-1))_scale(0.96)]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-stack-offset)+var(--toast-stack-index)*var(--toast-gap))*var(--toast-stack-direction)))]",
        "before:absolute before:inset-x-0 before:top-full before:h-(--toast-gap) before:content-[''] after:absolute after:inset-x-0 after:bottom-full after:h-(--toast-gap) after:content-['']",
        className
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex items-start gap-3 overflow-hidden p-4 pr-10",
        className
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon" className="size-6 p-0" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      render={render}
      className={cn(
        "absolute top-2 right-2 text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-4" />}
    </ToastPrimitive.Close>
  );
}

export {
  Toast,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastManager,
  useToastManager,
};
