import { DeferredSuspense } from "@shared/components/commons/DeferredSuspense/DeferredSuspense";
import { Dispatch, lazy, SetStateAction } from "react";
import { useTranslation } from "@shared/hooks/useTranslation";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "../../../dialogs/WidgetDialog/EditWidgetDialog";
import { ScratchPadSetting } from "./setting/scratchPadSetting";

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
