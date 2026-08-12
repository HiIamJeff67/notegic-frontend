import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { MaterialNode } from "@shared/types/itemNodes.type";
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

interface MaterialMenuItemProps {
  parent: SubShelfNode;
  current: MaterialNode;
}

const MaterialMenuItem = ({ parent, current }: MaterialMenuItemProps) => {
  const router = useAppRouter();
  const { i18n, t } = useTranslation();
  const shelfItemManager = useShelfItem();

  const handleMaterialOnClick = useCallback(() => {
    try {
      router.push(
        WebURLPathDictionary.app.materialViewer.byId(
          current.id,
          parent.id,
          parent.rootShelfId
        )
      );
      shelfItemManager.toggleMaterial(current);
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
              onClick={handleMaterialOnClick}
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
            subtitle={t("workspace.trash.material")}
            id={current.id}
            rows={[
              {
                field: t("workspace.viewer.contentType"),
                value: current.contentType,
              },
              { field: t("workspace.viewer.size"), value: current.size },
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
          <ContextMenuItem onClick={handleMaterialOnClick}>
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
              await shelfItemManager.deleteMaterial(parent, current);
              if (current.id === (router.params.materialId as string)) {
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

export default MaterialMenuItem;
