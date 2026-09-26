import { codeBlockShortcut } from "./codeblock";
import { headingShortcuts } from "./heading";

export const blockPackShortcutExtensions = [
  codeBlockShortcut,
  headingShortcuts,
] as const;
