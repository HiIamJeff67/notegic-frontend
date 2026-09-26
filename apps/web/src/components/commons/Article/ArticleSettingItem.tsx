import type { ReactNode } from "react";
import { cn } from "@shared/util/utils";
import {
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
  ArticleSubParagraphSeparator,
} from "./ArticleSections";

interface ArticleSettingItemProps {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  hideSeparator?: boolean;
  layout?: "row" | "stacked";
  overlayLabel?: string;
  titleClassName?: string;
}

const ArticleSettingItem = ({
  id,
  title,
  description,
  children,
  hideSeparator = false,
  layout = "row",
  overlayLabel,
  titleClassName,
}: ArticleSettingItemProps) => (
  <div id={id} className="flex min-w-0 flex-col">
    <ArticleSubParagraphHeader
      level={0}
      className={cn(
        "text-base font-medium",
        titleClassName ?? "text-foreground"
      )}
    >
      {title}
    </ArticleSubParagraphHeader>
    <ArticleSubParagraphContent level={0} className="mt-2 space-y-0">
      <div
        className={`relative min-w-0 ${
          layout === "row"
            ? "flex min-h-[calc(var(--density-control-height)+1.75rem)] items-center justify-between gap-[var(--density-content-gap)]"
            : "flex flex-col items-stretch gap-2"
        }`}
      >
        {description && (
          <p className="min-w-0 flex-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        )}
        <div
          className={
            layout === "row"
              ? "flex shrink-0 items-center justify-end gap-2"
              : "min-w-0"
          }
        >
          {children}
        </div>
        {overlayLabel && (
          <div
            className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
            aria-label={overlayLabel}
          />
        )}
      </div>
    </ArticleSubParagraphContent>
    {!hideSeparator && <ArticleSubParagraphSeparator className="my-6 w-full" />}
  </div>
);

export default ArticleSettingItem;
