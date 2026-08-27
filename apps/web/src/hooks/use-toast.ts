import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type ToastVariant = "default" | "success" | "info" | "warning" | "destructive";

type ToastOptions = {
  description?: ReactNode;
  duration?: number;
  variant?: ToastVariant;
};

type ToastItem = ToastOptions & {
  id: string;
  title?: ReactNode;
};

type ToastState = {
  toasts: ToastItem[];
};

const TOAST_LIMIT = 4;
let count = 0;
let memoryState: ToastState = { toasts: [] };
const listeners = new Set<(state: ToastState) => void>();

const emit = (state: ToastState) => {
  memoryState = state;
  for (const listener of listeners) listener(memoryState);
};

const dismiss = (id?: string) => {
  emit({
    toasts: id ? memoryState.toasts.filter(toast => toast.id !== id) : [],
  });
};

const toast = (title?: ReactNode, options: ToastOptions = {}) => {
  const id = `${Date.now()}-${count++}`;
  const item: ToastItem = { ...options, id, title };
  emit({ toasts: [item, ...memoryState.toasts].slice(0, TOAST_LIMIT) });
  return { id, dismiss: () => dismiss(id) };
};

const typedToast =
  (variant: ToastVariant) =>
  (title: ReactNode, options?: Omit<ToastOptions, "variant">) =>
    toast(title, { ...options, variant });

const toastApi = Object.assign(toast, {
  dismiss,
  success: typedToast("success"),
  error: typedToast("destructive"),
  info: typedToast("info"),
  warning: typedToast("warning"),
});

const useToast = () => {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return { ...state, dismiss, toast: toastApi };
};

export type { ToastItem, ToastOptions, ToastVariant };
export { toastApi as toast, useToast };
