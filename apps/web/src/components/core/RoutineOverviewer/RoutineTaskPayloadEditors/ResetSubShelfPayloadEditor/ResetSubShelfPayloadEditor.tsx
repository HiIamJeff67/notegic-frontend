import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FormPayloadEditor from "../FormPayloadEditor";
import { SubShelfPicker } from "../PayloadSearchPickers";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const ResetSubShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const { t } = useTranslation();
  const [subShelfId, setSubShelfId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      setSubShelfId(JSON.parse(initialPayload).subShelfId ?? "");
    } catch {
      setSubShelfId("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title={t("workspace.payloadEditor.resetSubTitle")}
      description={t("workspace.payloadEditor.resetSubDescription")}
      payloadPreview={JSON.stringify({ subShelfId }, null, 2)}
      contentWidthClassName="!w-[min(900px,94vw)]"
      formWidthClassName="max-w-[460px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <SubShelfPicker value={subShelfId} onValueChange={setSubShelfId} />
    </FormPayloadEditor>
  );
};

export default ResetSubShelfPayloadEditor;
