import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type RoutineTaskTemplatePattern = Record<
  string,
  {
    source:
      | "scheduledAt"
      | "recordId"
      | "shortRecordId"
      | "routineTaskId"
      | "blockText"
      | "blockCheckboxCount";
    format?: string;
    timezone?: string;
    blockId?: string;
    blockPackId?: string;
    checked?: boolean;
  }
>;

interface TemplatePatternEditorProps {
  label: string;
  pattern: RoutineTaskTemplatePattern;
  onPatternChange: (pattern: RoutineTaskTemplatePattern) => void;
}

const TemplatePatternEditor = ({
  label,
  pattern,
  onPatternChange,
}: TemplatePatternEditorProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingPattern, setEditingPattern] = useState<{
    originalToken: string;
    token: string;
    binding: RoutineTaskTemplatePattern[string];
  } | null>(null);

  const updateEditingBinding = (
    binding: RoutineTaskTemplatePattern[string]
  ) => {
    setEditingPattern(current => (current ? { ...current, binding } : current));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label>{label}</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("workspace.payloadEditor.valuesAvailableAsTokens", {
              token: "{{token}}",
            })}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => {
            let index = Object.keys(pattern).length + 1;
            while (pattern[`date${index}`]) index += 1;
            onPatternChange({
              ...pattern,
              [`date${index}`]: {
                source: "scheduledAt",
                format: "2006-01-02",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            });
            setIsExpanded(true);
          }}
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col">
        <div
          className={
            isExpanded
              ? "h-72 min-h-72 shrink-0 overflow-y-auto overflow-x-hidden rounded-t-sm border bg-background"
              : "h-24 min-h-24 shrink-0 overflow-hidden rounded-t-sm border bg-background"
          }
        >
          <Table className="table-fixed !w-auto">
            <TableHeader>
              <TableRow className="transition-none hover:bg-transparent">
                <TableHead className="h-8 w-[84px] p-1 text-left">
                  {t("workspace.payloadEditor.token")}
                </TableHead>
                <TableHead className="h-8 w-[96px] p-1 text-left">
                  {t("workspace.payloadEditor.source")}
                </TableHead>
                <TableHead className="h-8 w-[88px] p-1 text-left">
                  {t("workspace.payloadEditor.target")}
                </TableHead>
                <TableHead className="h-8 w-[72px] p-1 text-left">
                  {t("workspace.payloadEditor.option")}
                </TableHead>
                <TableHead className="h-8 w-12 p-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(pattern).length === 0 ? (
                <TableRow className="transition-none hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-56 px-2 py-6 text-center text-xs text-muted-foreground"
                  >
                    {t("workspace.payloadEditor.noPatternValues")}
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(pattern).map(([token, binding]) => {
                  const target =
                    binding.source === "blockText"
                      ? binding.blockId
                      : binding.source === "blockCheckboxCount"
                        ? binding.blockPackId
                        : binding.format;
                  const option =
                    binding.source === "blockCheckboxCount"
                      ? binding.checked === undefined
                        ? t("workspace.payloadEditor.any")
                        : binding.checked
                          ? t("workspace.payloadEditor.checked")
                          : t("workspace.payloadEditor.unchecked")
                      : binding.timezone;

                  return (
                    <TableRow
                      key={token}
                      className="transition-none hover:bg-transparent"
                    >
                      <TableCell
                        className="w-[84px] min-w-[8ch] truncate p-1 text-xs"
                        title={`{{${token}}}`}
                      >
                        {token}
                      </TableCell>
                      <TableCell
                        className="min-w-0 truncate p-1 text-xs"
                        title={binding.source}
                      >
                        {binding.source}
                      </TableCell>
                      <TableCell
                        className="min-w-0 truncate p-1 text-xs"
                        title={target}
                      >
                        {target || "—"}
                      </TableCell>
                      <TableCell
                        className="min-w-0 truncate p-1 text-xs"
                        title={option}
                      >
                        {option || "—"}
                      </TableCell>
                      <TableCell className="w-12 p-0">
                        <div className="flex min-w-12 items-center justify-center gap-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0"
                            aria-label={t("workspace.payloadEditor.editToken", {
                              token,
                            })}
                            onClick={() =>
                              setEditingPattern({
                                originalToken: token,
                                token,
                                binding: { ...binding },
                              })
                            }
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0"
                            aria-label={t(
                              "workspace.payloadEditor.deleteToken",
                              { token }
                            )}
                            onClick={() => {
                              const nextPattern = { ...pattern };
                              delete nextPattern[token];
                              onPatternChange(nextPattern);
                            }}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="-mt-px h-8 min-h-8 w-full shrink-0 rounded-t-none rounded-b-sm py-0"
          onClick={() => setIsExpanded(current => !current)}
        >
          {isExpanded
            ? t("workspace.payloadEditor.close")
            : t("workspace.payloadEditor.expand")}
        </Button>
      </div>

      <Dialog
        modal={false}
        open={editingPattern !== null}
        onOpenChange={open => !open && setEditingPattern(null)}
      >
        <DialogContent
          showOverlay={false}
          className="z-[230] w-[min(480px,calc(100vw-2rem))] rounded-sm"
        >
          <DialogHeader>
            <DialogTitle>
              {t("workspace.payloadEditor.editPattern")}
            </DialogTitle>
          </DialogHeader>
          {editingPattern && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="pattern-token">
                  {t("workspace.payloadEditor.token")}
                </Label>
                <Input
                  id="pattern-token"
                  value={editingPattern.token}
                  onChange={event =>
                    setEditingPattern(current =>
                      current
                        ? { ...current, token: event.currentTarget.value }
                        : current
                    )
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pattern-source">
                  {t("workspace.payloadEditor.source")}
                </Label>
                <select
                  id="pattern-source"
                  value={editingPattern.binding.source}
                  onChange={event => {
                    const source = event.currentTarget.value as
                      | "scheduledAt"
                      | "recordId"
                      | "shortRecordId"
                      | "routineTaskId"
                      | "blockText"
                      | "blockCheckboxCount";
                    const binding = editingPattern.binding;
                    updateEditingBinding(
                      source === "scheduledAt"
                        ? {
                            source,
                            format: binding.format,
                            timezone: binding.timezone,
                          }
                        : source === "blockText"
                          ? { source, blockId: binding.blockId }
                          : source === "blockCheckboxCount"
                            ? {
                                source,
                                blockPackId: binding.blockPackId,
                                checked: binding.checked,
                              }
                            : { source }
                    );
                  }}
                  className="h-9 w-full rounded-sm border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="scheduledAt">scheduledAt</option>
                  <option value="recordId">recordId</option>
                  <option value="shortRecordId">shortRecordId</option>
                  <option value="routineTaskId">routineTaskId</option>
                  <option value="blockText">blockText</option>
                  <option value="blockCheckboxCount">blockCheckboxCount</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pattern-target">
                  {t("workspace.payloadEditor.target")}
                </Label>
                <Input
                  id="pattern-target"
                  value={
                    editingPattern.binding.source === "blockText"
                      ? (editingPattern.binding.blockId ?? "")
                      : editingPattern.binding.source === "blockCheckboxCount"
                        ? (editingPattern.binding.blockPackId ?? "")
                        : (editingPattern.binding.format ?? "")
                  }
                  disabled={
                    editingPattern.binding.source !== "scheduledAt" &&
                    editingPattern.binding.source !== "blockText" &&
                    editingPattern.binding.source !== "blockCheckboxCount"
                  }
                  placeholder={
                    editingPattern.binding.source === "blockText"
                      ? t("workspace.payloadEditor.blockId")
                      : editingPattern.binding.source === "blockCheckboxCount"
                        ? t("workspace.payloadEditor.blockPackId")
                        : "2006-01-02"
                  }
                  onChange={event => {
                    const value = event.currentTarget.value || undefined;
                    const binding = editingPattern.binding;
                    updateEditingBinding(
                      binding.source === "blockText"
                        ? { ...binding, blockId: value }
                        : binding.source === "blockCheckboxCount"
                          ? { ...binding, blockPackId: value }
                          : { ...binding, format: value }
                    );
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pattern-option">
                  {t("workspace.payloadEditor.option")}
                </Label>
                {editingPattern.binding.source === "blockCheckboxCount" ? (
                  <select
                    id="pattern-option"
                    value={
                      editingPattern.binding.checked === undefined
                        ? ""
                        : editingPattern.binding.checked
                          ? "true"
                          : "false"
                    }
                    onChange={event =>
                      updateEditingBinding({
                        ...editingPattern.binding,
                        checked:
                          event.currentTarget.value === ""
                            ? undefined
                            : event.currentTarget.value === "true",
                      })
                    }
                    className="h-9 w-full rounded-sm border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="">{t("workspace.payloadEditor.any")}</option>
                    <option value="true">
                      {t("workspace.payloadEditor.checked")}
                    </option>
                    <option value="false">
                      {t("workspace.payloadEditor.unchecked")}
                    </option>
                  </select>
                ) : (
                  <Input
                    id="pattern-option"
                    value={editingPattern.binding.timezone ?? ""}
                    disabled={editingPattern.binding.source !== "scheduledAt"}
                    placeholder="Asia/Taipei"
                    onChange={event =>
                      updateEditingBinding({
                        ...editingPattern.binding,
                        timezone: event.currentTarget.value || undefined,
                      })
                    }
                  />
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingPattern(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!editingPattern?.token.trim()) return;
                const nextPattern = { ...pattern };
                delete nextPattern[editingPattern.originalToken];
                nextPattern[editingPattern.token.trim()] =
                  editingPattern.binding;
                onPatternChange(nextPattern);
                setEditingPattern(null);
              }}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatePatternEditor;
