import { cn } from "@shared/util/utils";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocalPreferences } from "@/hooks/localPreferences";

interface HoverDetailCardProps {
  title: ReactNode;
  id?: string;
  subtitle?: ReactNode;
  rows: Array<{
    field: ReactNode;
    value: ReactNode;
  }>;
  className?: string;
}

const HoverDetailCard = ({
  title,
  id,
  subtitle,
  rows,
  className,
}: HoverDetailCardProps) => {
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();

  if (preferences.privatePreviews) {
    return (
      <div className={cn("flex min-w-0 flex-col", className)}>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {t("workspace.accessibility.privatePreview")}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {t("workspace.accessibility.privatePreviewDescription")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="min-w-0 border-b border-border/70 pb-2">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          {subtitle && <span className="shrink-0">{subtitle}</span>}
          {subtitle && id && <span className="shrink-0">·</span>}
          {id && <span className="truncate font-mono">{id}</span>}
        </div>
      </div>
      <div className="mt-2 flex flex-col">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid h-7 min-w-0 grid-cols-[92px_minmax(0,1fr)] items-center gap-3"
          >
            <span className="truncate text-muted-foreground">{row.field}</span>
            <span className="min-w-0 truncate text-right tabular-nums [&>*]:min-w-0 [&>*]:truncate">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HoverDetailCard;
