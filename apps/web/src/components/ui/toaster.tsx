import { CircleCheck, Info, OctagonX, TriangleAlert } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const iconByVariant = {
  default: Info,
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  destructive: OctagonX,
} as const;

const Toaster = () => {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(
        ({ id, title, description, variant = "default", duration }, index) => {
          const Icon = iconByVariant[variant];
          return (
            <Toast
              className="absolute right-4 bottom-4 w-[calc(100%-2rem)] origin-bottom-right transition-[transform,opacity] duration-300 sm:right-4 sm:w-[calc(100%-2rem)]"
              duration={duration ?? 5000}
              key={id}
              style={{
                zIndex: toasts.length - index,
                opacity: Math.max(0.55, 1 - index * 0.1),
                transform: `translateY(-${index * 10}px) scale(${Math.max(0.84, 1 - index * 0.04)})`,
              }}
              variant={variant}
              onOpenChange={open => {
                if (!open) dismiss(id);
              }}
            >
              <Icon className="mt-0.5 size-4 shrink-0" data-toast-icon="" />
              <div className="grid flex-1 gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              <ToastClose aria-label="Close" />
            </Toast>
          );
        }
      )}
      <ToastViewport />
    </ToastProvider>
  );
};

export { Toaster };
