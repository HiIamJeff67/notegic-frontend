import { useTranslation } from "@shared/i18n/useTranslation";
import { Download, Plus, RefreshCw, Workflow } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoutineTaskDependencyGraphToolbarProps {
  isAddMenuOpen: boolean;
  isRetryingSync: boolean;
  isSaving: boolean;
  canRealign: boolean;
  onRealign: () => void;
  pendingSyncCount: number;
  onAddMenuOpenChange: (open: boolean) => void;
  onOpenCreateRoutineTaskDialog: () => void;
  onAddStartingNode: () => void;
  canAddStartingNode: boolean;
  onRetryPendingSync: () => void;
  onExport: () => void;
}

const RoutineTaskDependencyGraphToolbar = ({
  isAddMenuOpen,
  isRetryingSync,
  isSaving,
  canRealign,
  onRealign,
  pendingSyncCount,
  onAddMenuOpenChange,
  onOpenCreateRoutineTaskDialog,
  onAddStartingNode,
  canAddStartingNode,
  onRetryPendingSync,
  onExport,
}: RoutineTaskDependencyGraphToolbarProps) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup className="shrink-0">
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

      {pendingSyncCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
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
