import { type ReactNode, useContext } from "react";
import { ArticleSettingItem } from "@/components/commons/Article/Article";
import { SettingMenuLayoutContext } from "./SettingMenu";

interface SettingMenuItemProps {
  title: string;
  description?: string;
  descriptionDetail?: string;
  children: ReactNode;
  hideSeparator?: boolean;
  titleClassName?: string;
  layout?: "panel" | "page";
}

const SettingMenuItem = ({
  title,
  description,
  descriptionDetail,
  children,
  hideSeparator = false,
  titleClassName = "",
  layout: itemLayout,
}: SettingMenuItemProps) => {
  const inheritedLayout = useContext(SettingMenuLayoutContext);
  const layout = itemLayout ?? inheritedLayout;
  const descriptionContent = descriptionDetail ? (
    <>
      {description}
      <span className="block wrap-anywhere">{descriptionDetail}</span>
    </>
  ) : (
    description
  );

  if (layout === "page") {
    return (
      <ArticleSettingItem
        title={title}
        description={descriptionContent}
        hideSeparator={hideSeparator}
        titleClassName={titleClassName}
      >
        {children}
      </ArticleSettingItem>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 py-3 ${
        !hideSeparator ? "border-b border-border/50" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-medium ${titleClassName}`}>{title}</div>
        {descriptionContent && (
          <div className="text-sm text-muted-foreground mt-1">
            {descriptionContent}
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
};

export default SettingMenuItem;
