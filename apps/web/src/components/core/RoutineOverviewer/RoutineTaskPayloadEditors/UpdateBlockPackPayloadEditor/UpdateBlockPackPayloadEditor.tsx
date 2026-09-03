import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const UpdateBlockPackPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: PayloadEditorProps) => {
  const { t } = useTranslation();
  const [blockPackId, setBlockPackId] = useState("");
  const [blocks, setBlocks] = useState("[]");
  const [pattern, setPattern] = useState<RoutineTaskTemplatePattern>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      const payload = JSON.parse(initialPayload);
      setBlockPackId(payload.blockPackId ?? "");
      setBlocks(JSON.stringify(payload.blocks ?? [], null, 2));
      setPattern(payload.pattern ?? {});
    } catch {
      setBlockPackId("");
      setBlocks("[]");
      setPattern({});
    }
    setError("");
  }, [initialPayload, isOpen]);

  let payloadPreview = "{}";
  try {
    payloadPreview = JSON.stringify(
      {
        blockPackId,
        blocks: JSON.parse(blocks),
        ...(Object.keys(pattern).length > 0 && { pattern }),
      },
      null,
      2
    );
  } catch {
    payloadPreview = JSON.stringify({ blockPackId, blocks: [] }, null, 2);
  }

  return (
    <FormPayloadEditor
      isOpen={isOpen}
      purpose={purpose}
      title={t("workspace.payloadEditor.updateBlockPackTitle")}
      description={t("workspace.payloadEditor.updateBlockPackDescription")}
      payloadPreview={payloadPreview}
      error={error}
      onClose={onClose}
      onConfirm={payload => {
        try {
          JSON.parse(blocks);
          onConfirm(payload);
        } catch {
          setError(t("workspace.payloadEditor.invalidUpdatedBlocks"));
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.payloadEditor.blockPackId")}</Label>
        <Input
          value={blockPackId}
          onChange={event => setBlockPackId(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t("workspace.payloadEditor.updatedBlocks")}</Label>
        <Textarea
          value={blocks}
          onChange={event => {
            setBlocks(event.target.value);
            setError("");
          }}
          className="min-h-72 font-mono text-xs"
        />
        <p className="text-muted-foreground text-xs">
          {t("workspace.payloadEditor.updatedBlocksHint")}
        </p>
      </div>
      <TemplatePatternEditor
        label={t("workspace.payloadEditor.patternTable")}
        pattern={pattern}
        onPatternChange={setPattern}
      />
    </FormPayloadEditor>
  );
};

export default UpdateBlockPackPayloadEditor;
