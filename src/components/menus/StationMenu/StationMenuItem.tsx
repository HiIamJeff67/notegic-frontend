import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardList,
  Crown,
  ExternalLink,
  LogOut,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import {
  RoutineIcon,
  StationIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import RoutineMenu from "@/components/menus/RoutineMenu/RoutineMenu";
import RoutineMenuItemSkeleton from "@/components/menus/RoutineMenu/RoutineMenuItemSkeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useAppRouter, useLoading, useModal, useStationRoutine } from "@/hooks";
import { translateError } from "@/i18n/error";

interface StationMenuItemProps {
  station: StationNode;
}

const StationMenuItem = ({ station }: StationMenuItemProps) => {
  const { t } = useTranslation();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const router = useAppRouter();
  const stationRoutineManager = useStationRoutine();
  const routineTaskCount = station.routineTasks.length;

  const handleRenameStationOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await stationRoutineManager
          .renameEditingStation()
          .catch(error => toast.error(translateError(error, t)));
      }),
    [t, loadingManager, stationRoutineManager]
  );

  return (
    <Collapsible open={station.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {stationRoutineManager.isStationEditing(station.id) ? (
            <div className="relative flex h-8 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={stationRoutineManager.inputRef}
                type="text"
                value={stationRoutineManager.editStationName}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm text-ellipsis outline-none"
                onChange={event =>
                  stationRoutineManager.setEditStationName(
                    event.currentTarget.value
                  )
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameStationOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    stationRoutineManager.cancelRenamingStation();
                  }
                }}
              />
              {stationRoutineManager.isNewStationName() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={async event => {
                    event.stopPropagation();
                    await handleRenameStationOnSubmit();
                  }}
                  aria-label={t("workspace.menu.saveStationName")}
                >
                  <CheckIcon className="size-4" />
                </button>
              )}
            </div>
          ) : (
            <HoverCard openDelay={250} closeDelay={100}>
              <HoverCardTrigger asChild>
                <ContextMenuTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full rounded-sm pr-24"
                      onClick={() => {
                        void stationRoutineManager
                          .toggleStation(station.id)
                          .catch(error =>
                            toast.error(translateError(error, t))
                          );
                      }}
                    >
                      {station.isOpen ? (
                        <ChevronDownIcon />
                      ) : (
                        <ChevronRightIcon />
                      )}
                      {station.icon ? (
                        <span className="shrink-0 select-none text-sm">
                          {station.icon}
                        </span>
                      ) : (
                        <StationIcon size={16} />
                      )}
                      <span className="min-w-0 truncate">{station.name}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={8}
                className="z-[90] w-72 rounded-sm p-3 text-xs"
              >
                <HoverDetailCard
                  title={station.name}
                  subtitle={t("workspace.table.station")}
                  id={station.id}
                  rows={[
                    {
                      field: t("workspace.fields.description"),
                      value: station.description || t("workspace.period.none"),
                    },
                    {
                      field: t("workspace.scope.routines"),
                      value: station.routineCount,
                    },
                    {
                      field: t("workspace.table.tasks"),
                      value: routineTaskCount,
                    },
                    {
                      field: t("workspace.menu.permission"),
                      value: station.permission,
                    },
                  ]}
                />
              </HoverCardContent>
            </HoverCard>
          )}
          <ContextMenuContent className="min-w-40">
            <ContextMenuLabel>{t("workspace.menu.view")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  router.push(
                    WebURLPathDictionary.app.routines.byStationId(station.id)
                  )
                }
              >
                <ExternalLink className="mr-2 size-4" />
                {t("workspace.menu.overviewDetail")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.openInspector({
                    type: "station",
                    id: station.id,
                  })
                }
              >
                <SquarePen className="mr-2 size-4" />
                {t("workspace.menu.openInspector")}
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>{t("workspace.menu.add")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onSelect={() => {
                  window.setTimeout(() => {
                    modalManager.open("CreateRoutineDialog", {
                      stationId: station.id,
                      stationName: station.name,
                      onCreated: async routineId => {
                        station.isOpen = true;
                        stationRoutineManager.selectStation(station.id);
                        stationRoutineManager.selectRoutine(routineId);
                      },
                    });
                  }, 0);
                }}
              >
                <RoutineIcon className="mr-2 size-4" />
                {t("workspace.table.routine")}
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>{t("workspace.menu.edit")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.startRenamingStation(station)
                }
              >
                <Pencil className="mr-2 size-4" />
                {t("workspace.menu.rename")}
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                disabled={!stationRoutineManager.canDeleteStation(station.id)}
                onClick={() =>
                  modalManager.open("DeleteStationDialog", {
                    stationId: station.id,
                    stationName: station.name,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                {t("workspace.menu.delete")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  const isOwner =
                    stationRoutineManager.canTransferStationOwnership(
                      station.id
                    );
                  if (!isOwner) {
                    void loadingManager.startAsyncTransactionLoading(async () =>
                      stationRoutineManager
                        .leaveStation(station.id)
                        .catch(error => toast.error(translateError(error, t)))
                    );
                    return;
                  }
                  modalManager.open("CreateShelfItemDialog", {
                    dialogHeader: t("workspace.menu.leaveStation"),
                    dialogDescription: t("workspace.menu.ownerMustChoose"),
                    inputPlaceholder: t("workspace.menu.memberPublicId"),
                    submitLabel: t("workspace.menu.leave"),
                    onCreate: async value =>
                      await loadingManager.startAsyncTransactionLoading(
                        async () =>
                          stationRoutineManager.leaveStation(
                            station.id,
                            value.trim() as UUID
                          )
                      ),
                    onCancel: modalManager.close,
                  });
                }}
              >
                <LogOut className="mr-2 size-4" />
                {t("workspace.menu.leave")}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={
                  !stationRoutineManager.canTransferStationOwnership(station.id)
                }
                onClick={() =>
                  modalManager.open("CreateShelfItemDialog", {
                    dialogHeader: t("workspace.menu.transferStationOwnership"),
                    dialogDescription: t("workspace.menu.enterStationMember"),
                    inputPlaceholder: t("workspace.menu.memberPublicId"),
                    submitLabel: t("workspace.menu.transfer"),
                    onCreate: async value =>
                      await loadingManager.startAsyncTransactionLoading(
                        async () =>
                          stationRoutineManager.transferStationOwnership(
                            station.id,
                            value.trim() as UUID
                          )
                      ),
                    onCancel: modalManager.close,
                  })
                }
              >
                <Crown className="mr-2 size-4" />
                {t("workspace.menu.transferOwnership")}
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        {!stationRoutineManager.isStationEditing(station.id) &&
          (station.routineCount > 0 || routineTaskCount > 0) && (
            <SidebarMenuBadge className="gap-0.5">
              {station.routineCount > 0 && (
                <HoverCard openDelay={250} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <span className="pointer-events-auto flex min-w-4 items-center justify-center px-0.5">
                      {station.routineCount}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="center"
                    className="flex w-auto items-center gap-2 rounded-sm px-3 py-2"
                  >
                    <RoutineIcon className="size-4 text-muted-foreground" />
                    <span className="text-xs">
                      {t("workspace.menu.totalRoutines", {
                        count: station.routineCount,
                      })}
                    </span>
                  </HoverCardContent>
                </HoverCard>
              )}
              {station.routineCount > 0 && routineTaskCount > 0 && (
                <span className="text-current/70" aria-hidden="true">
                  ·
                </span>
              )}
              {routineTaskCount > 0 && (
                <HoverCard openDelay={250} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <span className="pointer-events-auto flex min-w-4 items-center justify-center px-0.5">
                      {routineTaskCount}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="center"
                    className="flex w-auto items-center gap-2 rounded-sm px-3 py-2"
                  >
                    <ClipboardList className="size-4 text-muted-foreground" />
                    <span className="text-xs">
                      {t("workspace.menu.totalRoutineTasks", {
                        count: routineTaskCount,
                      })}
                    </span>
                  </HoverCardContent>
                </HoverCard>
              )}
            </SidebarMenuBadge>
          )}
        <CollapsibleContent>
          <SidebarMenuSub>
            <RoutineMenu station={station} routines={station.routines} />
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default StationMenuItem;
