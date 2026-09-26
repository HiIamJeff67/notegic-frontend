import type { ReactNode } from "react";
import { cn } from "@shared/util/utils";
import {
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
    <div
      className={`relative min-w-0 ${
        layout === "row"
          ? "flex min-h-[var(--density-control-height)] flex-row items-center justify-between gap-[var(--density-content-gap)] max-[420px]:flex-col max-[420px]:items-stretch max-[420px]:justify-center max-[420px]:gap-2"
          : "flex flex-col items-stretch gap-2"
      }`}
    >
      <div className={layout === "row" ? "min-w-0 flex-1" : "w-full"}>
        <ArticleSubParagraphHeader
          level={0}
          className={cn(
            "text-base font-medium",
            titleClassName ?? "text-foreground"
          )}
        >
          {title}
        </ArticleSubParagraphHeader>
        {description && (
          <p className="mt-1 min-w-0 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div
        className={
          layout === "row"
            ? "flex shrink-0 items-center justify-end gap-2 max-[420px]:justify-start"
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
    {!hideSeparator && <ArticleSubParagraphSeparator className="my-4 w-full" />}
  </div>
);

export default ArticleSettingItem;
