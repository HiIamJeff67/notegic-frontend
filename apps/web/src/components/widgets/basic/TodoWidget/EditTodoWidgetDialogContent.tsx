import { TodoSetting } from "@widgets/basic/TodoWidget/setting/todoSetting";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
  EditWidgetDialogSeparator,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { Slider } from "@/components/ui/slider";

interface EditTodoWidgetDialogContentProps {
  setting: TodoSetting;
  setSetting: Dispatch<SetStateAction<TodoSetting>>;
}

const EditTodoWidgetDialogContent = ({
  setting,
  setSetting,
}: EditTodoWidgetDialogContentProps) => {
  const { t } = useTranslation();
  return (
    <EditWidgetDialogContent title={t("workspace.widgets.editTodo")}>
      <EditWidgetDialogOption
        title={t("workspace.widgets.titleFontSize")}
        alignment="vertical"
        currentValue={setting.titleFontSize.toString()}
      >
        <Slider
          max={28}
          min={6}
          step={0.1}
          defaultValue={[setting.titleFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, titleFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.itemFontSize")}
        alignment="vertical"
        currentValue={setting.itemFontSize.toString()}
      >
        <Slider
          max={24}
          min={6}
          step={0.1}
          defaultValue={[setting.itemFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, itemFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title={t("workspace.widgets.itemHeight")}
        alignment="vertical"
        currentValue={setting.itemHeight.toString()}
      >
        <Slider
          max={36}
          min={26}
          step={0.1}
          defaultValue={[setting.itemHeight]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, itemHeight: value[0] }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditTodoWidgetDialogContent;
