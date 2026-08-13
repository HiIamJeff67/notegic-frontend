import { ItemType as GraphQLItemType } from "@shared/api/graphql/generated/graphql";
import { ItemType } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import {
  Bookmark,
  CheckIcon,
  ClipboardList,
  Copy,
  HistoryIcon,
  LoaderCircle,
  PackagePlus,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import {
  BlockPackIcon,
  MaterialIcon,
  RoutineTagIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import RoutineTaskMenu from "@/components/menus/RoutineTaskMenu/RoutineTaskMenu";
import RoutineTaskMenuItemSkeleton from "@/components/menus/RoutineTaskMenu/RoutineTaskMenuItemSkeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useLoading, useModal, useShelfItem, useStationRoutine } from "@/hooks";
import { translateError } from "@/i18n/error";
import {
  translateRoutinePeriod,
  translateRoutineStatus,
} from "@/i18n/workspace";

interface RoutineMenuItemProps {
  station: StationNode;
  routine: RoutineNode;
}

const RoutineMenuItem = ({ station, routine }: RoutineMenuItemProps) => {
  const { i18n, t } = useTranslation();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const shelfItemManager = useShelfItem();

  const searchedItems =
    shelfItemManager.itemSearch.data?.searchItems?.searchEdges?.map(edge => {
      const item = edge.node as unknown as {
        id: UUID;
        type: GraphQLItemType;
        rootShelf?: { name?: string } | null;
        parentSubShelf?: { name?: string } | null;
      };
      return {
        id: item.id,
        type:
          item.type === GraphQLItemType.ItemTypeBlockPack
            ? ItemType.BlockPack
            : ItemType.Material,
        rootShelfName:
          item.rootShelf?.name ?? t("workspace.menu.unknownRootShelf"),
        parentSubShelfName:
          item.parentSubShelf?.name ?? t("workspace.menu.unknownSubShelf"),
      };
    }) ?? [];

  const handleRenameRoutineOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await stationRoutineManager
          .renameEditingRoutine()
          .catch(error => toast.error(translateError(error, t)));
      }),
    [t, loadingManager, stationRoutineManager]
  );

  return (
    <Collapsible open={routine.isOpen}>
      <SidebarMenuSubItem>
        <ContextMenu>
          {stationRoutineManager.isRoutineEditing(routine.id) ? (
            <div className="relative flex h-7 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={stationRoutineManager.routineTitleInputRef}
                type="text"
                value={stationRoutineManager.editRoutineTitle}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm outline-none"
                onChange={event =>
                  stationRoutineManager.setEditRoutineTitle(
                    event.currentTarget.value
                  )
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameRoutineOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    stationRoutineManager.cancelRenamingRoutine();
                  }
                }}
              />
              {stationRoutineManager.isNewRoutineTitle() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={async event => {
                    event.stopPropagation();
                    await handleRenameRoutineOnSubmit();
                  }}
                  aria-label={t("workspace.menu.saveRoutineTitle")}
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
                    <SidebarMenuSubButton
                      isActive={
                        stationRoutineManager.selectedRoutineId === routine.id
                      }
                      className="cursor-pointer select-none"
                      onClick={() => {
                        stationRoutineManager.selectStation(station.id);
                        stationRoutineManager.selectRoutine(routine.id);
                        void stationRoutineManager
                          .toggleRoutine(station.id, routine.id)
                          .catch(error =>
                            toast.error(translateError(error, t))
                          );
                      }}
                    >
                      {routine.isPinned && (
                        <Bookmark className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 truncate">{routine.title}</span>
                    </SidebarMenuSubButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={8}
                className="z-[90] w-80 rounded-sm p-3 text-xs"
              >
                <HoverDetailCard
                  title={routine.title}
                  subtitle={t("workspace.table.routine")}
                  id={routine.id}
                  rows={[
                    {
                      field: t("workspace.table.station"),
                      value: station.name,
                    },
                    {
                      field: t("workspace.fields.description"),
                      value: routine.description || t("workspace.period.none"),
                    },
                    {
                      field: t("workspace.table.status"),
                      value: translateRoutineStatus(routine.status, t),
                    },
                    {
                      field: t("workspace.payloadEditor.period"),
                      value: translateRoutinePeriod(routine.period, t),
                    },
                    {
                      field: t("workspace.table.tags"),
                      value: routine.routineTagIds.length,
                    },
                    {
                      field: t("workspace.table.tasks"),
                      value: routine.routineTaskIds.length,
                    },
                    {
                      field: t("workspace.inspector.start"),
                      value: new Date(routine.scheduledStartAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                    },
                    {
                      field: t("workspace.inspector.end"),
                      value: new Date(routine.scheduledEndAt).toLocaleString(
                        i18n.resolvedLanguage
                      ),
                    },
                  ]}
                />
              </HoverCardContent>
            </HoverCard>
          )}

          <ContextMenuContent className="min-w-44">
            <ContextMenuLabel>{t("workspace.menu.view")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  modalManager.open("RoutineTaskRecordDialog", {
                    routineTitle: routine.title,
                    routineTaskIds: routine.routineTaskIds,
                  })
                }
              >
                <HistoryIcon className="mr-2 size-4" />
                {t("workspace.menu.viewAllTaskRecords")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  stationRoutineManager.selectStation(station.id);
                  stationRoutineManager.selectRoutine(routine.id);
                  stationRoutineManager.openInspector({
                    type: "routine",
                    id: routine.id,
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
                    .duplicateRoutine(routine.id)
                    .catch(error => toast.error(translateError(error, t)));
                }}
              >
                <Copy className="mr-2 size-4" />
                {t("workspace.menu.duplicate")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  modalManager.open("CreateRoutineTaskDialog", {
                    routineId: routine.id,
                    stationName: station.name,
                    routineTitle: routine.title,
                    onCreated: async () => {
                      routine.isOpen = true;
                    },
                  })
                }
              >
                <ClipboardList className="mr-2 size-4" />
                {t("workspace.table.task")}
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>{t("workspace.menu.link")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  window.setTimeout(() => {
                    void stationRoutineManager
                      .searchRoutineTags()
                      .catch(error => toast.error(translateError(error, t)));
                  }, 0);
                }}
              >
                <ContextMenuSubTrigger>
                  <RoutineTagIcon className="mr-2 size-4" />
                  {t("workspace.table.tags")}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                  className="max-h-72 min-w-48 overflow-y-auto"
                  onScroll={event => {
                    const target = event.currentTarget;
                    const pageInfo =
                      stationRoutineManager.searchRoutineTagsData
                        ?.searchRoutineTags?.searchPageInfo;
                    if (
                      target.scrollTop + target.clientHeight <
                        target.scrollHeight - 16 ||
                      !pageInfo?.hasNextPage ||
                      stationRoutineManager.isSearchingRoutineTags
                    ) {
                      return;
                    }
                    void stationRoutineManager
                      .loadMoreRoutineTags()
                      .catch(error => toast.error(translateError(error, t)));
                  }}
                >
                  {stationRoutineManager.routineTags.length === 0 ? (
                    <ContextMenuItem disabled>
                      {t("workspace.menu.noTags")}
                    </ContextMenuItem>
                  ) : (
                    stationRoutineManager.routineTags.map(routineTag => {
                      const isLinked = routine.routineTagIds.includes(
                        routineTag.id
                      );
                      return (
                        <ContextMenuCheckboxItem
                          key={routineTag.id}
                          className="pl-2 pr-8 [&>span:first-child]:left-auto [&>span:first-child]:right-2"
                          checked={isLinked}
                          onSelect={event => event.preventDefault()}
                          onCheckedChange={() => {
                            void stationRoutineManager
                              .linkRoutineTag(
                                routine.id,
                                routineTag.id,
                                isLinked
                              )
                              .catch(error =>
                                toast.error(translateError(error, t))
                              );
                          }}
                        >
                          <RoutineTagIcon className="mr-2 size-4" />
                          {routineTag.name}
                        </ContextMenuCheckboxItem>
                      );
                    })
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  window.setTimeout(() => {
                    void shelfItemManager
                      .searchItems({
                        query: "",
                        rootShelfId: null,
                        parentSubShelfId: null,
                      })
                      .catch(error => toast.error(translateError(error, t)));
                  }, 0);
                }}
              >
                <ContextMenuSubTrigger>
                  <PackagePlus className="mr-2 size-4" />
                  {t("workspace.menu.items")}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                  className="max-h-80 min-w-64 overflow-y-auto"
                  onScroll={event => {
                    const target = event.currentTarget;
                    const pageInfo =
                      shelfItemManager.itemSearch.data?.searchItems
                        ?.searchPageInfo;
                    if (
                      target.scrollTop + target.clientHeight <
                        target.scrollHeight - 16 ||
                      !pageInfo?.hasNextPage ||
                      shelfItemManager.itemSearch.loading
                    ) {
                      return;
                    }
                    void shelfItemManager
                      .loadMoreItems()
                      .catch(error => toast.error(translateError(error, t)));
                  }}
                >
                  {shelfItemManager.itemSearch.loading &&
                  searchedItems.length === 0 ? (
                    <ContextMenuItem disabled>
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                      {t("workspace.fields.loading")}
                    </ContextMenuItem>
                  ) : searchedItems.length === 0 ? (
                    <ContextMenuItem disabled>
                      {t("workspace.menu.noItems")}
                    </ContextMenuItem>
                  ) : (
                    <>
                      {searchedItems.map(item => {
                        const isLinked = routine.itemIds.includes(item.id);
                        return (
                          <ContextMenuCheckboxItem
                            key={`${item.type}-${item.id}`}
                            className="pl-2 pr-8 [&>span:first-child]:left-auto [&>span:first-child]:right-2"
                            checked={isLinked}
                            onSelect={event => event.preventDefault()}
                            onCheckedChange={() => {
                              void stationRoutineManager
                                .linkRoutineItem(
                                  routine.id,
                                  item.id,
                                  item.type,
                                  isLinked
                                )
                                .then(() =>
                                  toast.success(
                                    isLinked
                                      ? t("workspace.menu.itemDisconnected")
                                      : t("workspace.menu.itemConnected")
                                  )
                                )
                                .catch(error =>
                                  toast.error(translateError(error, t))
                                );
                            }}
                          >
                            {item.type === ItemType.BlockPack ? (
                              <BlockPackIcon className="mr-2 size-4" />
                            ) : (
                              <MaterialIcon className="mr-2 size-4" />
                            )}
                            <span className="min-w-0 truncate">
                              {item.rootShelfName} / {item.parentSubShelfName} /{" "}
                              {item.type === ItemType.BlockPack
                                ? t("workspace.trash.blockPack")
                                : t("workspace.trash.material")}{" "}
                              · {item.id.slice(0, 8)}
                            </span>
                          </ContextMenuCheckboxItem>
                        );
                      })}
                    </>
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>{t("workspace.menu.edit")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() => {
                  void stationRoutineManager
                    .updateRoutine(routine.id, { isPinned: !routine.isPinned })
                    .catch(error => toast.error(translateError(error, t)));
                }}
              >
                <Bookmark className="mr-2 size-4" />
                {routine.isPinned
                  ? t("workspace.menu.unpin")
                  : t("workspace.menu.pin")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.startRenamingRoutine(routine)
                }
              >
                <Pencil className="mr-2 size-4" />
                {t("workspace.menu.rename")}
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteRoutineDialog", {
                    routineId: routine.id,
                    routineTitle: routine.title,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                {t("workspace.menu.delete")}
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        {!stationRoutineManager.isRoutineEditing(routine.id) && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {!routine.isExpanded ? (
                <RoutineTaskMenuItemSkeleton />
              ) : (
                <RoutineTaskMenu routineTasks={routine.routineTasks} />
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuSubItem>
    </Collapsible>
  );
};

export default RoutineMenuItem;
