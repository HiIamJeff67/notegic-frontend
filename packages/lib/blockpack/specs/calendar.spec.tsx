import {
  createReactBlockSpec,
  type ReactCustomBlockRenderProps,
} from "@blocknote/react";
import { format } from "date-fns";
import { CalendarDaysIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import styles from "react-day-picker/style.module.css";

const calendarPropSchema = {
  calendarId: { default: "" },
  anchorDate: { default: "" },
  timezone: { default: "UTC" },
  view: { default: "month", values: ["month"] as const },
} as const;

const calendarBlockConfig = {
  type: "calendar" as const,
  propSchema: calendarPropSchema,
  content: "none" as const,
};

type CalendarBlockRenderProps = ReactCustomBlockRenderProps<
  typeof calendarBlockConfig
>;

const CalendarBlock = ({ block, editor }: CalendarBlockRenderProps) => {
  const initialMonth = useMemo(() => {
    if (!block.props.anchorDate) return new Date();

    const date = new Date(`${block.props.anchorDate}T00:00:00`);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }, [block.props.anchorDate]);
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => setMonth(initialMonth), [initialMonth]);

  const handleMonthChange = (nextMonth: Date) => {
    setMonth(nextMonth);
    if (editor.isEditable) {
      editor.updateBlock(block, {
        props: { anchorDate: format(nextMonth, "yyyy-MM-01") },
      });
    }
  };

  return (
    <div
      className="not-prose my-2 overflow-hidden rounded-lg border bg-card"
      contentEditable={false}
      data-calendar-id={block.props.calendarId || undefined}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
        <CalendarDaysIcon className="size-4" aria-hidden="true" />
        <span>Calendar</span>
      </div>
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={handleMonthChange}
        showOutsideDays
        classNames={{
          ...styles,
          day_button: `${styles.day_button} hover:bg-accent`,
          button_next: `${styles.button_next} hover:bg-accent rounded-md`,
          button_previous: `${styles.button_previous} hover:bg-accent rounded-md`,
        }}
        className="mx-auto w-fit p-3 [--rdp-accent-color:var(--primary)] [--rdp-accent-background-color:var(--accent)]"
      />
    </div>
  );
};

export const calendarBlockSpec = createReactBlockSpec(calendarBlockConfig, {
  render: props => <CalendarBlock {...props} />,
})();
