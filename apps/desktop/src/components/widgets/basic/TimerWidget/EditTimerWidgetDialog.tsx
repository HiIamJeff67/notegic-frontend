import { DeferredSuspense } from "@shared/components/commons/DeferredSuspense/DeferredSuspense";
import { Dispatch, lazy, SetStateAction } from "react";
import { useTranslation } from "@shared/hooks/useTranslation";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "../../../dialogs/WidgetDialog/EditWidgetDialog";
import { TimerSetting } from "./setting/timerSetting";

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
