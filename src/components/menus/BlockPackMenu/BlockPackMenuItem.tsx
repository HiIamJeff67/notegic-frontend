import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { BlockPackNode } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useCallback } from "react";
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
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useShelfItem } from "@/hooks";
import { translateError } from "@/i18n/error";

interface BlockPackMenuItemProps {
  parent: SubShelfNode;
  current: BlockPackNode;
}

const BlockPackMenuItem = ({ parent, current }: BlockPackMenuItemProps) => {
  const router = useAppRouter();
  const { i18n, t } = useTranslation();
  const shelfItemManager = useShelfItem();

  const handleBlockPackOnClick = useCallback(() => {
    try {
      router.push(
        WebURLPathDictionary.app.blockPackEditor._(
          current.id,
          parent.id,
          parent.rootShelfId
        )
      );
      shelfItemManager.toggleBlockPack(current);
    } catch (error) {
      toast.error(translateError(error, t));
    }
  }, [parent, current, router, shelfItemManager]);

  return (
    <ContextMenu>
      <HoverCard openDelay={250} closeDelay={100}>
        <HoverCardTrigger asChild>
          <ContextMenuTrigger asChild>
            <SidebarMenuButton
              className={`w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden ${
                shelfItemManager.isFocused(current.id)
                  ? "bg-primary/60"
                  : "bg-transparent"
              }`}
              onClick={handleBlockPackOnClick}
            >
              <span>{current.name}</span>
            </SidebarMenuButton>
          </ContextMenuTrigger>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={8}
          className="z-[90] w-72 rounded-sm p-3 text-xs"
        >
          <HoverDetailCard
            title={current.name}
            subtitle={t("workspace.trash.blockPack")}
            id={current.id}
            rows={[
              { field: t("workspace.menu.blocks"), value: current.blockCount },
              {
                field: t("workspace.menu.updated"),
                value: new Date(current.updatedAt).toLocaleDateString(
                  i18n.resolvedLanguage
                ),
              },
            ]}
          />
        </HoverCardContent>
      </HoverCard>
      <ContextMenuContent>
        <ContextMenuLabel>{t("workspace.menu.view")}</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleBlockPackOnClick}>
            <ExternalLink className="mr-2 size-4" />
            {t("workspace.menu.open")}
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuLabel>{t("workspace.menu.edit")}</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => shelfItemManager.startRenamingItemNode(current)}
          >
            <Pencil className="mr-2 size-4" />
            {t("workspace.menu.rename")}
          </ContextMenuItem>
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={async () => {
              await shelfItemManager.deleteBlockPack(parent, current);
              if (current.id === (router.params.blockPackId as string)) {
                router.push(WebURLPathDictionary.app.materialViewer._);
              }
            }}
          >
            <Trash2 className="mr-2 size-4" />
            {t("workspace.menu.delete")}
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default BlockPackMenuItem;
