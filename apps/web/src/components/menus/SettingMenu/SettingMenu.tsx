import WrapPlaceholder from "@/components/holders/WrapPlaceholder";

interface SettingMenuProps {
  children: React.ReactNode;
  dialogs?: React.ReactNode[];
  menuClassName?: string;
  menuItemsClassName?: string;
  layout?: "panel" | "page";
}

const SettingMenu = ({
  children,
  dialogs,
  menuClassName,
  menuItemsClassName,
  layout = "panel",
}: SettingMenuProps) => {
  return (
    <div
      className={`${
        layout === "panel"
          ? "h-full overflow-y-auto ![scrollbar-color:var(--muted-foreground)_var(--secondary)]"
          : ""
      } w-full ${menuClassName}`}
    >
      <div
        className={`${
          layout === "panel" ? "min-h-full bg-muted px-8 pt-12 pb-8" : ""
        } flex flex-col gap-6 ${menuItemsClassName}`}
      >
        {children}
      </div>
      {dialogs &&
        dialogs.map((dialog, index) => (
          <WrapPlaceholder key={index}>{dialog}</WrapPlaceholder>
        ))}
    </div>
  );
};

export default SettingMenu;
