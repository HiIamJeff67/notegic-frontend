import { WebURLPathDictionary } from "@shared/constants";
import { translateError } from "@shared/i18n/error";
import toast from "@shared/lib/toast";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ChevronRightIcon } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import WrapPlaceholder from "@/components/holders/WrapPlaceholder";
import {
  BlockPackIcon,
  MaterialIcon,
  SubShelfIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import {
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppRouter, useShelfItem } from "@/hooks";

interface ItemPathItemProps {
  key?: any;
  rootShelfNode: RootShelfNode;
  subShelfNode: SubShelfNode;
}

const ItemPathItem = ({ rootShelfNode, subShelfNode }: ItemPathItemProps) => {
  const router = useAppRouter();
  const { t } = useTranslation();
  const shelfItemManager = useShelfItem();

  const handleBlockPackOnClick = useCallback(
    (current: BlockPackNode, parent: SubShelfNode) => {
      try {
        shelfItemManager.toggleBlockPack(current);
        router.push(
          WebURLPathDictionary.app.blockPackEditor._(
            current.id,
            parent.id,
            parent.rootShelfId
          )
        );
      } catch (error) {
        toast.error(translateError(error, t));
      }
    },
    [router, shelfItemManager]
  );

  const handleMaterialOnClick = useCallback(
    (current: MaterialNode, parent: SubShelfNode) => {
      try {
        const nextPath = WebURLPathDictionary.app.materialViewer.byId(
          current.id,
          parent.id,
          parent.rootShelfId
        );

        router.push(nextPath);
        shelfItemManager.toggleMaterial(current);
      } catch (error) {
        toast.error(translateError(error, t));
      }
    },
    [router, shelfItemManager]
  );

  return (
    <WrapPlaceholder>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="select-none hover:underline text-secondary-foreground/80 font-semibold">
            {subShelfNode.name}
          </DropdownMenuTrigger>
          {(Object.entries(subShelfNode.children).length !== 0 ||
            Object.entries(subShelfNode.blockPackNodes).length !== 0 ||
            Object.entries(subShelfNode.materialNodes).length !== 0) && (
            <DropdownMenuContent>
              {Object.entries(subShelfNode.children).map(([id, child]) => {
                return (
                  <DropdownMenuItem
                    key={id}
                    onClick={async () => {
                      if (!child.isExpanded) {
                        await shelfItemManager.expandSubShelf(
                          rootShelfNode,
                          child
                        );
                      }
                      shelfItemManager.toggleSubShelf(child);
                    }}
                  >
                    <SubShelfIcon />
                    <ChevronRightIcon />
                    <span>{child.name}</span>
                  </DropdownMenuItem>
                );
              })}
              {Object.entries(subShelfNode.blockPackNodes).map(
                ([id, blockPackNode]) => {
                  return (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        handleBlockPackOnClick(blockPackNode, subShelfNode)
                      }
                    >
                      <BlockPackIcon />
                      {blockPackNode.name}
                    </DropdownMenuItem>
                  );
                }
              )}
              {Object.entries(subShelfNode.materialNodes).map(
                ([id, materialNode]) => {
                  return (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        handleMaterialOnClick(materialNode, subShelfNode)
                      }
                    >
                      <MaterialIcon />
                      {materialNode.name}
                    </DropdownMenuItem>
                  );
                }
              )}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </BreadcrumbItem>
    </WrapPlaceholder>
  );
};

export default ItemPathItem;
