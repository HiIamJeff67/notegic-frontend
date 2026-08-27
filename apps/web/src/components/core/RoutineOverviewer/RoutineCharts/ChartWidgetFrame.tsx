import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartWidgetFrameProps<TValue extends string> {
  title: string;
  value: TValue;
  options: { value: TValue; label: string }[];
  onValueChange: (value: TValue) => void;
  onRemove: () => void;
  children: ReactNode;
}

export function ChartWidgetFrame<TValue extends string>({
  title,
  value,
  options,
  onValueChange,
  onRemove,
  children,
}: ChartWidgetFrameProps<TValue>) {
  const { t } = useTranslation();

  return (
    <article className="flex min-h-[360px] min-w-0 flex-col overflow-hidden rounded-md border border-border/60 bg-secondary p-4">
      <header className="mb-3 flex min-w-0 items-center justify-between gap-3 border-b border-border/50 pb-3">
        <h3 className="truncate text-sm font-medium text-foreground">
          {title}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <Select
            value={value}
            onValueChange={nextValue => onValueChange(nextValue as TValue)}
          >
            <SelectTrigger
              aria-label={t("workspace.charts.selectChart", { title })}
              className="h-8 max-w-[220px] min-w-0 rounded-sm text-xs"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            aria-label={t("workspace.charts.removeChart", { title })}
            className="size-8 rounded-sm"
            onClick={onRemove}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </article>
  );
}
