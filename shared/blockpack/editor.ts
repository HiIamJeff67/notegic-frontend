import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  type PartialBlock,
} from "@blocknote/core";
import { SyntaxHighlightingExtension } from "@blocknote/core/extensions";
import {
  CollaborationExtension,
  type CollaborationOptions,
} from "@blocknote/core/yjs";
import { getCodeHighlighter } from "../lib/codeHighlighter";
import { codeBlockSpec } from "./codeBlock";
import { blockPackShortcutExtensions } from "./extensions/shortcuts/shortcut";

const syntaxHighlighting = SyntaxHighlightingExtension({
  createHighlighter: getCodeHighlighter,
});

type NotegicBlockPackEditorOptions = {
  initialContent?: PartialBlock<any, any, any>[];
  trailingBlock?: boolean;
  schema?: BlockNoteSchema<any, any, any>;
  collaboration?: CollaborationOptions;
};

export class NotegicBlockPackEditor {
  static notegicBlockNoteBlockSpecs = {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    quote: defaultBlockSpecs.quote,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    toggleListItem: defaultBlockSpecs.toggleListItem,
    image: defaultBlockSpecs.image,
    video: defaultBlockSpecs.video,
    audio: defaultBlockSpecs.audio,
    file: defaultBlockSpecs.file,
    table: defaultBlockSpecs.table,
    codeBlock: codeBlockSpec,
  } as const;

  static create({
    initialContent,
    trailingBlock = true,
    schema,
    collaboration,
  }: NotegicBlockPackEditorOptions) {
    return BlockNoteEditor.create({
      schema:
        schema ??
        BlockNoteSchema.create({
          blockSpecs: this.notegicBlockNoteBlockSpecs,
          inlineContentSpecs: defaultInlineContentSpecs,
          styleSpecs: defaultStyleSpecs,
        }),
      ...(collaboration ? {} : { initialContent }),
      ...(collaboration
        ? {
            extensions: [
              syntaxHighlighting,
              ...blockPackShortcutExtensions,
              CollaborationExtension(collaboration),
            ],
          }
        : { extensions: [syntaxHighlighting, ...blockPackShortcutExtensions] }),
      trailingBlock,
    }) as BlockNoteEditor<any, any, any>;
  }
}
