import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const ResetBlockPackPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const { t } = useTranslation();
  const [blockPackId, setBlockPackId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      setBlockPackId(JSON.parse(initialPayload).blockPackId ?? "");
    } catch {
      setBlockPackId("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title={t("workspace.payloadEditor.resetBlockPackTitle")}
      description={t("workspace.payloadEditor.resetBlockPackDescription")}
      payloadPreview={JSON.stringify({ blockPackId }, null, 2)}
      contentWidthClassName="!w-[min(900px,94vw)]"
      formWidthClassName="max-w-[460px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.payloadEditor.blockPackId")}</Label>
        <Input
          value={blockPackId}
          onChange={event => setBlockPackId(event.target.value)}
        />
      </div>
    </FormPayloadEditor>
  );
};

export default ResetBlockPackPayloadEditor;
