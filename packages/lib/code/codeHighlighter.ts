import type { GrammarState, HighlighterGeneric } from "shiki/core";

export const codeLanguages = {
  text: { name: "Plain text", aliases: ["plaintext", "txt", "none"] },
  javascript: { name: "JavaScript", aliases: ["js"] },
  typescript: { name: "TypeScript", aliases: ["ts"] },
  jsx: { name: "JSX", aliases: [] },
  tsx: { name: "TSX", aliases: [] },
  json: { name: "JSON", aliases: [] },
  html: { name: "HTML", aliases: [] },
  css: { name: "CSS", aliases: [] },
  shellscript: { name: "Shell", aliases: ["bash", "sh", "shell", "curl"] },
  http: { name: "HTTP", aliases: [] },
  python: { name: "Python", aliases: ["py"] },
  go: { name: "Go", aliases: [] },
  rust: { name: "Rust", aliases: ["rs"] },
  java: { name: "Java", aliases: [] },
  c: { name: "C", aliases: [] },
  cpp: { name: "C++", aliases: ["c++"] },
  csharp: { name: "C#", aliases: ["cs", "c#"] },
  sql: { name: "SQL", aliases: [] },
  yaml: { name: "YAML", aliases: ["yml"] },
  markdown: { name: "Markdown", aliases: ["md"] },
  latex: { name: "LaTeX", aliases: ["tex"] },
  mermaid: { name: "Mermaid", aliases: [] },
} satisfies Record<string, { name: string; aliases: string[] }>;

const languages = {
  javascript: () => import("shiki/langs/javascript.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  shellscript: () => import("shiki/langs/shellscript.mjs"),
  http: () => import("shiki/langs/http.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  go: () => import("shiki/langs/go.mjs"),
  rust: () => import("shiki/langs/rust.mjs"),
  java: () => import("shiki/langs/java.mjs"),
  c: () => import("shiki/langs/c.mjs"),
  cpp: () => import("shiki/langs/cpp.mjs"),
  csharp: () => import("shiki/langs/csharp.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  latex: () => import("shiki/langs/latex.mjs"),
  mermaid: () => import("shiki/langs/mermaid.mjs"),
} satisfies Record<Exclude<keyof typeof codeLanguages, "text">, unknown>;

let highlighter:
  | Promise<HighlighterGeneric<string, "github-light" | "github-dark">>
  | undefined;

export function getCodeHighlighter() {
  highlighter ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
  ]).then(([{ createBundledHighlighter }, { createJavaScriptRegexEngine }]) =>
    createBundledHighlighter({
      langs: Object.fromEntries(
        Object.entries(languages).flatMap(([id, load]) =>
          [id, ...codeLanguages[id as keyof typeof languages].aliases].map(
            alias => [alias, load]
          )
        )
      ),
      themes: {
        "github-light": () => import("shiki/themes/github-light.mjs"),
        "github-dark": () => import("shiki/themes/github-dark.mjs"),
      },
      engine: () => createJavaScriptRegexEngine({ forgiving: true }),
    })({ themes: ["github-light", "github-dark"], langs: [] })
  );

  return highlighter;
}

export function getCodeLanguage(language: string) {
  const name = language.trim().toLowerCase();
  return (Object.keys(codeLanguages) as Array<keyof typeof codeLanguages>).find(
    id => id === name || codeLanguages[id].aliases.some(alias => alias === name)
  );
}

export async function loadHighlighter(language: string) {
  const name = language.trim().toLowerCase();
  const lang = getCodeLanguage(language);

  if (!lang && name !== "ansi") return null;

  const shiki = await getCodeHighlighter();
  const selected = lang ?? "ansi";
  if (selected !== "text" && selected !== "ansi") {
    await shiki.loadLanguage(selected);
  }

  return {
    highlight(code: string, state?: GrammarState) {
      const tokenize = (text: string) =>
        shiki.codeToTokens(text, {
          lang: selected,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
          grammarState: state,
        }).tokens;
      const tokens =
        selected === "ansi"
          ? code.split("\n").flatMap(line => tokenize(line))
          : tokenize(code);
      return { lines: tokens, state: shiki.getLastGrammarState(tokens) };
    },
  };
}
