import { DeferredSuspense } from "@shared/components/commons/DeferredSuspense/DeferredSuspense";
import { Dispatch, lazy, SetStateAction } from "react";
import { useTranslation } from "@shared/hooks/useTranslation";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "../../../dialogs/WidgetDialog/EditWidgetDialog";
import { TodoSetting } from "./setting/todoSetting";

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
