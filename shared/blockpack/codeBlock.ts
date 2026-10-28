import { createCodeBlockSpec } from "@blocknote/core";
import { codeLanguages, getCodeLanguage } from "../lib/codeHighlighter";

const base = createCodeBlockSpec({
  defaultLanguage: "text",
  supportedLanguages: codeLanguages,
});

export const codeBlockSpec: typeof base = {
  ...base,
  implementation: {
    ...base.implementation,
    render(block, editor) {
      const language = block.props.language;
      const canonical = getCodeLanguage(language);
      // Old documents and imported fences can contain aliases or unknown languages.
      // Extend only the rendered picker; never rewrite the persisted property.
      const spec = Object.hasOwn(codeLanguages, language)
        ? base
        : createCodeBlockSpec({
            supportedLanguages: {
              ...codeLanguages,
              [language]: {
                name: canonical
                  ? codeLanguages[canonical].name
                  : language || codeLanguages.text.name,
              },
            },
          });
      const view = spec.implementation.render.call(this, block, editor);
      view.dom
        .querySelector("select")
        ?.setAttribute(
          "aria-label",
          editor.dictionary.slash_menu.code_block.title
        );
      return view;
    },
    meta: {
      ...base.implementation.meta,
      highlight: block => getCodeLanguage(block.props.language),
    },
  },
};
