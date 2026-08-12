import { createContext, type ReactNode, useContext } from "react";
import {
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
} from "@/components/commons/Article/Article";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface SectionProps {
  children: ReactNode;
  article?: boolean;
}

interface SettingRowProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  hideSeparator?: boolean;
  unsupportedReason?: string;
}

interface SwitchRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hideSeparator?: boolean;
  unsupportedReason?: string;
}

const PreferenceArticleContext = createContext(false);

export const Section = ({ children, article = false }: SectionProps) => (
  <PreferenceArticleContext.Provider value={article}>
    <section className={article ? "min-w-0 space-y-8" : "min-w-0"}>
      {children}
    </section>
  </PreferenceArticleContext.Provider>
);

export const SettingRow = ({
  title,
  description,
  children,
  hideSeparator,
  unsupportedReason,
}: SettingRowProps) => (
  <SettingRowContent
    title={title}
    description={description}
    hideSeparator={hideSeparator}
    unsupportedReason={unsupportedReason}
  >
    {children}
  </SettingRowContent>
);

const SettingRowContent = ({
  title,
  description,
  children,
  hideSeparator,
  unsupportedReason,
}: SettingRowProps) => {
  const article = useContext(PreferenceArticleContext);
  const controls = (
    <div className="flex shrink-0 items-center justify-end gap-2">
      {unsupportedReason ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-density-static
          disabled
          className="h-8 px-3 text-xs"
        >
          {unsupportedReason}
        </Button>
      ) : (
        children
      )}
    </div>
  );

  if (article) {
    return (
      <ArticleSubParagraph id={`preference-${title}`}>
        <ArticleSubParagraphHeader className="text-base font-medium text-foreground/65">
          {title}
        </ArticleSubParagraphHeader>
        <ArticleSubParagraphContent className="mt-2 space-y-0">
          <div className="relative flex min-h-[calc(var(--density-control-height)+1.75rem)] items-center justify-between gap-[var(--density-content-gap)]">
            {description && (
              <p className="min-w-0 flex-1 text-sm leading-5 text-muted-foreground">
                {description}
              </p>
            )}
            {controls}
            {unsupportedReason && (
              <div
                className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
                aria-label={unsupportedReason}
              />
            )}
          </div>
        </ArticleSubParagraphContent>
      </ArticleSubParagraph>
    );
  }

  return (
    <div
      className={`relative flex min-h-[calc(var(--density-control-height)+1.75rem)] items-center justify-between gap-[var(--density-content-gap)] overflow-hidden py-[calc(var(--density-content-padding)*0.75)] ${
        !hideSeparator ? "border-b border-border/50" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        {description && (
          <div className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {controls}
      {unsupportedReason && (
        <div
          className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
          aria-label={unsupportedReason}
        />
      )}
    </div>
  );
};

export const SwitchRow = ({
  title,
  description,
  checked,
  onCheckedChange,
  hideSeparator,
  unsupportedReason,
}: SwitchRowProps) => (
  <SettingRow
    title={title}
    description={description}
    hideSeparator={hideSeparator}
    unsupportedReason={unsupportedReason}
  >
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={Boolean(unsupportedReason)}
    />
  </SettingRow>
);

export const StatusPill = ({ children }: { children: ReactNode }) => (
  <span className="rounded-sm border border-border bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
    {children}
  </span>
);
