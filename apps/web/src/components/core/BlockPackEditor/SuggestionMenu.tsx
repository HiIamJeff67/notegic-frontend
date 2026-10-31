import { type BlockNoteEditor, combineByGroup } from "@blocknote/core";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core/extensions";
import { getDiagramSlashMenuItems } from "@blocknote/diagram-block";
import { getMathSlashMenuItems } from "@blocknote/math-block";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";
import { format } from "date-fns";
import { CalendarDaysIcon } from "lucide-react";

const calendarSuggestionItems = (editor: BlockNoteEditor<any, any, any>) => [
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
          anchorDate: format(new Date(), "yyyy-MM-01"),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          view: "month",
        },
      }),
  },
];

export const getSuggestionItems =
  (editor: BlockNoteEditor<any, any, any>) => async (query: string) =>
    filterSuggestionItems(
      combineByGroup(
        getDefaultReactSlashMenuItems(editor).map(item =>
          item.title === editor.dictionary.slash_menu.code_block.title
            ? {
                ...item,
                aliases: [...(item.aliases ?? []), "codeblock"],
              }
            : item
        ),
        getMathSlashMenuItems(editor),
        getDiagramSlashMenuItems(editor),
        calendarSuggestionItems(editor)
      ),
      query
    );

export const SuggestionMenu = ({
  editor,
}: {
  editor: BlockNoteEditor<any, any, any>;
}) => (
  <SuggestionMenuController
    triggerCharacter="/"
    getItems={getSuggestionItems(editor)}
  />
);
