import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "apps/web/src/pages/document/website/sources");
const assets = path.join(root, "apps/web/assets/document");
const output = path.join(root, "apps/web/src/pages/document/website");
const legacyIds = {
  "structured-storage": "notegic-model",
  automation: "integration-patterns",
  "root-shelf": "root-shelves",
  "sub-shelf": "sub-shelves",
  "block-pack": "block-packs",
  material: "materials",
  block: "blocks",
  station: "stations",
  routine: "routines",
  "routine-task": "routine-tasks",
  "routine-tag": "routine-tags",
  "routine-task-dependencies": "routine-task-dependencies",
  "api-keys": "api-keys",
  "review-and-revoke": "api-key-management",
  "common-situations": "q-and-a",
};
const quote = JSON.stringify;
const text = value => "{" + quote(value) + "}";
const destinations = [];

const file = "website.md";
const name = "WebsiteContent";
const tokens = marked.lexer(fs.readFileSync(path.join(source, file), "utf8"));
assert.equal(tokens[0]?.type, "heading");
assert.equal(tokens[0]?.text, "Website");
const document = { depth: 1, children: [] };
const stack = [document];
const ids = new Map();
const occurrences = new Map();
const media = new Map();
for (let index = 1; index < tokens.length; index++) {
  const token = tokens[index];
  if (token.type === "space") continue;
  if (token.type === "hr") {
    const next = tokens.slice(index + 1).find(token => token.type !== "space");
    if (next?.type === "heading") {
      const parent = stack.findLast(section => section.depth < next.depth);
      // Adjacent Article sections already provide the boundary's separator.
      if (parent?.children.at(-1)?.type === "section") continue;
    }
  }
  if (token.type !== "heading") {
    stack.at(-1).children.push(token);
    continue;
  }
  const slug = token.text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_ -]/gu, "")
    .replace(/ +/g, "-")
    .replace(/-+/g, "-");
  const count = occurrences.get(slug) ?? 0;
  occurrences.set(slug, count + 1);
  const fragment = slug + (count ? "-" + count : "");
  const id = legacyIds[fragment] ?? "website-" + fragment;
  ids.set(fragment, id);
  const section = {
    type: "section",
    depth: token.depth,
    title: token.text,
    id,
    children: [],
  };
  while (stack.at(-1).depth >= token.depth) stack.pop();
  stack.at(-1).children.push(section);
  stack.push(section);
}
const inline = tokens =>
  tokens
    .map(token => {
      switch (token.type) {
        case "text":
          return token.tokens ? inline(token.tokens) : text(token.text);
        case "escape":
          return text(token.text);
        case "codespan":
          return (
            '<code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]">' +
            text(token.text) +
            "</code>"
          );
        case "strong":
          return "<strong>" + inline(token.tokens) + "</strong>";
        case "em":
          return "<em>" + inline(token.tokens) + "</em>";
        case "del":
          return "<del>" + inline(token.tokens) + "</del>";
        case "br":
          return "<br />";
        case "link": {
          const href = token.href.startsWith("#")
            ? "#" + assertFragment(token.href.slice(1))
            : token.href;
          const url = new URL(href, "https://www.notegic.com");
          assert(
            ["http:", "https:", "mailto:"].includes(url.protocol),
            "Unsupported link: " + href
          );
          return href.startsWith("/") || href.startsWith("#")
            ? "<ArticleLink href=" +
                quote(href) +
                ">" +
                inline(token.tokens) +
                "</ArticleLink>"
            : '<a className="underline underline-offset-4 hover:text-primary" href=' +
                quote(href) +
                ' target="_blank" rel="noopener noreferrer">' +
                inline(token.tokens) +
                "</a>";
        }
        default:
          throw new Error(
            "Unsupported inline token: " + token.type + " in " + file
          );
      }
    })
    .join("");
const assertFragment = fragment => {
  assert(ids.has(fragment), "Unknown section: " + fragment);
  return ids.get(fragment);
};
const blocks = tokens =>
  tokens
    .map((token, index) => {
      switch (token.type) {
        case "space":
          return "";
        case "section": {
          const depth = Math.min(token.depth + 1, 6);
          const size =
            token.depth === 2
              ? "text-xl"
              : token.depth === 3
                ? "text-lg"
                : "text-base";
          return (
            "<ArticleSubParagraph id=" +
            quote(token.id) +
            " level={" +
            Math.min(token.depth - 1, 3) +
            "} separatorFullWidth>" +
            '<ArticleSubParagraphHeader as="h' +
            depth +
            '" level={0} className="' +
            size +
            '">' +
            text(token.title) +
            "</ArticleSubParagraphHeader><ArticleSubParagraphContent level={1}>" +
            blocks(token.children) +
            "</ArticleSubParagraphContent></ArticleSubParagraph>"
          );
        }
        case "paragraph": {
          if (/^(Image|GIF|Video) \d{2} — /.test(token.text)) return "";
          const image =
            token.tokens.length === 1 && token.tokens[0].type === "image"
              ? token.tokens[0]
              : null;
          const next = tokens
            .slice(index + 1)
            .find(next => next.type !== "space");
          if (image) {
            assert.match(
              next?.text ?? "",
              /^(Image|GIF) \d{2} — /,
              "Missing media caption"
            );
            const asset = path.resolve(source, image.href);
            assert.match(
              path.relative(assets, asset).split(path.sep).join("/"),
              /^(images|videos)\/[\w-]+\.(png|jpg|gif)$/
            );
            assert(fs.existsSync(asset), "Missing media: " + image.href);
            if (!media.has(asset)) media.set(asset, "media" + media.size);
            return (
              "<ArticleImage src={" +
              media.get(asset) +
              "} alt=" +
              quote(image.text) +
              " caption=" +
              quote(next.text) +
              " width={1600} height={1200}" +
              (image.href.endsWith(".gif") ? " animated" : "") +
              " />"
            );
          }
          const link =
            token.tokens.length === 1 && token.tokens[0].type === "link"
              ? token.tokens[0]
              : null;
          if (
            link?.href.startsWith("https://youtu.be/") &&
            /^Video \d{2} — /.test(next?.text ?? "")
          ) {
            const videoId = new URL(link.href).pathname.slice(1);
            assert.match(videoId, /^[A-Za-z0-9_-]{11}$/);
            return (
              "<ArticleVideo src=" +
              quote(
                "https://www.youtube-nocookie.com/embed/" +
                  videoId +
                  "?playsinline=1&rel=0"
              ) +
              " href=" +
              quote(link.href) +
              " title=" +
              quote(next.text.replace(/^Video \d{2} — /, "")) +
              " caption=" +
              quote(next.text) +
              " />"
            );
          }
          return "<p>" + inline(token.tokens) + "</p>";
        }
        case "text":
          return token.tokens ? inline(token.tokens) : text(token.text);
        case "list":
          return (
            "<" +
            (token.ordered ? "ol" : "ul") +
            ' className="space-y-2 pl-5 ' +
            (token.ordered ? "list-decimal" : "list-disc") +
            '"' +
            (token.ordered ? " start={" + token.start + "}" : "") +
            ">" +
            token.items
              .map(item => "<li>" + blocks(item.tokens) + "</li>")
              .join("") +
            "</" +
            (token.ordered ? "ol" : "ul") +
            ">"
          );
        case "code":
          assert(
            ["text", "mermaid"].includes(token.lang),
            "Unsupported guide code language"
          );
          return (
            "<CodeExamplePanel code={{" +
            token.lang +
            ":" +
            quote(token.text) +
            "}} />"
          );
        case "hr":
          return "<ArticleSubParagraphSeparator fullWidth />";
        case "table":
          return (
            '<div role="region" aria-label=' +
            quote(token.header[0].text) +
            ' tabIndex={0} className="max-w-full overflow-x-auto"><table className="w-full min-w-80 border-collapse text-left text-sm"><thead><tr>' +
            token.header
              .map(
                cell =>
                  '<th scope="col" className="border-b border-border px-3 py-2 font-semibold">' +
                  inline(cell.tokens) +
                  "</th>"
              )
              .join("") +
            "</tr></thead><tbody>" +
            token.rows
              .map(
                row =>
                  "<tr>" +
                  row
                    .map(
                      cell =>
                        '<td className="border-b border-border/50 px-3 py-2 align-top">' +
                        inline(cell.tokens) +
                        "</td>"
                    )
                    .join("") +
                  "</tr>"
              )
              .join("") +
            "</tbody></table></div>"
          );
        default:
          throw new Error("Unsupported block: " + token.type + " in " + file);
      }
    })
    .join("\n");
const content = blocks(document.children);
const navigation = document.children
  .filter(node => node.type === "section")
  .map(node => ({
    id: node.id,
    title: node.title,
    description: node.title,
    weight: 3,
    children: node.children
      .filter(child => child.type === "section")
      .map(child => ({
        id: child.id,
        title: child.title,
        description: child.title,
        weight: 2,
      })),
  }));
const imports = [...media]
  .map(
    ([file, name]) =>
      "import " +
      name +
      " from " +
      quote(
        "@assets/document/" +
          path.relative(assets, file).split(path.sep).join("/") +
          "?url"
      ) +
      ";"
  )
  .join("\n");
destinations.push([
  path.join(output, name + ".tsx"),
  "// Generated from apps/web/src/pages/document/website/sources/" +
    file +
    "; run npm run generate:website-guide.\n" +
    imports +
    "\nimport { ArticleImage, ArticleVideo, ArticleLink, ArticleSubParagraph, ArticleSubParagraphHeader, ArticleSubParagraphContent" +
    (content.includes("<ArticleSubParagraphSeparator")
      ? ", ArticleSubParagraphSeparator"
      : "") +
    ' } from "@/components/commons/Article/Article";\n' +
    'import CodeExamplePanel from "@/components/panels/CodeExamplePanel/CodeExamplePanel";\n' +
    "const " +
    name +
    " = () => <>\n" +
    content +
    "\n</>;\nexport default " +
    name +
    ";\n",
]);
destinations.push([
  path.join(output, "generated.ts"),
  '// Generated from apps/web/src/pages/document/website/sources/website.md; run npm run generate:website-guide.\nimport type { ArticleNavigationItem } from "@/components/commons/Article/Article";\n' +
    "export const websiteSections = " +
    JSON.stringify(navigation, null, 2) +
    " satisfies ArticleNavigationItem[];\n",
]);
for (const [file, content] of destinations) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
console.log("Generated the English Website guide and its navigation.");
