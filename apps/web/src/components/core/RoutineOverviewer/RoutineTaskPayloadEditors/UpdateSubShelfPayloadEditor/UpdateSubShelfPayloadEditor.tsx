import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
import { SubShelfPicker } from "../PayloadSearchPickers";
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

const UpdateSubShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const { t } = useTranslation();
  const [subShelfId, setSubShelfId] = useState("");
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState<RoutineTaskTemplatePattern>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setSubShelfId(payload.subShelfId ?? "");
      setName(payload.name ?? "");
      setPattern(payload.pattern ?? {});
    } catch {
      setSubShelfId("");
      setName("");
      setPattern({});
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title={t("workspace.payloadEditor.updateSubTitle")}
      description={t("workspace.payloadEditor.updateSubDescription")}
      payloadPreview={JSON.stringify(
        {
          subShelfId,
          ...(name.trim() && { name }),
          ...(Object.keys(pattern).length > 0 && { pattern }),
        },
        null,
        2
      )}
      contentWidthClassName="!w-[min(940px,94vw)]"
      formWidthClassName="max-w-[460px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <SubShelfPicker value={subShelfId} onValueChange={setSubShelfId} />
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.fields.name")}</Label>
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder={t("workspace.payloadEditor.nameExampleUpdate")}
        />
      </div>
      <TemplatePatternEditor
        label={t("workspace.payloadEditor.patternTable")}
        pattern={pattern}
        onPatternChange={setPattern}
      />
    </FormPayloadEditor>
  );
};

export default UpdateSubShelfPayloadEditor;
