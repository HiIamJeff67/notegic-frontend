import { useTranslation } from "@shared/i18n/useTranslation";
import { cn } from "@shared/lib/className/cn";
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const { t } = useTranslation();

  return (
    <Loader2Icon
      role="status"
      aria-label={t("common.loading")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
