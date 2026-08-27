import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { cn } from "@shared/util/utils";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { translateRoutineTaskPurpose } from "@shared/i18n/workspace";

interface FormPayloadEditorProps {
  isOpen: boolean;
  purpose: RoutineTaskPurpose;
  title: string;
  description: string;
  payloadPreview: string;
  error?: string;
  contentWidthClassName?: string;
  formWidthClassName?: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: (payload: string) => void;
}

const FormPayloadEditor = ({
  isOpen,
  purpose,
  title,
  description,
  payloadPreview,
  error,
  contentWidthClassName,
  formWidthClassName,
  children,
  onClose,
  onConfirm,
}: FormPayloadEditorProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className={cn(
          "z-[180] max-h-[92vh] !w-[min(1120px,96vw)] !max-w-none overflow-hidden rounded-sm bg-card p-0",
          contentWidthClassName
        )}
      >
        <DialogHeader className="border-b bg-secondary px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_440px] gap-3 overflow-hidden px-6 py-5">
          <div
            className={cn(
              "flex max-h-[68vh] min-h-0 w-full max-w-[560px] flex-col gap-5 overflow-y-auto px-1 pb-1 pr-3",
              formWidthClassName
            )}
          >
            {children}
          </div>

          <div className="flex max-h-[68vh] min-h-0 flex-col gap-2">
            <div>
              <Label>{t("workspace.payloadEditor.payloadPreview")}</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("workspace.payloadEditor.generatedJson", {
                  purpose: translateRoutineTaskPurpose(purpose, t),
                })}
              </p>
            </div>
            <Card className="min-h-0 flex-1 overflow-hidden rounded-sm bg-background py-0">
              <CardContent className="h-full overflow-auto p-4">
                <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                  {payloadPreview}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="border-t bg-secondary px-6 py-4">
          <span className="mr-auto self-center text-xs text-muted-foreground">
            {t("workspace.payloadEditor.estimatedCost", {
              count: Math.ceil(new Blob([payloadPreview]).size / 1024),
            })}
          </span>
          {error && <span className="text-destructive text-xs">{error}</span>}
          <Button type="button" variant="destructive" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              JSON.parse(payloadPreview);
              onConfirm(JSON.stringify(JSON.parse(payloadPreview), null, 2));
              onClose();
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormPayloadEditor;
