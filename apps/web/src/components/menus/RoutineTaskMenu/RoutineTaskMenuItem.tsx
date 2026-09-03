import { RoutineTaskRecordStatus } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import { Copy, HistoryIcon, SquarePen, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useModal, useStationRoutine } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import {
  translateRoutineTaskPurpose,
  translateRoutineTaskRecordStatus,
} from "@shared/i18n/workspace";

interface RoutineTaskMenuItemProps {
  routineTask: RoutineTaskNode;
}

const RoutineTaskMenuItem = ({ routineTask }: RoutineTaskMenuItemProps) => {
  const { t } = useTranslation();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const executionStatus = routineTask.executionStatus;
  const isRunning = executionStatus === RoutineTaskRecordStatus.Running;
  const statusDotClassName =
    executionStatus === RoutineTaskRecordStatus.Success
      ? "bg-green-500"
      : executionStatus === RoutineTaskRecordStatus.Failed
        ? "bg-red-500"
        : "bg-muted-foreground";
  const displayedStatus = executionStatus
    ? translateRoutineTaskRecordStatus(executionStatus, t)
    : "—";

  return (
    <SidebarMenuSubItem>
      <ContextMenu>
        <HoverCard openDelay={250} closeDelay={100}>
          <HoverCardTrigger asChild>
            <ContextMenuTrigger asChild>
              <SidebarMenuSubButton
                size="sm"
                isActive={
                  stationRoutineManager.selectedRoutineTaskId === routineTask.id
                }
                className="cursor-pointer select-none"
                onClick={() =>
                  stationRoutineManager.selectRoutineTask(routineTask.id)
                }
              >
                {isRunning ? (
                  <Spinner className="size-3 shrink-0 text-sky-500" />
                ) : (
                  <span
                    className={`size-2 shrink-0 rounded-full ${statusDotClassName}`}
                  />
                )}
                <span>{routineTask.title}</span>
              </SidebarMenuSubButton>
            </ContextMenuTrigger>
          </HoverCardTrigger>
          <HoverCardContent
            side="right"
            align="start"
            sideOffset={8}
            collisionPadding={12}
            className="z-[90] w-72 rounded-sm p-3 text-xs"
          >
            <HoverDetailCard
              title={routineTask.title}
              subtitle={t("workspace.scope.routineTasks")}
              id={routineTask.id}
              rows={[
                {
                  field: t("workspace.table.status"),
                  value: displayedStatus,
                },
                {
                  field: t("workspace.table.purpose"),
                  value: translateRoutineTaskPurpose(routineTask.purpose, t),
                },
                {
                  field: t("workspace.fields.priority"),
                  value: routineTask.priority,
                },
                {
                  field: t("workspace.table.routineTasks"),
                  value: routineTask.previousRoutineTaskIds.length,
                },
              ]}
            />
          </HoverCardContent>
        </HoverCard>
        <ContextMenuContent className="min-w-36">
          <ContextMenuLabel>{t("workspace.menu.view")}</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() =>
                modalManager.open("RoutineTaskRecordDialog", {
                  routineTitle: routineTask.title,
                  routineTaskIds: [routineTask.id],
                })
              }
            >
              <HistoryIcon className="mr-2 size-4" />
              {t("workspace.menu.viewAllRecords")}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                stationRoutineManager.selectRoutineTask(routineTask.id);
                stationRoutineManager.openInspector({
                  type: "routineTask",
                  id: routineTask.id,
                });
              }}
            >
              <SquarePen className="mr-2 size-4" />
              {t("workspace.menu.openInspector")}
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuLabel>{t("workspace.menu.add")}</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => {
                void stationRoutineManager
                  .duplicateRoutineTask(routineTask.id)
                  .catch(error => toast.error(translateError(error, t)));
              }}
            >
              <Copy className="mr-2 size-4" />
              {t("workspace.menu.duplicate")}
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuLabel>{t("workspace.menu.edit")}</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                modalManager.open("DeleteRoutineTaskDialog", {
                  routineTaskId: routineTask.id,
                  routineTaskTitle: routineTask.title,
                  onDeleted: stationRoutineManager.refresh,
                })
              }
            >
              <Trash2 className="mr-2 size-4" />
              {t("workspace.menu.delete")}
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </SidebarMenuSubItem>
  );
};

export default RoutineTaskMenuItem;
