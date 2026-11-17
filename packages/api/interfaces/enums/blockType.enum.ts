export enum BlockType {
  Paragraph = "paragraph",
  Heading = "heading",
  Quote = "quote",
  BulletListItem = "bulletListItem",
  NumberedListItem = "numberedListItem",
  CheckListItem = "checkListItem",
  ToggleListItem = "toggleListItem",
  Image = "image",
  Video = "video",
  Audio = "audio",
  File = "file",
  Table = "table",
  CodeBlock = "codeBlock",
}

export const AllBlockTypes: BlockType[] = Object.values(BlockType);
export const AllBlockTypeStrings = AllBlockTypes.map(
  blockType => `${blockType}`
) as `${BlockType}`[];
