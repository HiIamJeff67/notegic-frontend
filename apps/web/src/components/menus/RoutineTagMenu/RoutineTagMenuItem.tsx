import toast from "@shared/lib/toast";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  Copy,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import { RoutineIcon } from "@/components/icons/WorkspaceEntityIcons";
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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
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
import { useLoading, useModal, useStationRoutine } from "@/hooks";
import { translateError } from "@shared/i18n/error";

interface RoutineTagMenuItemProps {
  routineTag: RoutineTagNode;
}

const RoutineTagMenuItem = ({ routineTag }: RoutineTagMenuItemProps) => {
  const { i18n, t } = useTranslation();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const availableRoutines = stationRoutineManager.routines;
  const visibleRoutineCount = routineTag.isExpanded
    ? routineTag.routineCount
    : 0;

  const handleRenameRoutineTagOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await stationRoutineManager
          .renameEditingRoutineTag()
          .catch(error => toast.error(translateError(error, t)));
      }),
    [t, loadingManager, stationRoutineManager]
  );

  return (
    <Collapsible open={routineTag.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {stationRoutineManager.isRoutineTagEditing(routineTag.id) ? (
            <div className="relative flex h-8 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={stationRoutineManager.routineTagNameInputRef}
                type="text"
                value={stationRoutineManager.editRoutineTagName}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm outline-none"
                onChange={event =>
                  stationRoutineManager.setEditRoutineTagName(
                    event.currentTarget.value
                  )
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameRoutineTagOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    stationRoutineManager.cancelRenamingRoutineTag();
                  }
                }}
              />
              {stationRoutineManager.isNewRoutineTagName() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={async event => {
                    event.stopPropagation();
                    await handleRenameRoutineTagOnSubmit();
                  }}
                  aria-label={t("workspace.menu.saveRoutineTagName")}
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
                      className="w-full rounded-sm pr-12"
                      onClick={() => {
                        stationRoutineManager.selectRoutineTag(routineTag.id);
                        void stationRoutineManager
                          .toggleRoutineTag(routineTag.id)
                          .catch(error =>
                            toast.error(translateError(error, t))
                          );
                      }}
                    >
                      {routineTag.isOpen ? <ChevronDown /> : <ChevronRight />}
                      <span
                        className="size-3 shrink-0 rounded-[2px] border border-border/60"
                        style={{ backgroundColor: routineTag.color }}
                      />
                      {routineTag.icon && (
                        <span className="shrink-0 select-none text-sm">
                          {routineTag.icon}
                        </span>
                      )}
                      <span>{routineTag.name}</span>
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
                  title={routineTag.name}
                  subtitle={t("workspace.scope.routineTags")}
                  id={routineTag.id}
                  rows={[
                    {
                      field: t("workspace.fields.color"),
                      value: (
                        <span className="inline-flex min-w-0 items-center justify-end gap-1.5">
                          <span
                            className="size-2.5 shrink-0 rounded-[2px] border border-border/60"
                            style={{ backgroundColor: routineTag.color }}
                          />
                          <span className="truncate">{routineTag.color}</span>
                        </span>
                      ),
                    },
                    {
                      field: t("workspace.fields.icon"),
                      value: routineTag.icon ?? t("workspace.period.none"),
                    },
                    {
                      field: t("workspace.scope.routines"),
                      value: routineTag.routineCount,
                    },
                    {
                      field: t("workspace.menu.updated"),
                      value: new Date(routineTag.updatedAt).toLocaleDateString(
                        i18n.resolvedLanguage
                      ),
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
                onClick={() => {
                  stationRoutineManager.selectRoutineTag(routineTag.id);
                  stationRoutineManager.openInspector({
                    type: "routineTag",
                    id: routineTag.id,
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
                    .duplicateRoutineTag(routineTag.id)
                    .catch(error => toast.error(translateError(error, t)));
                }}
              >
                <Copy className="mr-2 size-4" />
                {t("workspace.menu.duplicate")}
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>{t("workspace.menu.link")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  void stationRoutineManager
                    .searchRoutines()
                    .catch(error => toast.error(translateError(error, t)));
                }}
              >
                <ContextMenuSubTrigger>
                  <RoutineIcon className="mr-2 size-4" />
                  {t("workspace.scope.routines")}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {availableRoutines.length === 0 ? (
                    <ContextMenuItem disabled>
                      {t("workspace.menu.noRoutines")}
                    </ContextMenuItem>
                  ) : (
                    availableRoutines.map(routine => {
                      const isLinked = routineTag.routines.some(
                        linkedRoutine => linkedRoutine.id === routine.id
                      );
                      return (
                        <ContextMenuItem
                          key={routine.id}
                          disabled={isLinked}
                          onClick={() => {
                            void stationRoutineManager
                              .linkRoutineTag(routine.id, routineTag.id)
                              .catch(error =>
                                toast.error(translateError(error, t))
                              );
                          }}
                        >
                          <RoutineIcon className="mr-2 size-4" />
                          {routine.title}
                        </ContextMenuItem>
                      );
                    })
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>{t("workspace.menu.edit")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.startRenamingRoutineTag(routineTag)
                }
              >
                <Pencil className="mr-2 size-4" />
                {t("workspace.menu.rename")}
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteRoutineTagDialog", {
                    routineTagId: routineTag.id,
                    routineTagName: routineTag.name,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                {t("workspace.menu.delete")}
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>

        {!stationRoutineManager.isRoutineTagEditing(routineTag.id) && (
          <>
            {visibleRoutineCount > 0 && (
              <SidebarMenuBadge>{visibleRoutineCount}</SidebarMenuBadge>
            )}
            <CollapsibleContent>
              <SidebarMenuSub>
                {!routineTag.isExpanded ? (
                  <RoutineMenuItemSkeleton />
                ) : (
                  <RoutineMenu routines={routineTag.routines} />
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default RoutineTagMenuItem;
