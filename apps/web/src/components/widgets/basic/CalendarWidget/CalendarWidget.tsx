import { cn } from "@shared/lib/className/cn";
import { CSSProperties, useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export interface CalendarWidgetProps {
  className?: string;
  style?: CSSProperties;
}

const CalendarWidget = ({ className, style }: CalendarWidgetProps) => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div
      className={cn(
        "h-full min-h-0 w-full min-w-0 overflow-hidden p-2",
        className
      )}
      style={style}
    >
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="m-0 h-full w-full bg-transparent p-0 [--cell-size:1.5rem]"
        classNames={{
          root: "flex h-full min-h-0 w-full min-w-0 flex-col",
          dropdowns: "flex h-full min-w-0 items-center justify-center gap-1",
          caption_label:
            "flex h-full items-center gap-1 px-1 text-xs [&>svg]:size-3",
          months: "relative flex min-h-0 w-full flex-1 flex-col",
          month: "flex min-h-0 w-full flex-1 flex-col gap-2",
          month_grid:
            "grid min-h-0 w-full flex-1 grid-rows-[auto_minmax(0,1fr)]",
          weekdays: "grid grid-cols-7 pb-1",
          weeks: "grid min-h-0 grid-rows-6 [container-type:size]",
          week: "grid min-h-0 grid-cols-7",
          weekday:
            "min-w-0 text-center text-xs font-normal text-muted-foreground",
          day: "relative aspect-square w-full max-w-[calc(100cqh/6)] min-w-0 place-self-center rounded-md p-0 text-center [&_button]:size-full [&_button]:min-w-0 [&_button]:aspect-square [&_button]:p-0 [&_button]:text-sm",
          today: "rounded-md bg-accent text-accent-foreground",
        }}
        captionLayout="dropdown"
        fixedWeeks
        required
      />
    </div>
  );
};

export default CalendarWidget;
