import { cn } from "@shared/util/utils";
import { Braces, FileCode2, Globe2, Terminal } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeExample from "./CodeExample";

type CodeLanguage = "curl" | "go" | "http" | "json" | "python" | "typescript";

interface CodeExamplePanelProps {
  code: Partial<Record<CodeLanguage, string>>;
  defaultLanguage?: CodeLanguage;
  title?: string;
  className?: string;
}

const languages = {
  curl: { label: "cURL", icon: Terminal },
  go: { label: "Go", icon: FileCode2 },
  http: { label: "HTTP", icon: Globe2 },
  json: { label: "JSON", icon: Braces },
  python: { label: "Python", icon: FileCode2 },
  typescript: { label: "TypeScript", icon: FileCode2 },
} as const;

const CodeExamplePanel = ({
  code,
  defaultLanguage,
  title,
  className,
}: CodeExamplePanelProps) => {
  const examples = Object.entries(code).filter(
    (entry): entry is [CodeLanguage, string] => typeof entry[1] === "string"
  );
  const initialLanguage =
    defaultLanguage && typeof code[defaultLanguage] === "string"
      ? defaultLanguage
      : (examples[0]?.[0] ?? "json");
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const activeLanguage =
    typeof code[selectedLanguage] === "string"
      ? selectedLanguage
      : initialLanguage;

  if (examples.length === 0) return null;
  if (examples.length === 1) {
    return (
      <CodeExample
        title={title ?? languages[examples[0][0]].label}
        value={examples[0][1]}
        language={examples[0][0]}
        className={className}
      />
    );
  }

  return (
    <Tabs
      value={activeLanguage}
      onValueChange={value => setSelectedLanguage(value as CodeLanguage)}
      className={cn("min-w-0 max-w-full", className)}
    >
      <div className="min-w-0 overflow-x-auto">
        <TabsList aria-label={title ? `${title} formats` : "Code formats"}>
          {examples.map(([language]) => {
            const { label, icon: Icon } = languages[language];
            return (
              <TabsTrigger key={language} value={language}>
                <Icon aria-hidden="true" className="size-3.5" />
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      {examples.map(([language, value]) => (
        <TabsContent key={language} value={language} className="m-0 min-w-0">
          <CodeExample
            title={title ?? languages[language].label}
            value={value}
            language={language}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CodeExamplePanel;
