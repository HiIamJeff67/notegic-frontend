import type Prism from "prismjs";
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
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import "@/global/styles/prism-code.css";

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
  const initialLanguage =
    defaultLanguage && code[defaultLanguage]
      ? defaultLanguage
      : (languages[0]?.[0] ?? "json");
  const [activeLanguage, setActiveLanguage] = useState(initialLanguage);
  const [copied, setCopied] = useState(false);
  const [prism, setPrism] = useState<typeof Prism | null>(null);
  const copyTimeout = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  useEffect(() => {
    let active = true;
    // Grammar modules depend on Prism's browser global and must not run in SSR.
    void import("prismjs")
      .then(async ({ default: prism }) => {
        await import("./PrismCodeLanguages");
        if (active) setPrism(prism);
      })
      .catch(() => {
        // Keep escaped plain text available if optional highlighting cannot load.
      });
    return () => {
      active = false;
    };
  }, []);

  if (languages.length === 0) return null;

  const copyActiveCode = async () => {
    const value = code[activeLanguage];
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(copyTimeout.current);
      copyTimeout.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Tabs
      className={cn(
        "min-w-0 max-w-full gap-0 overflow-hidden rounded-sm border border-border",
        className
      )}
      value={activeLanguage}
      onValueChange={value => setActiveLanguage(value as PrismLanguage)}
    >
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border bg-popover px-2">
        <div className="min-w-0 flex-1 truncate px-1 text-xs font-medium text-foreground">
          {title}
        </div>
        <ToggleGroup
          className="h-8 w-auto shrink-0 justify-start gap-0"
          type="single"
          value={activeLanguage}
          onValueChange={value => {
            if (value) {
              setActiveLanguage(value as PrismLanguage);
              setCopied(false);
            }
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
                <Icon className="size-3.5 text-foreground" />
                {languageLabel[language]}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      {languages.map(([language, value]) => {
        const grammar = prism?.languages[prismGrammar[language]];
        const highlighted =
          prism && grammar
            ? prism.highlight(value, grammar, prismGrammar[language])
            : null;

        return (
          <TabsContent
            className="relative m-0 min-w-0"
            key={language}
            value={language}
          >
            <pre className="prism-code max-h-72 overflow-auto bg-background p-4 pr-12 font-mono text-sm leading-6">
              {highlighted === null ? (
                <code className="block min-w-max">{value}</code>
              ) : (
                <code
                  className="block min-w-max"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              )}
            </pre>
            <Button
              aria-label={copied ? "Copied" : "Copy code"}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 size-7 rounded-sm bg-background/90 text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
              type="button"
              onClick={() => void copyActiveCode()}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export type { PrismLanguage };
export default PrismCode;
