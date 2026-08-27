import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@shared/util/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useRef, useState } from "react";

interface ContainableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: {
    value: string;
    label: string;
  }[];
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  valueLabel?: React.ReactNode;
}

const ContainableSelect = ({
  value,
  onValueChange,
  options = [],
  children,
  disabled = false,
  className,
  contentClassName,
  valueLabel,
}: ContainableSelectProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  return (
    <SelectPrimitive.Root
      open={isOpen}
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
      onOpenChange={open => {
        if (open) {
          setPortalContainer(
            triggerRef.current?.closest(
              '[data-slot="sheet-content"], [data-slot="dialog-content"]'
            ) ?? null
          );
        }
        setIsOpen(open);
      }}
    >
      <SelectPrimitive.Trigger
        ref={triggerRef}
        className={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <SelectPrimitive.Value>{valueLabel}</SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal container={portalContainer}>
        <SelectPrimitive.Content
          position="popper"
          className={cn(
            "relative z-[120] max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
            contentClassName
          )}
        >
          <SelectPrimitive.Viewport className="w-full min-w-[var(--radix-select-trigger-width)] p-1">
            {children ??
              options.map(option => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <CheckIcon className="size-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                </SelectPrimitive.Item>
              ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export default ContainableSelect;
