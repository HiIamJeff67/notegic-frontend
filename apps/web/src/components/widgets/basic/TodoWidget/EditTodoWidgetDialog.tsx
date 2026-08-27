import { TodoSetting } from "@widgets/basic/TodoWidget/setting/todoSetting";
import { Dispatch, lazy, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";

const EditTodoWidgetDialogContent = lazy(
  () => import("./EditTodoWidgetDialogContent")
);

interface EditTodoWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: TodoSetting;
  setSetting: Dispatch<SetStateAction<TodoSetting>>;
}

const EditTodoWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditTodoWidgetDialogProps) => {
  const { t } = useTranslation();
  return (
    <EditWidgetDialog open={open} onOpenChange={onOpenChange}>
      <DeferredSuspense
        trigger={open}
        fallback={
          <EditWidgetDialogContentSkeleton
            title={t("workspace.widgets.editTodo")}
            count={3}
          />
        }
        fallbackDelayMs={100}
      >
        <EditTodoWidgetDialogContent
          setting={setting}
          setSetting={setSetting}
        />
      </DeferredSuspense>
    </EditWidgetDialog>
  );
};

export default EditTodoWidgetDialog;
