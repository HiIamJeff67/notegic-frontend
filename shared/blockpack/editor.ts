import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  type PartialBlock,
} from "@blocknote/core";
import {
  CollaborationExtension,
  type CollaborationOptions,
} from "@blocknote/core/yjs";

export const createNotegicBlockPackSchema = () =>
  BlockNoteSchema.create({
    blockSpecs: NotegicBlockPackEditor.notegicBlockNoteBlockSpecs,
    inlineContentSpecs: defaultInlineContentSpecs,
    styleSpecs: defaultStyleSpecs,
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
    codeBlock: defaultBlockSpecs.codeBlock,
  } as const;

  static create({
    initialContent,
    trailingBlock = false,
    schema,
    collaboration,
  }: NotegicBlockPackEditorOptions) {
    return BlockNoteEditor.create({
      schema: schema ?? createNotegicBlockPackSchema(),
      ...(collaboration ? {} : { initialContent }),
      ...(collaboration
        ? { extensions: [CollaborationExtension(collaboration)] }
        : {}),
      trailingBlock,
    }) as BlockNoteEditor<any, any, any>;
  }
}
