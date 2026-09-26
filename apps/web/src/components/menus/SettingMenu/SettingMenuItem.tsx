import { type ReactNode, useContext } from "react";
import { ArticleSettingItem } from "@/components/commons/Article/Article";
import { SettingMenuLayoutContext } from "./SettingMenu";

interface SettingMenuItemProps {
  title: string;
  description: string;
  children: ReactNode;
  hideSeparator?: boolean;
  titleClassName?: string;
  layout?: "panel" | "page";
}

const SettingMenuItem = ({
  title,
  description,
  children,
  hideSeparator = false,
  titleClassName = "",
  layout: itemLayout,
}: SettingMenuItemProps) => {
  const inheritedLayout = useContext(SettingMenuLayoutContext);
  const layout = itemLayout ?? inheritedLayout;

  if (layout === "page") {
    return (
      <ArticleSettingItem
        title={title}
        description={description}
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
        <div className="text-sm text-muted-foreground mt-1">{description}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
};

export default SettingMenuItem;
