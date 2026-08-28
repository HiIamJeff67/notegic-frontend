import { generateDynamicDNDType } from "@shared/enums";
import { cn } from "@shared/util/utils";
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StartSurface } from "@/hooks/localPreferences";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { Section, SettingRow, SwitchRow } from "./PreferenceRows";

type RegexDragItem = {
  index: number;
};

interface RegexPatternRowProps {
  pattern: string;
  index: number;
  dndType: string;
  movePattern: (fromIndex: number, toIndex: number) => void;
  onRemove: (patternIndex: number) => void;
}

const RegexPatternRow = ({
  pattern,
  index,
  dndType,
  movePattern,
  onRemove,
}: RegexPatternRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(
    () => ({
      accept: dndType,
      hover(item: RegexDragItem) {
        if (!rowRef.current) return;

        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;

        movePattern(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    }),
    [dndType, index, movePattern]
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: dndType,
      item: () => ({ index }),
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [dndType, index]
  );

  drop(rowRef);
  drag(dragHandleRef);

  return (
    <TableRow
      ref={rowRef}
      className={cn(
        "transition-colors",
        isDragging ? "bg-muted/60 opacity-40" : "opacity-100"
      )}
    >
      <TableCell className="p-2 text-muted-foreground">
        <div
          ref={dragHandleRef}
          className="inline-flex size-7 cursor-grab items-center justify-center active:cursor-grabbing"
        >
          <GripVerticalIcon className="size-4" />
        </div>
      </TableCell>
      <TableCell className="max-w-0 p-2 font-mono text-xs">
        <div className="truncate">{pattern}</div>
      </TableCell>
      <TableCell className="p-2 text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-density-static
          className="size-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(index)}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

interface PrivacyTabProps {
  layout?: "panel" | "article";
}

const PrivacyTab = ({ layout = "panel" }: PrivacyTabProps) => {
  const { preferences, updatePreference } = useLocalPreferences();
  const { t } = useTranslation();
  const [patternInput, setPatternInput] = useState("");
  const [patternError, setPatternError] = useState("");
  const [patternDndType] = useState(() =>
    generateDynamicDNDType("ClipboardGuardRegex")
  );

  const updatePatterns = useCallback(
    (patterns: string[]) => {
      updatePreference("clipboardGuardPatterns", patterns);
    },
    [updatePreference]
  );

  const addPattern = () => {
    const nextPattern = patternInput.trim();
    if (!nextPattern) return;

    try {
      new RegExp(nextPattern);
    } catch {
      setPatternError(t("settingsPage.preferences.privacy.regexInvalid"));
      return;
    }

    if (preferences.clipboardGuardPatterns.includes(nextPattern)) {
      setPatternError(t("settingsPage.preferences.privacy.regexExists"));
      return;
    }

    updatePatterns([...preferences.clipboardGuardPatterns, nextPattern]);
    setPatternInput("");
    setPatternError("");
  };

  const removePattern = (patternIndex: number) => {
    updatePatterns(
      preferences.clipboardGuardPatterns.filter(
        (_, index) => index !== patternIndex
      )
    );
  };

  const movePattern = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const nextPatterns = [...preferences.clipboardGuardPatterns];
      const [draggedPattern] = nextPatterns.splice(fromIndex, 1);
      if (!draggedPattern) return;

      nextPatterns.splice(toIndex, 0, draggedPattern);
      updatePatterns(nextPatterns);
    },
    [preferences.clipboardGuardPatterns, updatePatterns]
  );

  return (
    <div>
      <Section article={layout === "article"}>
        <SettingRow
          title={t("settingsPage.preferences.privacy.startSurface")}
          description={t(
            "settingsPage.preferences.privacy.startSurfaceDescription"
          )}
        >
          <Select
            value={preferences.startSurface}
            onValueChange={value =>
              updatePreference("startSurface", value as StartSurface)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">
                {t("settingsPage.preferences.privacy.dashboard")}
              </SelectItem>
              <SelectItem value="routines">
                {t("settingsPage.preferences.privacy.routines")}
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SwitchRow
          title={t("settingsPage.preferences.privacy.privatePreviews")}
          description={t(
            "settingsPage.preferences.privacy.privatePreviewsDescription"
          )}
          checked={preferences.privatePreviews}
          onCheckedChange={checked =>
            updatePreference("privatePreviews", checked)
          }
        />
        <SwitchRow
          title={t("settingsPage.preferences.privacy.clipboardGuard")}
          description={t(
            "settingsPage.preferences.privacy.clipboardGuardDescription"
          )}
          checked={preferences.clipboardGuard}
          onCheckedChange={checked =>
            updatePreference("clipboardGuard", checked)
          }
        />
        {preferences.clipboardGuard && (
          <div
            className={cn(
              "py-[calc(var(--density-content-padding)*0.75)]",
              layout === "panel" && "border-b border-border/50"
            )}
          >
            <div className="text-sm font-medium">
              {t("settingsPage.preferences.privacy.sensitivePatterns")}
            </div>
            <div className="mt-1 text-sm leading-5 text-muted-foreground">
              {t(
                "settingsPage.preferences.privacy.sensitivePatternsDescription"
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input
                value={patternInput}
                onChange={event => {
                  setPatternInput(event.target.value);
                  setPatternError("");
                }}
                onKeyDown={event => {
                  if (event.key === "Enter") addPattern();
                }}
                placeholder={t(
                  "settingsPage.preferences.privacy.regexPlaceholder"
                )}
              />
              <Button
                type="button"
                size="icon"
                data-density-static
                className="size-9 shrink-0 p-0"
                onClick={addPattern}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
            {patternError && (
              <div className="mt-2 text-xs text-destructive">
                {patternError}
              </div>
            )}
            <div className="mt-3 overflow-hidden rounded-md border border-border">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9 w-10 px-2" />
                    <TableHead className="h-9 px-2 text-left">
                      {t("settingsPage.preferences.privacy.regex")}
                    </TableHead>
                    <TableHead className="h-9 w-12 px-2" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preferences.clipboardGuardPatterns.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="p-4 text-center text-sm text-muted-foreground"
                      >
                        {t("settingsPage.preferences.privacy.noPatterns")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    preferences.clipboardGuardPatterns.map((pattern, index) => (
                      <RegexPatternRow
                        key={pattern}
                        pattern={pattern}
                        index={index}
                        dndType={patternDndType}
                        movePattern={movePattern}
                        onRemove={removePattern}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
};

export default PrivacyTab;
