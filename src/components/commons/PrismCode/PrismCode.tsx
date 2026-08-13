import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-go";
import "prismjs/components/prism-http";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import { cn } from "@shared/util/utils";
import {
  Braces,
  Check,
  Copy,
  FileCode2,
  Globe2,
  type LucideIcon,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type PrismLanguage = "curl" | "go" | "http" | "json" | "python" | "typescript";

type PrismCodeProps = {
  code: Partial<Record<PrismLanguage, string>>;
  defaultLanguage?: PrismLanguage;
  title?: string;
  className?: string;
};

const languageLabel: Record<PrismLanguage, string> = {
  curl: "cURL",
  go: "Go",
  http: "HTTP",
  json: "JSON",
  python: "Python",
  typescript: "TypeScript",
};

const prismGrammar: Record<PrismLanguage, string> = {
  curl: "bash",
  go: "go",
  http: "http",
  json: "json",
  python: "python",
  typescript: "typescript",
};

const languageIcon: Record<PrismLanguage, LucideIcon> = {
  curl: Terminal,
  go: FileCode2,
  http: Globe2,
  json: Braces,
  python: FileCode2,
  typescript: FileCode2,
};

const PrismCode = ({
  code,
  defaultLanguage,
  title,
  className,
}: PrismCodeProps) => {
  const languages = Object.entries(code).filter(
    (entry): entry is [PrismLanguage, string] => typeof entry[1] === "string"
  );
  if (languages.length === 0) return null;

  const initialLanguage =
    defaultLanguage && code[defaultLanguage]
      ? defaultLanguage
      : languages[0][0];
  const [activeLanguage, setActiveLanguage] = useState(initialLanguage);
  const [copied, setCopied] = useState(false);

  const copyActiveCode = async () => {
    const value = code[activeLanguage];
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Tabs
      className={cn(
        "gap-0 overflow-hidden rounded-sm border border-border",
        className
      )}
      value={activeLanguage}
      onValueChange={value => setActiveLanguage(value as PrismLanguage)}
    >
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border bg-background/50 px-2">
        <div className="min-w-0 flex-1 truncate px-1 text-xs font-medium text-foreground">
          {title}
        </div>
        <ToggleGroup
          className="h-8 w-auto shrink-0 justify-start gap-0"
          type="single"
          value={activeLanguage}
          onValueChange={value => {
            if (value) setActiveLanguage(value as PrismLanguage);
          }}
        >
          {languages.map(([language]) => {
            const Icon = languageIcon[language];
            return (
              <ToggleGroupItem
                aria-label={`Use ${languageLabel[language]}`}
                className="h-8 rounded-sm px-2 text-xs text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground"
                key={language}
                value={language}
              >
                <Icon className="size-3.5 text-black dark:text-white" />
                {languageLabel[language]}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      {languages.map(([language, value]) => {
        const grammar = Prism.languages[prismGrammar[language]];
        const highlighted = grammar
          ? Prism.highlight(value, grammar, prismGrammar[language])
          : value;

        return (
          <TabsContent className="m-0" key={language} value={language}>
            <pre className="prism-code relative max-h-72 overflow-auto bg-background p-4 font-mono text-sm leading-6">
              <button
                aria-label={copied ? "Copied" : "Copy code"}
                className="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-sm bg-background/90 text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                type="button"
                onClick={() => void copyActiveCode()}
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
              <code
                className="block min-w-max"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export type { PrismLanguage };
export default PrismCode;
