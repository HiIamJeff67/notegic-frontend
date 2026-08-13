import type { ReactNode } from "react";
import { type ToastOptions, toast as uiToast } from "@/hooks/use-toast";

const toast = Object.assign(
  (message: ReactNode, options?: ToastOptions) => uiToast(message, options),
  {
    dismiss: uiToast.dismiss,
    info: uiToast.info,
    warning: uiToast.warning,
    error: (message: ReactNode, options?: Omit<ToastOptions, "variant">) => {
      if (typeof message === "string" && message.trim() === "") {
        return "";
      }

      return uiToast.error(message, options);
    },

    success: (message: ReactNode, options?: Omit<ToastOptions, "variant">) => {
      if (typeof message === "string" && message.trim() === "") {
        return "";
      }

      return uiToast.success(message, options);
    },
  }
);

export default toast;
