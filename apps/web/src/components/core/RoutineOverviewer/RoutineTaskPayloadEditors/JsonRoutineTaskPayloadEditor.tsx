import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { translateRoutineTaskPurpose } from "@shared/i18n/workspace";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JsonRoutineTaskPayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  initialPayload: string;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const JsonRoutineTaskPayloadEditor = ({
  isOpen,
  purpose,
  initialPayload,
  onClose,
  onConfirm,
}: JsonRoutineTaskPayloadEditorProps) => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState(initialPayload);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPayload(initialPayload.trim().length > 0 ? initialPayload : "{}");
    setError("");
  }, [initialPayload, isOpen]);

  const save = () => {
    try {
      onConfirm(JSON.stringify(JSON.parse(payload), null, 2));
      onClose();
    } catch {
      setError(t("workspace.validation.invalidJson"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-visible rounded-sm bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.payloadEditor.title")}</DialogTitle>
          <DialogDescription>
            {t("workspace.payloadEditor.generatedJson", {
              purpose: translateRoutineTaskPurpose(purpose, t),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>{t("workspace.payloadEditor.rawJsonPayload")}</Label>
          <Textarea
            value={payload}
            onChange={event => {
              setPayload(event.currentTarget.value);
              setError("");
            }}
            className="min-h-72 font-mono text-xs"
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={save}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JsonRoutineTaskPayloadEditor;
