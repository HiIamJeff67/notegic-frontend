import { Lexer, type Token } from "marked";
import { Fragment, type ReactNode } from "react";

// Render a small inline vocabulary as React nodes, never contract-supplied HTML.
const inlineNodes = (tokens: Token[]): ReactNode =>
  tokens.map((token, index) => {
    switch (token.type) {
      case "codespan":
        return (
          <code
            className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground"
            key={index}
          >
            {token.text}
          </code>
        );
      case "strong":
        return <strong key={index}>{inlineNodes(token.tokens ?? [])}</strong>;
      case "em":
        return <em key={index}>{inlineNodes(token.tokens ?? [])}</em>;
      case "del":
        return <del key={index}>{inlineNodes(token.tokens ?? [])}</del>;
      case "br":
        return <br key={index} />;
      case "link": {
        const label = inlineNodes(token.tokens ?? []);
        try {
          const url = new URL(token.href, "https://notegic.com");
          if (["http:", "https:", "mailto:"].includes(url.protocol)) {
            return (
              <a
                href={token.href}
                title={token.title ?? undefined}
                className="underline underline-offset-4 hover:text-primary"
                key={index}
              >
                {label}
              </a>
            );
          }
        } catch {
          // Invalid or unsafe destinations remain readable without a link.
        }
        return <Fragment key={index}>{label}</Fragment>;
      }
      case "text":
        return token.tokens ? inlineNodes(token.tokens) : token.text;
      case "escape":
      case "html":
      case "image":
        return token.text;
      default:
        return token.raw;
    }
  });

export const ArticleInlineText = ({ children }: { children: ReactNode }) =>
  typeof children === "string" ? (
    inlineNodes(Lexer.lexInline(children))
  ) : (
    <>{children}</>
  );
