import { createExtension, type BlockNoteEditor } from "@blocknote/core";

type ShortcutContext = {
  editor: BlockNoteEditor<any, any, any>;
};

const setCurrentBlockToHeading = (
  { editor }: ShortcutContext,
  level: number
) => {
  const cursorPosition = editor.getTextCursorPosition();
  const blockSchema = editor.schema.blockSchema[cursorPosition.block.type];

  if (blockSchema.content !== "inline") {
    return false;
  }

  editor.updateBlock(cursorPosition.block, {
    type: "heading",
    props: { level },
  });
  return true;
};

export const headingShortcuts = createExtension({
  key: "notegic-block-pack-heading-shortcuts",
  keyboardShortcuts: Object.fromEntries(
    [1, 2, 3, 4, 5, 6].map(level => [
      `Ctrl-Alt-${level}`,
      ({ editor }: ShortcutContext) =>
        setCurrentBlockToHeading({ editor }, level),
    ])
  ),
});
