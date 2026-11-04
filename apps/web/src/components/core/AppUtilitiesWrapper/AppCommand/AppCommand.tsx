import { defaultFilter } from "cmdk";
import { GripHorizontalIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import { useAppCommand } from "@/hooks/useAppCommand";
import { useTranslation } from "@/hooks/useTranslation";
import AppCommandContent from "./AppCommandContent";
import AppCommandItem from "./AppCommandItem";
import AppCommandPath from "./AppCommandPath";
import "@/global/styles/app-command.css";

const AppCommand = () => {
  const { t } = useTranslation();
  const command = useAppCommand();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(current => !current);
        return;
      }
      if (event.key === "Escape") {
        if (command.steps.length > 0) {
          command.back();
          return;
        }
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [command]);

  useEffect(() => {
    if (!open) {
      command.reset();
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[60]">
      {!open && (
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <button
            type="button"
            className="app-command-trigger pointer-events-auto rounded-b-sm border-x border-b px-2 pt-px pb-1 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={t("common.commandPaletteHint")}
            title={t("common.commandPaletteHint")}
            aria-expanded={false}
            aria-controls={panelId}
            aria-keyshortcuts="Control+K Meta+K"
            onClick={() => setOpen(true)}
          >
            <GripHorizontalIcon
              aria-hidden
              className="h-2.5 w-5"
              viewBox="0 6 24 12"
            />
          </button>
        </div>
      )}
      {open && (
        <>
          <div
            id={panelId}
            role="dialog"
            aria-label={t("common.commandPalette")}
            className="app-command-panel pointer-events-auto absolute overflow-hidden text-popover-foreground"
          >
            <Command
              className="bg-transparent"
              filter={(_value, search, keywords) =>
                defaultFilter(keywords?.join(" ") ?? "", search)
              }
            >
              <CommandInput
                autoFocus
                value={command.query}
                onValueChange={command.setQuery}
                placeholder={t("common.searchCommands")}
              />
              <AppCommandPath
                path={command.path}
                prompt={command.prompt}
                onVisit={command.visit}
              />
              <AppCommandContent>
                <CommandEmpty>{t("common.commandEmpty")}</CommandEmpty>
                {(
                  [
                    "navigation",
                    "domain",
                    "settings",
                    "operation",
                    "instance",
                  ] as const
                ).map(group => {
                  const title =
                    group === "navigation"
                      ? t("common.commandNavigation")
                      : group === "settings"
                        ? command.steps.some(
                            step =>
                              step.kind === "domain" &&
                              (step.domain === "preferences" ||
                                step.domain === "account")
                          )
                          ? t("common.commandQuickSettings")
                          : t("common.commandSettings")
                        : group === "operation"
                          ? t("common.commandActions")
                          : group === "domain" && command.steps.length === 0
                            ? t("common.commandDomains")
                            : t("common.commandSubdomains");
                  const items = command.candidates.filter(
                    item => item.group === group
                  );
                  const inSettings = command.steps.some(
                    step =>
                      step.kind === "domain" &&
                      (step.domain === "preferences" ||
                        step.domain === "account")
                  );
                  const visible =
                    command.query.trim() === "" &&
                    inSettings &&
                    (group === "navigation" || group === "settings")
                      ? items.slice(0, 8)
                      : items;
                  if (visible.length === 0) return null;
                  return (
                    <CommandGroup
                      key={group}
                      heading={title}
                      className="overflow-visible p-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-left [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1"
                    >
                      {visible.map(item => (
                        <AppCommandItem
                          key={item.id}
                          id={item.id}
                          label={item.label}
                          hint={item.hint}
                          icon={item.icon}
                          onSelect={() => {
                            void Promise.resolve(command.choose(item.id)).then(
                              finished => {
                                if (finished) setOpen(false);
                              }
                            );
                          }}
                        />
                      ))}
                    </CommandGroup>
                  );
                })}
              </AppCommandContent>
            </Command>
          </div>
        </>
      )}
    </div>
  );
};

export default AppCommand;
