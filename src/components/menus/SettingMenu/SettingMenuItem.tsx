import { ReactNode } from "react";

interface SettingMenuItemProps {
  title: string;
  description: string;
  children: ReactNode;
  hideSeparator?: boolean;
  titleClassName?: string;
}

const SettingMenuItem = ({
  title,
  description,
  children,
  hideSeparator = false,
  titleClassName = "",
}: SettingMenuItemProps) => {
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
