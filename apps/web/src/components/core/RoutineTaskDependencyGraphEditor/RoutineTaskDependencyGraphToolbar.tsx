import { Download, GitBranch, Plus, RefreshCw, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoutineTaskDependencyGraphToolbarProps {
  isAddMenuOpen: boolean;
  isDirty: boolean;
  isLoading: boolean;
  isRetryingSync: boolean;
  isSaving: boolean;
  pendingSyncCount: number;
  onAddMenuOpenChange: (open: boolean) => void;
  onOpenCreateRoutineTaskDialog: () => void;
  onReset: () => void;
  onRetryPendingSync: () => void;
  onExport: () => void;
  onStartCreatingDependency: () => void;
  onRefresh: () => void;
}

const RoutineTaskDependencyGraphToolbar = ({
  isAddMenuOpen,
  isDirty,
  isLoading,
  isRetryingSync,
  isSaving,
  pendingSyncCount,
  onAddMenuOpenChange,
  onOpenCreateRoutineTaskDialog,
  onReset,
  onRetryPendingSync,
  onExport,
  onStartCreatingDependency,
  onRefresh,
}: RoutineTaskDependencyGraphToolbarProps) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup className="shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 px-0 [&_svg]:size-3.5"
            disabled={isLoading}
            onClick={onRefresh}
            aria-label={t("workspace.viewer.refresh")}
          >
            <RefreshCw className={isLoading ? "animate-spin" : ""} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("workspace.viewer.refresh")}
        </TooltipContent>
      </Tooltip>

      <DropdownMenu open={isAddMenuOpen} onOpenChange={onAddMenuOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-7 px-0 [&_svg]:size-3.5"
                aria-label={t("workspace.fields.create")}
              >
                <Plus />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t("workspace.fields.create")}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem onSelect={onOpenCreateRoutineTaskDialog}>
            <Plus />
            {t("workspace.fields.routineTask")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onStartCreatingDependency}>
            <GitBranch />
            {t("workspace.fields.dependency")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {pendingSyncCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 px-0 [&_svg]:size-3.5"
              disabled={isSaving}
              onClick={onRetryPendingSync}
              aria-label={t("workspace.fields.retrySync")}
            >
              <RefreshCw className={isRetryingSync ? "animate-spin" : ""} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t("workspace.fields.retrySync")}
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 px-0 [&_svg]:size-3.5"
            onClick={onExport}
            aria-label={t("workspace.viewer.export")}
          >
            <Download />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("workspace.viewer.export")}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 px-0 [&_svg]:size-3.5"
            disabled={!isDirty || isSaving}
            onClick={onReset}
            aria-label={t("workspace.fields.reset")}
          >
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("workspace.fields.reset")}
        </TooltipContent>
      </Tooltip>
    </ButtonGroup>
  );
};

export default RoutineTaskDependencyGraphToolbar;
