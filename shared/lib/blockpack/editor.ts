import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  type PartialBlock,
} from "@blocknote/core";
import { createReactDiagramBlockSpec } from "@blocknote/diagram-block";
import {
  createReactInlineMathSpec,
  createReactMathBlockSpec,
} from "@blocknote/math-block";
import { codeBlockShortcut } from "./extensions/codeblock";
import {
  CollaborationExtension,
  type CollaborationOptions,
} from "./extensions/collaboration";
import { headingShortcuts } from "./extensions/heading";
import { syntaxHighlighting } from "./extensions/syntaxHighlighting";
import { calendarBlockSpec } from "./specs/calendar.spec";
import { codeBlockSpec } from "./specs/codeBlock.spec";

export const createBlockPackSchema = () =>
  BlockNoteSchema.create({
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
      schema: schema ?? createBlockPackSchema(),
      ...(collaboration ? {} : { initialContent }),
      ...(collaboration
        ? {
            extensions: [
              syntaxHighlighting,
              codeBlockShortcut,
              headingShortcuts,
              CollaborationExtension(collaboration),
            ],
          }
        : {
            extensions: [
              syntaxHighlighting,
              codeBlockShortcut,
              headingShortcuts,
            ],
          }),
      trailingBlock,
    }) as BlockNoteEditor<any, any, any>;
  }
}

export const notegicBlockPackSchema = createBlockPackSchema();
