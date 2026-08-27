import { ScratchPadSetting } from "@widgets/basic/ScratchPadWidget/setting/scratchPadSetting";
import { Dispatch, lazy, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";

const EditScratchPadWidgetDialogContent = lazy(
  () => import("./EditScratchPadWidgetDialogContent")
);

interface EditScratchPadWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: ScratchPadSetting;
  setSetting: Dispatch<SetStateAction<ScratchPadSetting>>;
}

const EditScratchPadWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditScratchPadWidgetDialogProps) => {
  const { t } = useTranslation();
  return (
    <EditWidgetDialog open={open} onOpenChange={onOpenChange}>
      <DeferredSuspense
        trigger={open}
        fallback={
          <EditWidgetDialogContentSkeleton
            title={t("workspace.widgets.editScratchPad")}
            count={1}
          />
        }
        fallbackDelayMs={100}
      >
        <EditScratchPadWidgetDialogContent
          setting={setting}
          setSetting={setSetting}
        />
      </DeferredSuspense>
    </EditWidgetDialog>
  );
};

export default EditScratchPadWidgetDialog;
