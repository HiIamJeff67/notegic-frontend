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
      className={`w-full h-full flex justify-center items-center overflow-hidden p-1 pt-4 sm:p-2 sm:pt-8 ${className}`}
      style={style}
    >
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full h-full bg-card m-0 p-0 [--cell-size:1.5rem] lg:[--cell-size:2.25rem] xs:[--cell-size:1.5rem]"
        classNames={{
          root: "w-full h-full flex flex-col",
          dropdowns: "flex justify-center gap-1",
          caption_label:
            "flex items-center gap-1 text-sm sm:text-base h-full px-1 [&>svg]:size-4 sm:[&>svg]:size-5",
          months: "flex-1 w-full flex flex-col relative",
          table: "w-full flex-1 flex flex-col table-fixed",
          head_row: "flex w-full justify-between pb-1",
          row: "flex w-full justify-between mt-1 flex-1",
          weekday:
            "flex-1 !size-auto text-muted-foreground rounded-md font-normal text-[0.65rem] sm:text-[0.8rem] text-center",
          day: "flex-1 !size-auto p-0 flex items-center justify-center text-center [&_button]:text-xs sm:[&_button]:text-sm [&_button]:w-full [&_button]:h-full [&_button]:p-0",
          nav: "flex justify-between items-center w-full absolute top-0 inset-x-0",
        }}
        captionLayout="dropdown"
        fixedWeeks
        required
      />
    </div>
  );
};

export default CalendarWidget;
