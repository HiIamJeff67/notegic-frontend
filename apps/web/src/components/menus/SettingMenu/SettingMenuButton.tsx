import { Button } from "@/components/ui/button";

interface SettingMenuButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  displayDotBadge?: boolean;
  countBadgeCount?: number;
  disable?: boolean;
  variant?:
    | "default"
    | "link"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null;
}

const SettingMenuButton = ({
  children,
  onClick,
  ariaLabel,
  className = "",
  displayDotBadge,
  countBadgeCount,
  disable = false,
  variant = undefined,
}: SettingMenuButtonProps) => {
  return (
    <Button
      aria-label={ariaLabel}
      variant={variant}
      className={`relative min-w-[calc(4ch+2*var(--density-control-padding-x,1rem)+2px)] ${className}`}
      onClick={onClick}
      disabled={disable}
    >
      {children}

      {countBadgeCount ? (
        <span className="absolute -top-2 -right-2 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-30" />
          {countBadgeCount > 99 ? "99+" : countBadgeCount}
        </span>
      ) : displayDotBadge ? (
        <span className="absolute -top-1 -right-1 z-10 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-30" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
      ) : null}
    </Button>
  );
};
export default SettingMenuButton;
