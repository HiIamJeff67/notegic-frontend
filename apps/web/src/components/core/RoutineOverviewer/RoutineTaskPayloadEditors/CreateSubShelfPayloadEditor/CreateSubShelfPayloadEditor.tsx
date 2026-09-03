import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormPayloadEditor from "../FormPayloadEditor";
import { ShelfLocationPicker } from "../PayloadSearchPickers";
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

const CreateSubShelfPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const { t } = useTranslation();
  const [fakeId, setFakeId] = useState("");
  const [rootShelfId, setRootShelfId] = useState("");
  const [prevSubShelfId, setPrevSubShelfId] = useState("");
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState<RoutineTaskTemplatePattern>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setFakeId(
        typeof payload.fakeId === "string" && payload.fakeId.length > 0
          ? payload.fakeId
          : `f_${globalThis.crypto.randomUUID().replaceAll("-", "")}`
      );
      setRootShelfId(payload.rootShelfId ?? "");
      setPrevSubShelfId(payload.prevSubShelfId ?? "");
      setName(payload.name ?? "");
      setPattern(payload.pattern ?? {});
    } catch {
      setFakeId(`f_${globalThis.crypto.randomUUID().replaceAll("-", "")}`);
      setRootShelfId("");
      setPrevSubShelfId("");
      setName("");
      setPattern({});
    }
  }, [initialPayload, isOpen]);

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title={t("workspace.payloadEditor.createSubTitle")}
      description={t("workspace.payloadEditor.createSubDescription")}
      payloadPreview={JSON.stringify(
        {
          fakeId,
          rootShelfId,
          prevSubShelfId: prevSubShelfId.trim() ? prevSubShelfId : null,
          ...(name.trim() && { name }),
          ...(Object.keys(pattern).length > 0 && { pattern }),
        },
        null,
        2
      )}
      contentWidthClassName="!w-[min(1040px,95vw)]"
      formWidthClassName="max-w-[520px]"
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.payloadEditor.fakeId")}</Label>
        <Input
          value={fakeId}
          onChange={event => setFakeId(event.target.value)}
          placeholder={t("workspace.payloadEditor.fakeIdExample")}
        />
      </div>
      <ShelfLocationPicker
        mode="root-or-sub"
        label={t("workspace.payloadEditor.parentLocation")}
        placeholder={t("workspace.payloadEditor.selectParent")}
        rootShelfId={rootShelfId}
        subShelfId={prevSubShelfId}
        onSelectRoot={nextRootShelfId => {
          setRootShelfId(nextRootShelfId);
          setPrevSubShelfId("");
        }}
        onSelectSub={(nextPrevSubShelfId, nextRootShelfId) => {
          setRootShelfId(nextRootShelfId);
          setPrevSubShelfId(nextPrevSubShelfId);
        }}
      />
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.payloadEditor.parentReference")}</Label>
        <Input
          value={prevSubShelfId}
          onChange={event => setPrevSubShelfId(event.target.value)}
          placeholder={t("workspace.payloadEditor.parentReferenceExample")}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.fields.name")}</Label>
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder={t("workspace.payloadEditor.nameExampleSub")}
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

export default CreateSubShelfPayloadEditor;
