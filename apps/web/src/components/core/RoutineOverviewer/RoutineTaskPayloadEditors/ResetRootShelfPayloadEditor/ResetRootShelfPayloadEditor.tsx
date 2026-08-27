import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FormPayloadEditor from "../FormPayloadEditor";
import { RootShelfPicker } from "../PayloadSearchPickers";

interface PayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const ResetRootShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const { t } = useTranslation();
  const [rootShelfId, setRootShelfId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      setRootShelfId(JSON.parse(initialPayload).rootShelfId ?? "");
    } catch {
      setRootShelfId("");
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title={t("workspace.payloadEditor.resetRootTitle")}
      description={t("workspace.payloadEditor.resetRootDescription")}
      payloadPreview={JSON.stringify({ rootShelfId }, null, 2)}
      contentWidthClassName="!w-[min(900px,94vw)]"
      formWidthClassName="max-w-[460px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <RootShelfPicker value={rootShelfId} onValueChange={setRootShelfId} />
    </FormPayloadEditor>
  );
};

export default ResetRootShelfPayloadEditor;
