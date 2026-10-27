import type { CSSProperties } from "react";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { useHighlightedCode } from "@/hooks/useHighlightedCode";

interface CodeExampleProps {
  value: string;
  language: string;
  title?: string;
  className?: string;
}

const CodeExample = ({
  value,
  language,
  title,
  className,
}: CodeExampleProps) => {
  const lines = useHighlightedCode(value, language);

  return (
    <CodeBlock className={className}>
      <CodeBlockHeader>
        <CodeBlockTitle>{title ?? language}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={value} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent className="max-h-72">
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>
            {typeof line === "string"
              ? line
              : line.map((token, index) => (
                  <span
                    key={index}
                    style={token.htmlStyle as CSSProperties}
                    className="text-(--shiki-light) dark:text-(--shiki-dark)"
                  >
                    {token.content}
                  </span>
                ))}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
};

export default CodeExample;
