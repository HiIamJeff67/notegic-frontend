import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "apps/web/src/pages/document");
const quote = JSON.stringify;
const outputs = [];
const versions = marked
  .lexer(
    fs.readFileSync(
      path.join(directory, "versions/sources/versions.md"),
      "utf8"
    )
  )
  .filter(token => token.type !== "space");
assert.equal(versions.shift()?.text, "Versions");
const roadmap = [];
while (versions.length) {
  const heading = versions.shift();
  assert.equal(heading?.type, "heading");
  assert.equal(heading.depth, 2);
  const match = heading.text.match(/^(\d+\.\d+\.\d+) — (Next|Current|Legacy)$/);
  assert(
    match,
    "Version headings must use: ## 0.0.0 — Next, Current or Legacy"
  );
  const [, version, label] = match;
  assert(
    !roadmap.some(item => item.version === version),
    "Duplicate version: " + version
  );
  const description = versions.shift();
  assert.equal(
    description?.type,
    "paragraph",
    "Each version needs a description"
  );
  const tasks = versions.shift();
  assert.equal(tasks?.type, "list", "Each version needs a task checklist");
  roadmap.push({
    version,
    label,
    status: { Next: "next", Current: "current", Legacy: "released" }[label],
    description: description.text,
    tasks: tasks.items.map(item => {
      assert(item.task, "Version features must use Markdown checkboxes");
      const match = item.text.trim().match(/^\*\*([^\n]+)\*\*\n([\s\S]+)$/);
      assert(
        match,
        "Version features need a bold title and a description on the next line"
      );
      return {
        title: match[1],
        description: match[2].trim(),
        completed: item.checked,
      };
    }),
  });
}
assert(roadmap.length > 0, "Versions must not be empty");
const versionHeader =
  "// Generated from apps/web/src/pages/document/versions/sources/versions.md; run npm run generate:document.\n";
outputs.push([
  "versions/generated.ts",
  versionHeader +
    'import type { VersionData } from "@/components/commons/VersionCard/VersionCard";\n' +
    "export const versionRoadmap: readonly VersionData[] = " +
    quote(roadmap, null, 2) +
    ";\n",
]);
outputs.push([
  "versions/VersionsContent.tsx",
  versionHeader +
    `
import { cn } from "@shared/lib/className/cn";
import { ArticleSubParagraph, ArticleSubParagraphContent, ArticleSubParagraphHeader } from "@/components/commons/Article/Article";
import { VersionCard } from "@/components/commons/VersionCard/VersionCard";
import { versionRoadmap } from "./generated";

export const versionSections = versionRoadmap.map(version => ({
  version,
  navigation: {
    id: "version-" + version.version.replaceAll(".", "-"),
    title: "v" + version.version,
    description: version.description,
    weight: 3 as const,
    badge: <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-sans text-[10px] font-medium leading-4", version.status === "next" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{version.label}</span>,
  },
}));

const VersionsContent = () => <div className="space-y-0">
  {versionSections.map(({ version, navigation }) => (
    <ArticleSubParagraph id={navigation.id} key={navigation.id} separatorFullWidth>
      <ArticleSubParagraphHeader level={0} className="flex flex-wrap items-center gap-3 font-mono text-lg"><span>{navigation.title}</span>{navigation.badge}</ArticleSubParagraphHeader>
      <ArticleSubParagraphContent level={1}><VersionCard version={version} /></ArticleSubParagraphContent>
    </ArticleSubParagraph>
  ))}
</div>;
export default VersionsContent;
`,
]);

const privacy = marked
  .lexer(
    fs.readFileSync(
      path.join(directory, "privacy-policy/sources/privacy-policy.md"),
      "utf8"
    )
  )
  .filter(token => token.type !== "space");
const title = privacy.shift();
assert.equal(title?.type, "heading");
assert.equal(title.text, "Privacy and policy");
const updated = privacy.shift();
assert.equal(
  updated?.type,
  "paragraph",
  "Privacy policy needs its existing update date"
);
const sections = [];
const inline = tokens =>
  tokens
    .map(token => {
      if (token.type === "text" || token.type === "escape") {
        if (token.text === "{{contactEmail}}") return "{contactEmail}";
        return token.tokens
          ? inline(token.tokens)
          : "{" + quote(token.text) + "}";
      }
      if (token.type === "strong" || token.type === "em") {
        return (
          "<" +
          token.type +
          ">" +
          inline(token.tokens) +
          "</" +
          token.type +
          ">"
        );
      }
      if (token.type === "link") {
        if (token.href === "mailto:{{contactEmail}}")
          return (
            '<a href={"mailto:" + contactEmail} className="underline">' +
            inline(token.tokens) +
            "</a>"
          );
        const local =
          token.href.startsWith("/") && !token.href.startsWith("//");
        assert(
          local || ["https:", "mailto:"].includes(new URL(token.href).protocol),
          "Unsupported privacy link: " + token.href
        );
        return local
          ? '<ArticleLink className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80" href=' +
              quote(token.href) +
              ">" +
              inline(token.tokens) +
              (token.href === "/eula"
                ? '<ExternalLinkIcon className="size-3.5" />'
                : "") +
              "</ArticleLink>"
          : '<a className="underline" href=' +
              quote(token.href) +
              ">" +
              inline(token.tokens) +
              "</a>";
      }
      throw new Error("Unsupported privacy inline token: " + token.type);
    })
    .join("");
for (const token of privacy) {
  if (token.type === "heading") {
    assert.equal(token.depth, 2);
    const match = token.text.match(/^(.+) \{#(privacy-[a-z-]+)\}$/);
    assert(match, "Privacy headings must include their existing {#privacy-id}");
    assert(
      !sections.some(section => section.id === match[2]),
      "Duplicate privacy section: " + match[2]
    );
    sections.push({ id: match[2], title: match[1], content: [] });
    continue;
  }
  const section = sections.at(-1);
  assert(section, "Privacy content must belong to a section");
  if (token.type === "paragraph")
    section.content.push("<p>" + inline(token.tokens) + "</p>");
  else if (token.type === "blockquote") {
    const paragraphs = token.tokens.filter(token => token.type !== "space");
    assert(
      paragraphs.every(token => token.type === "paragraph"),
      "Privacy notes must contain paragraphs only"
    );
    section.content.push(
      paragraphs
        .map(
          token =>
            '<p className="text-sm leading-6 text-muted-foreground">' +
            inline(token.tokens) +
            "</p>"
        )
        .join("")
    );
  } else if (token.type === "list") {
    assert(
      !token.ordered && token.items.every(item => !item.task),
      "Privacy lists must be unordered prose"
    );
    section.content.push(
      '<ul className="list-disc ml-6 mt-2 space-y-1">' +
        token.items
          .map(item => {
            const paragraphs = item.tokens.filter(
              token => token.type !== "space"
            );
            assert(
              paragraphs.length === 1 &&
                ["text", "paragraph"].includes(paragraphs[0].type),
              "Nested privacy lists are unsupported"
            );
            return "<li>" + inline(paragraphs[0].tokens) + "</li>";
          })
          .join("") +
        "</ul>"
    );
  } else throw new Error("Unsupported privacy block: " + token.type);
}
assert(
  sections.length > 0 && sections.every(section => section.content.length),
  "Privacy sections must not be empty"
);
outputs.push([
  "privacy-policy/generated.ts",
  "// Generated from apps/web/src/pages/document/privacy-policy/sources/privacy-policy.md; run npm run generate:document.\n" +
    'import type { ArticleNavigationItem } from "@/components/commons/Article/Article";\n' +
    "export const privacySections = " +
    quote(
      sections.map(({ id, title }) => ({
        id,
        title: title.replace(/^\d+\. /, ""),
        description: title.replace(/^\d+\. /, ""),
        weight: 3,
      })),
      null,
      2
    ) +
    " satisfies ArticleNavigationItem[];\n",
]);
outputs.push([
  "privacy-policy/PrivacyPolicyContent.tsx",
  "// Generated from apps/web/src/pages/document/privacy-policy/sources/privacy-policy.md; run npm run generate:document.\n" +
    'import { ExternalLinkIcon } from "lucide-react";\n' +
    'import { ArticleLink, ArticleSubParagraph, ArticleSubParagraphContent, ArticleSubParagraphHeader } from "@/components/commons/Article/Article";\n' +
    'const PrivacyPolicyContent = () => { const contactEmail = import.meta.env.VITE_CONTACT_EMAIL ?? ""; return <>\n' +
    '<p className="mb-8 text-sm text-muted-foreground">{' +
    quote(updated.text) +
    "}</p>" +
    sections
      .map(
        section =>
          "<ArticleSubParagraph id=" +
          quote(section.id) +
          " separatorFullWidth><ArticleSubParagraphHeader>{" +
          quote(section.title) +
          "}</ArticleSubParagraphHeader><ArticleSubParagraphContent>" +
          section.content.join("\n") +
          "</ArticleSubParagraphContent></ArticleSubParagraph>"
      )
      .join("\n") +
    "</>; }; export default PrivacyPolicyContent;\n",
]);

// Validate every source before replacing any generated file.
for (const [file, content] of outputs) {
  const target = path.join(directory, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
console.log("Generated Versions and Privacy from local Markdown sources.");
