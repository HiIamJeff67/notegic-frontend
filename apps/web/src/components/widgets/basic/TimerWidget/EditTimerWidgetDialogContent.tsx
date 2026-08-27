import { TimerSetting } from "@widgets/basic/TimerWidget/setting/timerSetting";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
  EditWidgetDialogSeparator,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface EditTimerWidgetDialogContentProps {
  setting: TimerSetting;
  setSetting: Dispatch<SetStateAction<TimerSetting>>;
}

const EditTimerWidgetDialogContent = ({
  setting,
  setSetting,
}: EditTimerWidgetDialogContentProps) => {
  const { t } = useTranslation();
  return (
    <EditWidgetDialogContent title={t("workspace.widgets.editTimer")}>
      <EditWidgetDialogOption
        title={t("workspace.widgets.timerFontSize")}
        alignment="vertical"
        currentValue={setting.counterFontSize.toString()}
      >
        <Slider
          max={64}
          min={16}
          step={0.1}
          defaultValue={[setting.counterFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, counterFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.buttonFontSize")}
        alignment="vertical"
        currentValue={setting.buttonSize.toString()}
      >
        <Slider
          max={24}
          min={8}
          step={0.1}
          defaultValue={[setting.buttonSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, buttonSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.quietMode")}
        description={t("workspace.widgets.quietModeDescription")}
      >
        <Switch
          checked={setting.isSilence}
          onCheckedChange={checked =>
            setSetting(prev => ({
              ...prev,
              isSilence: checked,
            }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditTimerWidgetDialogContent;
