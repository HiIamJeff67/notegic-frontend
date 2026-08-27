import { SearchRootShelfEdge } from "@shared/api/graphql/generated/graphql";
import { DNDType } from "@shared/enums";
import toast from "@shared/lib/toast";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import type { UUID } from "crypto";
import {
  CheckIcon,
  Crown,
  FolderPlus,
  LogOut,
  Pencil,
  SquareDotIcon,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import { useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import EmptyShelfIcon from "@/components/icons/EmptyShelfIcon";
import { RootShelfIcon } from "@/components/icons/WorkspaceEntityIcons";
import RootShelfMenuItemSkeleton from "@/components/menus/RootShelfMenu/RootShelfMenuItemSkeleton";
import SubShelfMenu from "@/components/menus/SubShelfMenu/SubShelfMenu";
import SubShelfMenuItemSkeleton from "@/components/menus/SubShelfMenu/SubShelfMenuItemSkeleton";
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useLoading, useShelfItem } from "@/hooks";
import { useModal } from "@/hooks/useModal";
import { translateError } from "@shared/i18n/error";

interface RootShelfMenuItemProps {
  rootShelfEdge: SearchRootShelfEdge;
  index: number;
}

const RootShelfMenuItem = ({
  rootShelfEdge,
  index,
}: RootShelfMenuItemProps) => {
  const loadingManager = useLoading();
  const { i18n, t } = useTranslation();
  const modalManager = useModal();
  const shelfItemManager = useShelfItem();

  const summary = shelfItemManager.expandedShelves.get(rootShelfEdge.node.id);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: DNDType.DraggableSubShelf.toString(),
    drop: async (draggedItem: {
      summary: ShelfTreeSummary;
      prev: SubShelfNode | null;
      current: SubShelfNode;
      depth: number;
    }) => {
      if (!summary) {
        return;
      }

      await shelfItemManager.moveSubShelf(
        draggedItem.prev,
        draggedItem.current,
        summary.root,
        null
      );
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleRenameRootShelfOnSubmit = useCallback(
    async () => await shelfItemManager.renameEditingRootShelf(),
    [shelfItemManager]
  );

  if (!summary) return <RootShelfMenuItemSkeleton key={index} />;

  return (
    <Collapsible open={summary.root.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {shelfItemManager.isRootShelfNodeEditing(summary.root.id) ? (
            <div className="relative flex items-center justify-end rounded-sm border border-foreground bg-muted px-2 py-1">
              <input
                ref={shelfItemManager.inputRef}
                type="text"
                value={shelfItemManager.editRootShelfName}
                className="h-6 min-w-0 flex-1 overflow-hidden bg-transparent pr-6 outline-none"
                onChange={e =>
                  shelfItemManager.setEditRootShelfName(e.target.value)
                }
                onKeyDown={async e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    await handleRenameRootShelfOnSubmit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    shelfItemManager.cancelRenamingRootShelfNode();
                  }
                }}
                // note that autoFocus doesn't work in this case,
                // bcs the user clicked context menu trigger before the input element rendering
              />
              {shelfItemManager.isNewRootShelfName() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={async e => {
                    e.stopPropagation();
                    await handleRenameRootShelfOnSubmit();
                  }}
                  aria-label={t("workspace.menu.saveRootShelfName")}
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
                      ref={node => {
                        drop(node);
                      }}
                      className="w-full rounded-sm
                        whitespace-nowrap text-ellipsis overflow-hidden"
                      onClick={async () => {
                        shelfItemManager.toggleRootShelf(summary.root);
                        if (!summary.root.isExpanded) {
                          await shelfItemManager.expandRootShelf(
                            rootShelfEdge.node
                          );
                        }
                      }}
                    >
                      {summary.root.isOpen ? (
                        <EmptyShelfIcon size={16} />
                      ) : (
                        <RootShelfIcon size={16} />
                      )}
                      <span>{summary.root.name}</span>
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
                  title={summary.root.name}
                  subtitle={t("workspace.trash.rootShelf")}
                  id={summary.root.id}
                  rows={[
                    {
                      field: t("workspace.payloadEditor.subShelves"),
                      value: summary.root.subShelfCount,
                    },
                    {
                      field: t("workspace.menu.items"),
                      value: summary.root.itemCount,
                    },
                    {
                      field: t("workspace.menu.updated"),
                      value: new Date(
                        summary.root.updatedAt
                      ).toLocaleDateString(i18n.resolvedLanguage),
                    },
                  ]}
                />
              </HoverCardContent>
            </HoverCard>
          )}
          {!shelfItemManager.isNewRootShelfName() && summary.hasChanged && (
            <SidebarMenuAction className="bg-transparent hover:bg-transparent p-0.5 flex justify-center items-center">
              <SquareDotIcon className="max-w-4 max-h-4" />
            </SidebarMenuAction>
          )}
          <ContextMenuContent>
            <ContextMenuLabel>{t("workspace.menu.add")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={async () =>
                  await shelfItemManager.createSubShelf(
                    summary.root.id,
                    null,
                    t("workspace.menu.newSubShelf")
                  )
                }
              >
                <FolderPlus className="mr-2 size-4" />
                {t("workspace.menu.subShelf")}
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>{t("workspace.menu.edit")}</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  shelfItemManager.startRenamingRootShelfNode(summary.root)
                }
              >
                <Pencil className="mr-2 size-4" />
                {t("workspace.menu.rename")}
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                disabled={!shelfItemManager.canDeleteRootShelf(summary.root.id)}
                onClick={() =>
                  modalManager.open("DeleteShelfItemDialog", {
                    dialogHeader: t("workspace.menu.deleteRootShelf"),
                    dialogDescription: t(
                      "workspace.menu.deleteRootDescription",
                      {
                        name: summary.root.name,
                      }
                    ),
                    confirmKeyword: "DELETE",
                    inputPlaceholder: t("workspace.menu.typeDelete"),
                    onDelete: async () =>
                      await loadingManager.startAsyncTransactionLoading(
                        async () => {
                          await shelfItemManager
                            .deleteRootShelf(summary.root)
                            .catch(error =>
                              toast.error(translateError(error, t))
                            );
                        }
                      ),
                    onCancel: modalManager.close,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                {t("workspace.menu.delete")}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  const isOwner =
                    shelfItemManager.canTransferRootShelfOwnership(
                      summary.root.id
                    );
                  if (!isOwner) {
                    void loadingManager.startAsyncTransactionLoading(async () =>
                      shelfItemManager
                        .leaveRootShelf(summary.root.id)
                        .catch(error => toast.error(translateError(error, t)))
                    );
                    return;
                  }
                  modalManager.open("CreateShelfItemDialog", {
                    dialogHeader: t("workspace.menu.leaveRootShelf"),
                    dialogDescription: t("workspace.menu.ownerMustChoose"),
                    inputPlaceholder: t("workspace.menu.memberPublicId"),
                    submitLabel: t("workspace.menu.leave"),
                    onCreate: async value =>
                      await loadingManager.startAsyncTransactionLoading(
                        async () =>
                          shelfItemManager.leaveRootShelf(
                            summary.root.id,
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
                  !shelfItemManager.canTransferRootShelfOwnership(
                    summary.root.id
                  )
                }
                onClick={() =>
                  modalManager.open("CreateShelfItemDialog", {
                    dialogHeader: t(
                      "workspace.menu.transferRootShelfOwnership"
                    ),
                    dialogDescription: t("workspace.menu.enterRootShelfMember"),
                    inputPlaceholder: t("workspace.menu.memberPublicId"),
                    submitLabel: t("workspace.menu.transfer"),
                    onCreate: async value =>
                      await loadingManager.startAsyncTransactionLoading(
                        async () =>
                          shelfItemManager.transferRootShelfOwnership(
                            summary.root.id,
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
        <CollapsibleContent>
          <SidebarMenuSub>
            {!summary.root.isExpanded ? (
              <SubShelfMenuItemSkeleton />
            ) : (
              <SubShelfMenu summary={summary} root={summary.root} />
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default RootShelfMenuItem;
