import { SupportedIcon } from "@shared/api/interfaces/enums";
import { cn } from "@shared/util/utils";
import { CheckIcon, SearchIcon, SmilePlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SupportedIconTableProps {
  value: SupportedIcon | null;
  onValueChange: (value: SupportedIcon | null) => void;
  disabled?: boolean;
  className?: string;
}

const SupportedIconTable = ({
  value,
  onValueChange,
  disabled = false,
  className,
}: SupportedIconTableProps) => {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredIcons = (
    Object.entries(SupportedIcon) as [string, SupportedIcon][]
  ).filter(([iconName]) =>
    iconName
      .toLowerCase()
      .includes(
        searchQuery.trim().toLowerCase().replaceAll(" ", "").replaceAll("-", "")
      )
  );

  return (
    <Popover
      modal
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (open) {
          setPortalContainer(
            (triggerRef.current?.closest(
              '[data-slot="sheet-content"], [data-slot="dialog-content"]'
            ) ?? null) as HTMLElement | null
          );
        } else {
          setSearchQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          className="size-10 shrink-0 cursor-pointer rounded-sm text-lg"
          aria-label={
            value
              ? t("workspace.accessibility.changeIcon")
              : t("workspace.accessibility.selectIcon")
          }
        >
          {value ?? <SmilePlusIcon className="text-muted-foreground" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        container={portalContainer}
        align="start"
        sideOffset={6}
        className={cn(
          "z-[160] flex w-80 flex-col gap-3 rounded-sm border bg-popover p-3 text-popover-foreground shadow-md outline-none",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={event => setSearchQuery(event.currentTarget.value)}
              placeholder={t("workspace.accessibility.searchIcons")}
              className="h-9 rounded-sm pl-8"
              autoFocus
            />
          </div>

          {value !== null && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-sm"
              disabled={value === null}
              aria-label={t("workspace.accessibility.clearIcon")}
              onClick={() => {
                onValueChange(null);
                setSearchQuery("");
                setIsOpen(false);
              }}
            >
              <XIcon />
            </Button>
          )}
        </div>

        {filteredIcons.length > 0 ? (
          <div className="flex max-h-52 flex-wrap content-start gap-1 overflow-y-auto">
            {filteredIcons.map(([iconName, supportedIcon]) => {
              const readableIconName = iconName.replace(
                /([a-z0-9])([A-Z])/g,
                "$1 $2"
              );
              return (
                <Tooltip key={iconName}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={value === supportedIcon ? "secondary" : "ghost"}
                      size="icon"
                      className="relative size-8 shrink-0 cursor-pointer rounded-sm text-base"
                      title={readableIconName}
                      aria-label={readableIconName}
                      onClick={() => {
                        onValueChange(supportedIcon);
                        setSearchQuery("");
                        setIsOpen(false);
                      }}
                    >
                      {supportedIcon}
                      {value === supportedIcon && (
                        <CheckIcon className="absolute right-0 bottom-0 size-3 rounded-sm bg-primary p-0.5 text-primary-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="z-[170]" side="top">
                    {readableIconName}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
            {t("workspace.accessibility.noMatchingIcons")}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default SupportedIconTable;
