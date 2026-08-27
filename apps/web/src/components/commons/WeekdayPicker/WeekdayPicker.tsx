import { cn } from "@shared/util/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface WeekdayPickerProps {
  value: {
    start: number;
    end: number;
  };
  onValueChange: (value: { start: number; end: number }) => void;
  className?: string;
}

const WeekdayPicker = ({
  value,
  onValueChange,
  className,
}: WeekdayPickerProps) => {
  const { t } = useTranslation();
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {[
        { value: 1, label: t("workspace.accessibility.monday") },
        { value: 2, label: t("workspace.accessibility.tuesday") },
        { value: 3, label: t("workspace.accessibility.wednesday") },
        { value: 4, label: t("workspace.accessibility.thursday") },
        { value: 5, label: t("workspace.accessibility.friday") },
        { value: 6, label: t("workspace.accessibility.saturday") },
        { value: 7, label: t("workspace.accessibility.sunday") },
      ].map(weekday => {
        const isSelected =
          weekday.value >= value.start && weekday.value <= value.end;

        return (
          <Button
            key={weekday.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="h-8 min-w-12 rounded-sm px-2 text-xs"
            onClick={() => {
              if (weekday.value < value.start) {
                onValueChange({
                  start: weekday.value,
                  end: value.end,
                });
                return;
              }
              if (weekday.value > value.end) {
                onValueChange({
                  start: value.start,
                  end: weekday.value,
                });
                return;
              }
              onValueChange({
                start: weekday.value,
                end: weekday.value,
              });
            }}
          >
            {weekday.label}
          </Button>
        );
      })}
    </div>
  );
};

export default WeekdayPicker;
