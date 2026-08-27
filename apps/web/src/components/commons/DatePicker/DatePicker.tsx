import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@shared/util/utils";
import { CalendarIcon } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DatePickerProps {
  id?: string;
  value: Date | undefined;
  onValueChange: (value: Date | undefined) => void;
  placeholder?: string;
  disabled?: ComponentProps<typeof Calendar>["disabled"];
  isInvalid?: boolean;
  className?: string;
  contentClassName?: string;
}

const DatePicker = ({
  id,
  value,
  onValueChange,
  placeholder,
  disabled,
  isInvalid = false,
  className,
  contentClassName,
}: DatePickerProps) => {
  const { i18n, t } = useTranslation();
  const displayPlaceholder =
    placeholder ?? t("workspace.accessibility.selectDateTime");
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

  useEffect(() => {
    if (!isOpen || !value) return;

    const frameId = requestAnimationFrame(() => {
      if (hourWheelRef.current) {
        hourWheelRef.current.scrollTop =
          (hourCycle === "12" ? value.getHours() % 12 : value.getHours()) * 32;
      }
      if (minuteWheelRef.current) {
        minuteWheelRef.current.scrollTop = value.getMinutes() * 32;
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [hourCycle, isOpen, value]);

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
        }
        setIsOpen(open);
      }}
    >
      <HoverCard openDelay={250} closeDelay={150}>
        <HoverCardTrigger asChild>
          <PopoverPrimitive.Trigger asChild>
            <Button
              ref={triggerRef}
              id={id}
              type="button"
              variant="outline"
              data-empty={!value}
              aria-invalid={isInvalid}
              className={cn(
                "h-10 w-full justify-start rounded-sm px-3 text-left font-normal data-[empty=true]:text-muted-foreground",
                className
              )}
            >
              <CalendarIcon className="size-4 shrink-0" />
              <span className="truncate">
                {value
                  ? value.toLocaleString(i18n.resolvedLanguage, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: hourCycle === "12",
                    })
                  : displayPlaceholder}
              </span>
            </Button>
          </PopoverPrimitive.Trigger>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="z-[170] w-72 rounded-sm bg-popover p-3"
        >
          <div className="flex items-start gap-3">
            <CalendarIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {value
                  ? value.toLocaleDateString(i18n.resolvedLanguage)
                  : displayPlaceholder}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {value
                  ? value.toLocaleString(i18n.resolvedLanguage, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: hourCycle === "12",
                    })
                  : t("workspace.accessibility.noDateTimeSelected")}
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      <PopoverPrimitive.Portal container={portalContainer}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-[160] w-auto rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            contentClassName
          )}
        >
          <Calendar
            mode="single"
            selected={value}
            disabled={disabled}
            onSelect={date => {
              if (!date) {
                onValueChange(undefined);
                return;
              }

              date.setHours(
                value?.getHours() ?? 0,
                value?.getMinutes() ?? 0,
                0,
                0
              );
              onValueChange(date);
            }}
            initialFocus
          />
          <div className="flex items-center justify-between border-t border-b px-2 py-1.5">
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
              <div className="relative h-32 overflow-hidden">
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
                          value.getMinutes()
                        )
                      );
                    }, 100);
                  }}
                  className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain py-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {Array.from(
                    { length: hourCycle === "12" ? 12 : 24 },
                    (_, hour) => (
                      <Button
                        key={hour}
                        type="button"
                        variant="ghost"
                        data-density-static
                        disabled={!value}
                        onClick={event => {
                          if (!value) return;
                          event.currentTarget.scrollIntoView({
                            block: "center",
                            behavior: "smooth",
                          });
                          onValueChange(
                            new Date(
                              value.getFullYear(),
                              value.getMonth(),
                              value.getDate(),
                              hourCycle === "12"
                                ? hour + (value.getHours() >= 12 ? 12 : 0)
                                : hour,
                              value.getMinutes()
                            )
                          );
                        }}
                        className={cn(
                          "flex h-8 w-full snap-center justify-center rounded-none font-mono text-sm font-normal",
                          (hourCycle === "12"
                            ? value && value.getHours() % 12
                            : value?.getHours()) === hour
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
                <div className="pointer-events-none absolute inset-x-2 top-12 h-8 border-y border-primary/50 bg-primary/5" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-b from-popover to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-popover to-transparent" />
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
              <div className="relative h-32 overflow-hidden">
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
                          minute
                        )
                      );
                    }, 100);
                  }}
                  className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain py-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {Array.from({ length: 60 }, (_, minute) => (
                    <Button
                      key={minute}
                      type="button"
                      variant="ghost"
                      data-density-static
                      disabled={!value}
                      onClick={event => {
                        if (!value) return;
                        event.currentTarget.scrollIntoView({
                          block: "center",
                          behavior: "smooth",
                        });
                        onValueChange(
                          new Date(
                            value.getFullYear(),
                            value.getMonth(),
                            value.getDate(),
                            value.getHours(),
                            minute
                          )
                        );
                      }}
                      className={cn(
                        "flex h-8 w-full snap-center justify-center rounded-none font-mono text-sm font-normal",
                        value?.getMinutes() === minute
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {String(minute).padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-x-2 top-12 h-8 border-y border-primary/50 bg-primary/5" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-b from-popover to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-popover to-transparent" />
              </div>
            </div>
            {hourCycle === "12" && (
              <div className="flex w-14 flex-col">
                <span className="border-b py-1.5 text-center text-[11px] text-muted-foreground">
                  {t("workspace.accessibility.period")}
                </span>
                <div className="flex flex-1 flex-col justify-center gap-1 p-2">
                  <Button
                    type="button"
                    data-density-static
                    variant={
                      value && value.getHours() < 12 ? "secondary" : "ghost"
                    }
                    disabled={!value}
                    onClick={() => {
                      if (!value || value.getHours() < 12) return;

                      onValueChange(
                        new Date(
                          value.getFullYear(),
                          value.getMonth(),
                          value.getDate(),
                          value.getHours() - 12,
                          value.getMinutes()
                        )
                      );
                    }}
                    className="h-7 rounded-sm px-2 text-xs"
                  >
                    {t("workspace.accessibility.am")}
                  </Button>
                  <Button
                    type="button"
                    data-density-static
                    variant={
                      value && value.getHours() >= 12 ? "secondary" : "ghost"
                    }
                    disabled={!value}
                    onClick={() => {
                      if (!value || value.getHours() >= 12) return;

                      onValueChange(
                        new Date(
                          value.getFullYear(),
                          value.getMonth(),
                          value.getDate(),
                          value.getHours() + 12,
                          value.getMinutes()
                        )
                      );
                    }}
                    className="h-7 rounded-sm px-2 text-xs"
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

export default DatePicker;
