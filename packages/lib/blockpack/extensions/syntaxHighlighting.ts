import { SyntaxHighlightingExtension } from "@blocknote/core/extensions";
import { getCodeHighlighter } from "../../code/codeHighlighter";

export const syntaxHighlighting = SyntaxHighlightingExtension({
  createHighlighter: getCodeHighlighter,
});
