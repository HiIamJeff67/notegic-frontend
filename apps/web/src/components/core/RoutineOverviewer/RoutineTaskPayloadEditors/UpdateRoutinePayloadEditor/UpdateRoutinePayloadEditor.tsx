import {
  AllRoutinePeriods,
  RoutineTaskPurpose,
} from "@shared/api/interfaces/enums";
import { translateRoutinePeriod } from "@shared/i18n/workspace";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "@/components/commons/DatePicker/DatePicker";
import TimezoneSelector from "@/components/commons/TimezoneSelector/TimezoneSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FormPayloadEditor from "../FormPayloadEditor";
import TemplatePatternEditor, {
  type RoutineTaskTemplatePattern,
} from "../TemplatePatternEditor";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const UpdateRoutinePayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const { t } = useTranslation();
  const [routineId, setRoutineId] = useState("");
  const [title, setTitle] = useState("");
  const [pattern, setPattern] = useState<RoutineTaskTemplatePattern>({});
  const [description, setDescription] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [scheduledStartAt, setScheduledStartAt] = useState("");
  const [scheduledEndAt, setScheduledEndAt] = useState("");
  const [period, setPeriod] = useState("None");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setRoutineId(payload.routineId ?? "");
      setTitle(payload.title ?? "");
      setPattern(payload.pattern ?? {});
      setDescription(payload.description ?? "");
      setIsPinned(Boolean(payload.isPinned));
      setScheduledStartAt(
        payload.scheduledStartAt
          ? new Date(payload.scheduledStartAt).toISOString().slice(0, 16)
          : ""
      );
      setScheduledEndAt(
        payload.scheduledEndAt
          ? new Date(payload.scheduledEndAt).toISOString().slice(0, 16)
          : ""
      );
      setPeriod(payload.period ?? "None");
      setTimezone(payload.timezone ?? "");
    } catch {
      setRoutineId("");
      setTitle("");
      setPattern({});
      setDescription("");
      setIsPinned(false);
      setScheduledStartAt("");
      setScheduledEndAt("");
      setPeriod("None");
      setTimezone("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title={t("workspace.payloadEditor.updateRoutineTitle")}
      description={t("workspace.payloadEditor.updateRoutineDescription")}
      payloadPreview={JSON.stringify(
        {
          routineId,
          ...(title.trim() && { title: title.trim() }),
          ...(Object.keys(pattern).length > 0 && {
            pattern,
          }),
          ...(description.trim() && { description }),
          isPinned,
          ...(scheduledStartAt && {
            scheduledStartAt: new Date(scheduledStartAt).toISOString(),
          }),
          ...(scheduledEndAt && {
            scheduledEndAt: new Date(scheduledEndAt).toISOString(),
          }),
          period: period === "None" ? null : period,
          ...(timezone.trim() && { timezone }),
        },
        null,
        2
      )}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.payloadEditor.routineId")}</Label>
        <Input
          value={routineId}
          onChange={event => setRoutineId(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>{t("workspace.fields.title")}</Label>
          <Input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder={t("workspace.payloadEditor.routineTitleExample")}
          />
        </div>
      </div>
      <TemplatePatternEditor
        label={t("workspace.payloadEditor.patternTable")}
        pattern={pattern}
        onPatternChange={setPattern}
      />
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.fields.description")}</Label>
        <Textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          className="min-h-24"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>{t("workspace.payloadEditor.scheduledStart")}</Label>
          <DatePicker
            value={scheduledStartAt ? new Date(scheduledStartAt) : undefined}
            onValueChange={value => {
              value?.setSeconds(0, 0);
              setScheduledStartAt(value ? value.toISOString() : "");
            }}
            placeholder={t("workspace.fields.selectStartDateTime")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("workspace.payloadEditor.scheduledEnd")}</Label>
          <DatePicker
            value={scheduledEndAt ? new Date(scheduledEndAt) : undefined}
            onValueChange={value => {
              value?.setSeconds(0, 0);
              setScheduledEndAt(value ? value.toISOString() : "");
            }}
            placeholder={t("workspace.fields.selectEndDateTime")}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>{t("workspace.payloadEditor.period")}</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[190]">
              <SelectItem value="None">{t("workspace.period.none")}</SelectItem>
              {AllRoutinePeriods.map(routinePeriod => (
                <SelectItem key={routinePeriod} value={routinePeriod}>
                  {translateRoutinePeriod(routinePeriod, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("workspace.inspector.timezone")}</Label>
          <TimezoneSelector value={timezone} onValueChange={setTimezone} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={isPinned}
          onCheckedChange={checked => setIsPinned(checked === true)}
        />
        {t("workspace.routine.pin")}
      </label>
    </FormPayloadEditor>
  );
};

export default UpdateRoutinePayloadEditor;
