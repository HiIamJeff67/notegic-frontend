import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  type PartialBlock,
} from "@blocknote/core";

type NotegicBlockPackEditorOptions = {
  initialContent?: PartialBlock[];
  trailingBlock?: boolean;
  collaboration?: NonNullable<
    Parameters<typeof BlockNoteEditor.create>[0]
  >["collaboration"];
};

export class NotegicBlockPackEditor {
  private static notegicBlockNoteBlockSpecs = {
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
    collaboration,
  }: NotegicBlockPackEditorOptions) {
    return BlockNoteEditor.create({
      schema: BlockNoteSchema.create({
        blockSpecs: this.notegicBlockNoteBlockSpecs,
        inlineContentSpecs: defaultInlineContentSpecs,
        styleSpecs: defaultStyleSpecs,
      }),
      ...(collaboration ? { collaboration } : { initialContent }),
      trailingBlock,
    });
  }
}
