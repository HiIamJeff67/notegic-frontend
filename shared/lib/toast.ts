import type { ReactNode } from "react";
import { toastManager } from "@/components/ui/toast";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastOptions = {
  description?: ReactNode;
  duration?: number;
  position?: ToastPosition;
  variant?: "default" | "success" | "info" | "warning" | "destructive";
};

const createToast = (
  message: ReactNode,
  {
    description,
    duration,
    position = "bottom-right",
    variant = "default",
  }: ToastOptions = {}
) => {
  if (
    (variant === "success" || variant === "destructive") &&
    typeof message === "string" &&
    message.trim() === ""
  )
    return "";
  const id = toastManager.add({
    title: message,
    description,
    type:
      variant === "destructive"
        ? "error"
        : variant === "default"
          ? undefined
          : variant,
    timeout:
      duration === Infinity
        ? 0
        : (duration ??
          (variant === "success" ? 2000 : variant === "info" ? 3000 : 5000)),
    data: { position },
  });
  return { id, dismiss: () => toastManager.close(id) };
};

const toast = Object.assign(createToast, {
  dismiss: toastManager.close,
  info: (message: ReactNode, options?: Omit<ToastOptions, "variant">) =>
    createToast(message, { ...options, variant: "info" }),
  warning: (message: ReactNode, options?: Omit<ToastOptions, "variant">) =>
    createToast(message, { ...options, variant: "warning" }),
  error: (message: ReactNode, options?: Omit<ToastOptions, "variant">) =>
    createToast(message, { ...options, variant: "destructive" }),
  success: (message: ReactNode, options?: Omit<ToastOptions, "variant">) =>
    createToast(message, { ...options, variant: "success" }),
});

export default toast;
