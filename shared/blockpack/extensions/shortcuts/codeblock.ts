import { createExtension, type BlockNoteEditor } from "@blocknote/core";

type ShortcutContext = {
  editor: BlockNoteEditor<any, any, any>;
};

const setCurrentBlockToCodeBlock = ({ editor }: ShortcutContext) => {
  const cursorPosition = editor.getTextCursorPosition();
  const blockSchema = editor.schema.blockSchema[cursorPosition.block.type];

  if (blockSchema.content !== "inline") {
    return false;
  }

  editor.updateBlock(cursorPosition.block, {
    type: "codeBlock",
    props: { language: "text" },
  });
  return true;
};

export const codeBlockShortcut = createExtension({
  key: "notegic-block-pack-code-block-shortcut",
  keyboardShortcuts: {
    "Mod-Alt-c": setCurrentBlockToCodeBlock,
    "Ctrl-Alt-c": setCurrentBlockToCodeBlock,
  },
});
