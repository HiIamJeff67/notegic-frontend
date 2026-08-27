import { ScratchPadSetting } from "@widgets/basic/ScratchPadWidget/setting/scratchPadSetting";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { Slider } from "@/components/ui/slider";

interface EditScratchPadWidgetDialogContentProps {
  setting: ScratchPadSetting;
  setSetting: Dispatch<SetStateAction<ScratchPadSetting>>;
}

const EditScratchPadWidgetDialogContent = ({
  setting,
  setSetting,
}: EditScratchPadWidgetDialogContentProps) => {
  const { t } = useTranslation();
  return (
    <EditWidgetDialogContent title={t("workspace.widgets.editScratchPad")}>
      <EditWidgetDialogOption
        title={t("workspace.widgets.scratchPadFontSize")}
        alignment="vertical"
        currentValue={setting.fontSize.toString()}
      >
        <Slider
          max={32}
          min={6}
          step={0.1}
          defaultValue={[setting.fontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, fontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditScratchPadWidgetDialogContent;
