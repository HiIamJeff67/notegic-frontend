import { useTranslation } from "@shared/i18n/useTranslation";
import {
  Download,
  Plus,
  Power,
  PowerOff,
  SaveIcon,
  Workflow,
} from "lucide-react";
import {
  RoutineTaskActionIcon,
  RoutineTaskStartIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoutineTaskDependencyGraphToolbarProps {
  isAddMenuOpen: boolean;
  isActive: boolean;
  isUpdatingRoutine: boolean;
  onActiveChange: (active: boolean) => void;
  isSaving: boolean;
  canEdit?: boolean;
  isSavingLayout: boolean;
  canSave: boolean;
  onSave: () => void;
  canRealign: boolean;
  onRealign: () => void;
  onAddMenuOpenChange: (open: boolean) => void;
  onOpenCreateRoutineTaskDialog: () => void;
  onAddStartingNode: () => void;
  canAddStartingNode: boolean;
  onExport: () => void;
}

const RoutineTaskDependencyGraphToolbar = ({
  isAddMenuOpen,
  isActive,
  isUpdatingRoutine,
  onActiveChange,
  isSaving,
  canEdit = true,
  isSavingLayout,
  canSave,
  onSave,
  canRealign,
  onRealign,
  onAddMenuOpenChange,
  onOpenCreateRoutineTaskDialog,
  onAddStartingNode,
  canAddStartingNode,
  onExport,
}: RoutineTaskDependencyGraphToolbarProps) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup className="shrink-0 divide-x divide-input rounded-md border border-input bg-background [&>[data-slot=button]]:border-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 px-0 [&_svg]:size-3.5"
            disabled={isSaving || isUpdatingRoutine || !canEdit}
            aria-label={t("workspace.fields.active")}
            aria-pressed={isActive}
            aria-busy={isUpdatingRoutine}
            onClick={() => onActiveChange(!isActive)}
          >
            {isUpdatingRoutine ? (
              <Spinner />
            ) : isActive ? (
              <Power />
            ) : (
              <PowerOff />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isActive ? t("workspace.menu.pause") : t("workspace.menu.resume")}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 px-0 [&_svg]:size-3.5"
            disabled={!canSave || isSaving}
            onClick={onSave}
            aria-label={
              isSavingLayout ? t("workspace.fields.saving") : t("common.save")
            }
            aria-busy={isSavingLayout}
          >
            {isSavingLayout ? (
              <Spinner aria-label={t("workspace.fields.saving")} />
            ) : (
              <SaveIcon />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isSavingLayout ? t("workspace.fields.saving") : t("common.save")}
        </TooltipContent>
      </Tooltip>
      <DropdownMenu open={isAddMenuOpen} onOpenChange={onAddMenuOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 px-0 [&_svg]:size-3.5"
                aria-label={t("workspace.fields.create")}
                disabled={isSaving || !canEdit}
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
          <DropdownMenuItem
            disabled={!canAddStartingNode}
            onSelect={onAddStartingNode}
          >
            <RoutineTaskStartIcon />
            {t("workspace.fields.startingNode")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenCreateRoutineTaskDialog}>
            <RoutineTaskActionIcon />
            {t("workspace.fields.action")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 px-0 [&_svg]:size-3.5"
            disabled={!canRealign}
            onClick={onRealign}
            aria-label={t("workspace.graph.realign")}
          >
            <Workflow />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t("workspace.graph.realign")}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
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
    </ButtonGroup>
  );
};

export default RoutineTaskDependencyGraphToolbar;
