import { useTranslation } from "@shared/i18n/useTranslation";
import type { ToastPosition } from "@shared/lib/toast";
import { cn } from "@shared/util/utils";
import { CircleCheck, Info, OctagonX, TriangleAlert } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
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
} from "@/components/ui/toast";

const iconByType = {
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  error: OctagonX,
};
const positionClasses = {
  "top-left": "sm:top-4 sm:right-auto sm:left-4 sm:origin-top-left",
  "top-center": "",
  "top-right": "sm:top-4 sm:right-4 sm:left-auto sm:origin-top-right",
  "bottom-left":
    "sm:top-auto sm:right-auto sm:bottom-4 sm:left-4 sm:origin-bottom-left sm:[--toast-stack-direction:-1]",
  "bottom-center":
    "sm:top-auto sm:right-auto sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:origin-bottom sm:[--toast-stack-direction:-1]",
  "bottom-right":
    "sm:top-auto sm:right-4 sm:bottom-4 sm:left-auto sm:origin-bottom-right sm:[--toast-stack-direction:-1]",
} satisfies Record<ToastPosition, string>;

function ToastList() {
  const { t } = useTranslation();
  const { toasts } = useToastManager<{ position?: ToastPosition }>();
  return toasts.map((item, index) => {
    const position = item.data?.position ?? "top-center";
    const previous = toasts
      .slice(0, index)
      .filter(
        other =>
          !other.limited &&
          other.transitionStatus !== "ending" &&
          (other.data?.position ?? "top-center") === position
      );
    const Icon = iconByType[item.type as keyof typeof iconByType] ?? Info;
    return (
      <Toast
        key={item.id}
        toast={item}
        data-position={position}
        swipeDirection="right"
        className={cn(
          position !== "top-center" &&
            "sm:fixed sm:w-[calc(100%-2rem)] sm:max-w-sm",
          positionClasses[position]
        )}
        style={
          {
            "--toast-position-index": previous.length,
            "--toast-position-offset": `${previous.reduce((height, other) => height + (other.height ?? 0), 0)}px`,
          } as CSSProperties
        }
      >
        <ToastContent>
          <Icon
            aria-hidden="true"
            data-toast-icon=""
            className={cn(
              "mt-0.5 size-4 shrink-0",
              item.type === "success" && "text-emerald-500",
              item.type === "info" && "text-sky-500",
              item.type === "warning" && "text-amber-500",
              item.type === "error" && "text-destructive"
            )}
          />
          <div className="grid min-w-0 flex-1 gap-1 break-words">
            {item.title && <ToastTitle />}
            {item.description && <ToastDescription />}
          </div>
          <ToastClose aria-label={t("common.close")} />
        </ToastContent>
      </Toast>
    );
  });
}

function Toaster({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <ToastProvider toastManager={toastManager} limit={4}>
      {children}
      <ToastPortal>
        <ToastViewport aria-label={t("workspace.navigation.notifications")}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export { Toaster };
