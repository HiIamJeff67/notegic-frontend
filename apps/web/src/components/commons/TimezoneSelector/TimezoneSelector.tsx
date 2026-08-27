import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@shared/util/utils";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimezoneDisplayName } from "@shared/i18n/workspace";

export const SupportedTimezones = Array.from(
  new Set(["UTC", ...Intl.supportedValuesOf("timeZone")])
);

interface TimezoneSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

const TimezoneSelector = ({
  value,
  onValueChange,
  disabled = false,
  className,
  contentClassName,
}: TimezoneSelectorProps) => {
  const { i18n, t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  const filteredTimezones = SupportedTimezones.filter(timezone => {
    const query = searchQuery.trim().toLowerCase();
    return (
      timezone.toLowerCase().includes(query) ||
      formatTimezoneDisplayName(timezone, i18n.resolvedLanguage)
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={open => {
        if (open) {
          setPortalContainer(
            triggerRef.current?.closest(
              '[data-slot="sheet-content"], [data-slot="dialog-content"]'
            ) ?? null
          );
        }
        setIsOpen(open);
        if (!open) setSearchQuery("");
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-sm bg-muted px-3 font-normal",
            className
          )}
        >
          <span className="truncate">
            {value
              ? formatTimezoneDisplayName(value, i18n.resolvedLanguage)
              : t("workspace.accessibility.selectTimezone")}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portalContainer}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={event => {
            event.preventDefault();
            searchInputRef.current?.focus();
          }}
          className={cn(
            "z-[160] flex w-[var(--radix-popover-trigger-width)] flex-col rounded-sm border bg-muted p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            contentClassName
          )}
        >
          <div className="relative border-b">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              autoComplete="off"
              placeholder={t("workspace.accessibility.searchTimezones")}
              onChange={event => setSearchQuery(event.currentTarget.value)}
              onKeyDown={event => event.stopPropagation()}
              className="h-10 rounded-none border-0 bg-transparent pr-3 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto p-1">
            {filteredTimezones.length === 0 ? (
              <span className="px-2 py-6 text-center text-sm text-muted-foreground">
                {t("workspace.accessibility.noTimezones")}
              </span>
            ) : (
              filteredTimezones.map(timezone => (
                <Button
                  key={timezone}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    onValueChange(timezone);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="h-8 w-full justify-start gap-2 rounded-sm px-2 font-normal"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    {value === timezone && <CheckIcon className="size-4" />}
                  </span>
                  <span className="truncate">
                    {formatTimezoneDisplayName(timezone, i18n.resolvedLanguage)}{" "}
                    {`(${timezone})`}
                  </span>
                </Button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default TimezoneSelector;
