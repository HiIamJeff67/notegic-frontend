import { Dispatch, lazy, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { ClockSetting } from "@/components/widgets/basic/ClockWidget/setting/clockSetting";

const EditClockWidgetDialogContent = lazy(
  () => import("./EditClockWidgetDialogContent")
);

interface EditClockWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: ClockSetting;
  setSetting: Dispatch<SetStateAction<ClockSetting>>;
}

const EditClockWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditClockWidgetDialogProps) => {
  const { t } = useTranslation();
  return (
    <EditWidgetDialog open={open} onOpenChange={onOpenChange}>
      <DeferredSuspense
        trigger={open}
        fallback={
          <EditWidgetDialogContentSkeleton
            title={t("workspace.widgets.editClock")}
            count={6}
          />
        }
        fallbackDelayMs={100}
      >
        <EditClockWidgetDialogContent
          setting={setting}
          setSetting={setSetting}
        />
      </DeferredSuspense>
    </EditWidgetDialog>
  );
};

export default EditClockWidgetDialog;
