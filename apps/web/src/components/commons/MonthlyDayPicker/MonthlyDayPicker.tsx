import { cn } from "@shared/util/utils";
import { Button } from "@/components/ui/button";

interface MonthlyDayPickerProps {
  value: {
    start: number;
    end: number;
  };
  onValueChange: (value: { start: number; end: number }) => void;
  className?: string;
}

const MonthlyDayPicker = ({
  value,
  onValueChange,
  className,
}: MonthlyDayPickerProps) => {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {Array.from({ length: 28 }, (_, index) => index + 1).map(day => {
        const isSelected = day >= value.start && day <= value.end;

        return (
          <Button
            key={day}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="h-8 w-9 rounded-sm px-0 text-xs tabular-nums"
            onClick={() => {
              if (day < value.start) {
                onValueChange({
                  start: day,
                  end: value.end,
                });
                return;
              }
              if (day > value.end) {
                onValueChange({
                  start: value.start,
                  end: day,
                });
                return;
              }
              onValueChange({
                start: day,
                end: day,
              });
            }}
          >
            {day}
          </Button>
        );
      })}
    </div>
  );
};

export default MonthlyDayPicker;
