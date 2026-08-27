import { TimerSetting } from "@widgets/basic/TimerWidget/setting/timerSetting";
import { Dispatch, lazy, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";

const EditTimerWidgetDialogContent = lazy(
  () => import("./EditTimerWidgetDialogContent")
);

interface EditTimerWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: TimerSetting;
  setSetting: Dispatch<SetStateAction<TimerSetting>>;
}

const EditTimerWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditTimerWidgetDialogProps) => {
  const { t } = useTranslation();
  return (
    <EditWidgetDialog open={open} onOpenChange={onOpenChange}>
      <DeferredSuspense
        trigger={open}
        fallback={
          <EditWidgetDialogContentSkeleton
            title={t("workspace.widgets.editTimer")}
            count={3}
          />
        }
        fallbackDelayMs={100}
      >
        <EditTimerWidgetDialogContent
          setting={setting}
          setSetting={setSetting}
        />
      </DeferredSuspense>
    </EditWidgetDialog>
  );
};

export default EditTimerWidgetDialog;
