import {
  type BlockNoteEditor,
  BlockNoteSchema,
  combineByGroup,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core/extensions";
import {
  createReactDiagramBlockSpec,
  getDiagramSlashMenuItems,
} from "@blocknote/diagram-block";
import {
  createReactInlineMathSpec,
  createReactMathBlockSpec,
  getMathSlashMenuItems,
} from "@blocknote/math-block";
import {
  createReactBlockSpec,
  getDefaultReactSlashMenuItems,
  type ReactCustomBlockRenderProps,
  SuggestionMenuController,
} from "@blocknote/react";
import { NotegicBlockPackEditor } from "@shared/blockpack/core";
import { format } from "date-fns";
import { CalendarDaysIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";

const calendarPropSchema = {
  calendarId: { default: "" },
  anchorDate: { default: "" },
  timezone: { default: "UTC" },
  view: { default: "month", values: ["month"] as const },
} as const;

const monthKey = (date: Date) => format(date, "yyyy-MM-01");

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
        props: { anchorDate: monthKey(nextMonth) },
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
      <Calendar
        mode="single"
        month={month}
        onMonthChange={handleMonthChange}
        className="mx-auto"
      />
    </div>
  );
};

export const calendarBlockSpec = createReactBlockSpec(calendarBlockConfig, {
  render: props => <CalendarBlock {...props} />,
})();

const calendarSlashMenuItems = (editor: BlockNoteEditor<any, any, any>) => [
  {
    title: "Calendar",
    subtext: "Insert a calendar block",
    aliases: ["calendar", "schedule"],
    group: "Basic blocks",
    icon: <CalendarDaysIcon size={18} aria-hidden="true" />,
    onItemClick: () =>
      insertOrUpdateBlockForSlashMenu(editor, {
        type: "calendar",
        props: {
          anchorDate: monthKey(new Date()),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          view: "month",
        },
      }),
  },
];

export const notegicBlockPackSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...NotegicBlockPackEditor.notegicBlockNoteBlockSpecs,
    mathBlock: createReactMathBlockSpec(),
    diagram: createReactDiagramBlockSpec(),
    calendar: calendarBlockSpec,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    math: createReactInlineMathSpec(),
  },
  styleSpecs: defaultStyleSpecs,
});

export const getNotegicSlashMenuItems =
  (editor: BlockNoteEditor<any, any, any>) => async (query: string) =>
    filterSuggestionItems(
      combineByGroup(
        getDefaultReactSlashMenuItems(editor),
        getMathSlashMenuItems(editor),
        getDiagramSlashMenuItems(editor),
        calendarSlashMenuItems(editor)
      ),
      query
    );

export const NotegicSlashMenuController = ({
  editor,
}: {
  editor: BlockNoteEditor<any, any, any>;
}) => (
  <SuggestionMenuController
    triggerCharacter="/"
    getItems={getNotegicSlashMenuItems(editor)}
  />
);
