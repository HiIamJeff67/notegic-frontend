import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BasicPreviewWidgets,
  GuidePreviewWidgets,
} from "@/components/widgets/basic/basic";
import { PreviewWidget } from "@/components/widgets/widget";

interface CreateWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (previewWidget: PreviewWidget) => void | Promise<void>;
}

const CreateWidgetDialog = ({
  open,
  onOpenChange,
  onCreate,
}: CreateWidgetDialogProps) => {
  const { t } = useTranslation();
  const previewLabels = {
    clock: {
      name: t("workspace.widgets.clock"),
      description: t("workspace.widgets.clockDescription"),
    },
    timer: {
      name: t("workspace.widgets.timer"),
      description: t("workspace.widgets.timerDescription"),
    },
    todo: {
      name: t("workspace.widgets.todo"),
      description: t("workspace.widgets.todoDescription"),
    },
    calendar: {
      name: t("workspace.widgets.calendar"),
      description: t("workspace.widgets.calendarDescription"),
    },
    scratchPad: {
      name: t("workspace.widgets.scratchPad"),
      description: t("workspace.widgets.scratchPadDescription"),
    },
    guide: {
      name: t("workspace.widgets.guideTitle"),
      description: t("workspace.widgets.guideDescription"),
    },
    videoGuide: {
      name: t("workspace.widgets.videoGuideTitle"),
      description: t("workspace.widgets.videoGuideDescription"),
    },
  };
  useEffect(() => {
    if (open || typeof document === "undefined") return;
    const timerId = window.setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95vw] 
          max-w-md 
          md:max-w-2xl 
          lg:max-w-3xl 
          bg-card shadow-xl rounded-xl p-6 flex flex-col items-center gap-4
        "
      >
        <DialogHeader>
          <DialogTitle>{t("workspace.widgets.addNew")}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t("workspace.widgets.addDescription")}
        </DialogDescription>
        <div className="w-full font-bold mb-2">
          {t("workspace.widgets.basic")}
        </div>
        <div className="w-full flex-1 flex flex-col gap-3 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
          {Object.entries(BasicPreviewWidgets).map(([key, previewWidget]) => (
            <div
              key={key}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-muted hover:bg-accent transition p-4 cursor-pointer"
              onClick={() => onCreate(previewWidget)}
            >
              <div className="flex-1 text-left pr-4">
                <div className="font-bold text-lg">
                  {previewLabels[key as keyof typeof previewLabels].name}
                </div>
                <div className="font-normal text-sm text-muted-foreground mt-1">
                  {previewLabels[key as keyof typeof previewLabels].description}
                </div>
              </div>
              <div
                className="w-[120px] aspect-square shrink-0 flex justify-center items-center border rounded-lg overflow-hidden relative pointer-events-none select-none bg-background shadow-inner"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div
                  className="flex justify-center items-center shrink-0 origin-center"
                  style={{
                    width: "250px",
                    height: "250px",
                    transform: "scale(0.48)",
                  }}
                >
                  <previewWidget.component
                    className="
                      w-full h-full 
                      bg-card rounded-lg
                    "
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full font-bold mb-2">
          {t("workspace.widgets.guides")}
        </div>
        <div className="w-full flex-1 flex flex-col gap-3 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
          {Object.entries(GuidePreviewWidgets).map(([key, previewWidget]) => (
            <div
              key={key}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-muted hover:bg-accent transition p-4 cursor-pointer"
              onClick={() => onCreate(previewWidget)}
            >
              <div className="flex-1 text-left pr-4">
                <div className="font-bold text-lg">
                  {previewLabels[key as keyof typeof previewLabels].name}
                </div>
                <div className="font-normal text-sm text-muted-foreground mt-1">
                  {previewLabels[key as keyof typeof previewLabels].description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWidgetDialog;
