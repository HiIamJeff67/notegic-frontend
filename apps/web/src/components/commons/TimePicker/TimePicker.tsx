import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@shared/util/utils";
import { ClockIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TimePickerProps {
  value: Date | undefined;
  onValueChange: (value: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  className?: string;
  contentClassName?: string;
}

const TimePicker = ({
  value,
  onValueChange,
  placeholder,
  disabled = false,
  isInvalid = false,
  className,
  contentClassName,
}: TimePickerProps) => {
  const { i18n, t } = useTranslation();
  const displayPlaceholder =
    placeholder ?? t("workspace.accessibility.selectTime");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hourWheelRef = useRef<HTMLDivElement>(null);
  const minuteWheelRef = useRef<HTMLDivElement>(null);
  const hourScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minuteScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hourCycle, setHourCycle] = useState<"12" | "24">("24");
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);
  const displayedTime = value ?? new Date(2000, 0, 1, 0, 0, 0, 0);

  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      if (hourWheelRef.current) {
        hourWheelRef.current.scrollTop =
          (hourCycle === "12"
            ? displayedTime.getHours() % 12
            : displayedTime.getHours()) * 32;
      }
      if (minuteWheelRef.current) {
        minuteWheelRef.current.scrollTop = displayedTime.getMinutes() * 32;
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [displayedTime, hourCycle, isOpen]);

  useEffect(
    () => () => {
      if (hourScrollTimerRef.current) {
        clearTimeout(hourScrollTimerRef.current);
      }
      if (minuteScrollTimerRef.current) {
        clearTimeout(minuteScrollTimerRef.current);
      }
    },
    []
  );

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
          if (!value) {
            const now = new Date();
            now.setSeconds(0, 0);
            onValueChange(now);
          }
        }
        setIsOpen(open);
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          data-empty={!value}
          aria-invalid={isInvalid}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start rounded-sm px-3 text-left font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <ClockIcon className="size-4 shrink-0" />
          <span className="truncate">
            {value
              ? value.toLocaleTimeString(i18n.resolvedLanguage, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: hourCycle === "12",
                })
              : displayPlaceholder}
          </span>
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portalContainer}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-[160] w-72 rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            contentClassName
          )}
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t("workspace.accessibility.time")}
            </span>
            <ToggleGroup
              type="single"
              value={hourCycle}
              onValueChange={value => {
                if (value === "12" || value === "24") {
                  setHourCycle(value);
                }
              }}
              variant="outline"
              size="sm"
              className="gap-0"
            >
              <ToggleGroupItem
                value="12"
                aria-label={t("workspace.accessibility.use12HourTime")}
                className="h-7 rounded-r-none px-2 text-[11px]"
              >
                12H
              </ToggleGroupItem>
              <ToggleGroupItem
                value="24"
                aria-label={t("workspace.accessibility.use24HourTime")}
                className="h-7 rounded-l-none border-l-0 px-2 text-[11px]"
              >
                24H
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex">
            <div className="flex min-w-0 flex-1 flex-col border-r">
              <span className="border-b py-1.5 text-center text-[11px] text-muted-foreground">
                {t("workspace.accessibility.hour")}
              </span>
              <div className="relative h-36 overflow-hidden">
                <div
                  ref={hourWheelRef}
                  onScroll={event => {
                    if (!value) return;
                    if (hourScrollTimerRef.current) {
                      clearTimeout(hourScrollTimerRef.current);
                    }

                    const scrollTop = event.currentTarget.scrollTop;
                    hourScrollTimerRef.current = setTimeout(() => {
                      const hour = Math.min(
                        hourCycle === "12" ? 11 : 23,
                        Math.max(0, Math.round(scrollTop / 32))
                      );
                      hourWheelRef.current?.scrollTo({
                        top: hour * 32,
                        behavior: "smooth",
                      });
                      if (
                        (hourCycle === "12"
                          ? hour + (value.getHours() >= 12 ? 12 : 0)
                          : hour) === value.getHours()
                      ) {
                        return;
                      }

                      onValueChange(
                        new Date(
                          value.getFullYear(),
                          value.getMonth(),
                          value.getDate(),
                          hourCycle === "12"
                            ? hour + (value.getHours() >= 12 ? 12 : 0)
                            : hour,
                          value.getMinutes(),
                          0,
                          0
                        )
                      );
                    }, 100);
                  }}
                  className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain py-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {Array.from(
                    { length: hourCycle === "12" ? 12 : 24 },
                    (_, hour) => (
                      <Button
                        key={hour}
                        type="button"
                        variant="ghost"
                        disabled={disabled}
                        onClick={event => {
                          const targetTime = value ?? new Date();
                          event.currentTarget.scrollIntoView({
                            block: "center",
                            behavior: "smooth",
                          });
                          onValueChange(
                            new Date(
                              targetTime.getFullYear(),
                              targetTime.getMonth(),
                              targetTime.getDate(),
                              hourCycle === "12"
                                ? hour + (targetTime.getHours() >= 12 ? 12 : 0)
                                : hour,
                              targetTime.getMinutes(),
                              0,
                              0
                            )
                          );
                        }}
                        className={cn(
                          "flex h-8 w-full snap-center justify-center rounded-none font-mono text-sm font-normal",
                          (hourCycle === "12"
                            ? displayedTime.getHours() % 12
                            : displayedTime.getHours()) === hour
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {String(
                          hourCycle === "12" && hour === 0 ? 12 : hour
                        ).padStart(2, "0")}
                      </Button>
                    )
                  )}
                </div>
                <div className="pointer-events-none absolute inset-x-2 top-14 h-8 border-y border-primary/50 bg-primary/5" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-popover to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-popover to-transparent" />
              </div>
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col",
                hourCycle === "12" && "border-r"
              )}
            >
              <span className="border-b py-1.5 text-center text-[11px] text-muted-foreground">
                {t("workspace.accessibility.minute")}
              </span>
              <div className="relative h-36 overflow-hidden">
                <div
                  ref={minuteWheelRef}
                  onScroll={event => {
                    if (!value) return;
                    if (minuteScrollTimerRef.current) {
                      clearTimeout(minuteScrollTimerRef.current);
                    }

                    const scrollTop = event.currentTarget.scrollTop;
                    minuteScrollTimerRef.current = setTimeout(() => {
                      const minute = Math.min(
                        59,
                        Math.max(0, Math.round(scrollTop / 32))
                      );
                      minuteWheelRef.current?.scrollTo({
                        top: minute * 32,
                        behavior: "smooth",
                      });
                      if (minute === value.getMinutes()) return;

                      onValueChange(
                        new Date(
                          value.getFullYear(),
                          value.getMonth(),
                          value.getDate(),
                          value.getHours(),
                          minute,
                          0,
                          0
                        )
                      );
                    }, 100);
                  }}
                  className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain py-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {Array.from({ length: 60 }, (_, minute) => (
                    <Button
                      key={minute}
                      type="button"
                      variant="ghost"
                      disabled={disabled}
                      onClick={event => {
                        const targetTime = value ?? new Date();
                        event.currentTarget.scrollIntoView({
                          block: "center",
                          behavior: "smooth",
                        });
                        onValueChange(
                          new Date(
                            targetTime.getFullYear(),
                            targetTime.getMonth(),
                            targetTime.getDate(),
                            targetTime.getHours(),
                            minute,
                            0,
                            0
                          )
                        );
                      }}
                      className={cn(
                        "flex h-8 w-full snap-center justify-center rounded-none font-mono text-sm font-normal",
                        displayedTime.getMinutes() === minute
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {String(minute).padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-x-2 top-14 h-8 border-y border-primary/50 bg-primary/5" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-popover to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-popover to-transparent" />
              </div>
            </div>
            {hourCycle === "12" && (
              <div className="flex w-16 flex-col">
                <span className="border-b py-1.5 text-center text-[11px] text-muted-foreground">
                  {t("workspace.accessibility.period")}
                </span>
                <div className="flex flex-1 flex-col justify-center gap-1 p-2">
                  <Button
                    type="button"
                    variant={
                      displayedTime.getHours() < 12 ? "secondary" : "ghost"
                    }
                    disabled={disabled}
                    onClick={() => {
                      const targetTime = value ?? new Date();
                      if (targetTime.getHours() < 12) return;

                      onValueChange(
                        new Date(
                          targetTime.getFullYear(),
                          targetTime.getMonth(),
                          targetTime.getDate(),
                          targetTime.getHours() - 12,
                          targetTime.getMinutes(),
                          0,
                          0
                        )
                      );
                    }}
                    className="h-8 rounded-sm px-2 text-xs"
                  >
                    {t("workspace.accessibility.am")}
                  </Button>
                  <Button
                    type="button"
                    variant={
                      displayedTime.getHours() >= 12 ? "secondary" : "ghost"
                    }
                    disabled={disabled}
                    onClick={() => {
                      const targetTime = value ?? new Date();
                      if (targetTime.getHours() >= 12) return;

                      onValueChange(
                        new Date(
                          targetTime.getFullYear(),
                          targetTime.getMonth(),
                          targetTime.getDate(),
                          targetTime.getHours() + 12,
                          targetTime.getMinutes(),
                          0,
                          0
                        )
                      );
                    }}
                    className="h-8 rounded-sm px-2 text-xs"
                  >
                    {t("workspace.accessibility.pm")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default TimePicker;
