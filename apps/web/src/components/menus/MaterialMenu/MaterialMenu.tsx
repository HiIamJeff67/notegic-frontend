import toast from "@shared/lib/toast";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { CheckIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import MaterialMenuItem from "@/components/menus/MaterialMenu/MaterialMenuItem";
import MaterialMenuItemSkeleton from "@/components/menus/MaterialMenu/MaterialMenuItemSkeleton";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { useLoading, useShelfItem } from "@/hooks";
import { translateError } from "@shared/i18n/error";

interface MaterialMenuProps {
  parent: SubShelfNode;
}

const MaterialMenu = ({ parent }: MaterialMenuProps) => {
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const shelfItemManager = useShelfItem();

  const handleRenameMaterialOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(
        async () =>
          await shelfItemManager
            .renameEditingMaterial()
            .catch(error => toast.error(translateError(error, t)))
      ),
    [loadingManager, t, shelfItemManager]
  );

  return (
    <Suspense fallback={<MaterialMenuItemSkeleton />}>
      {Object.entries(parent.materialNodes).map(
        ([materialId, materialNode]) => {
          return (
            <Suspense fallback={<MaterialMenuItemSkeleton />} key={materialId}>
              {shelfItemManager.isItemNodeEditing(materialNode.id) ? (
                <SidebarMenuItem
                  key={materialId}
                  className="relative flex items-center justify-end rounded-sm border border-foreground bg-muted px-2 py-1"
                >
                  <input
                    ref={shelfItemManager.inputRef}
                    type="text"
                    value={shelfItemManager.editItemName}
                    className="h-6 min-w-0 flex-1 overflow-hidden bg-transparent pr-6 outline-none"
                    onChange={e =>
                      shelfItemManager.setEditItemName(e.target.value)
                    }
                    onKeyDown={async e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        await handleRenameMaterialOnSubmit();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        e.stopPropagation();
                        shelfItemManager.cancelRenamingItemNode();
                      }
                    }}
                  />
                  {shelfItemManager.isNewItemName() && (
                    <button
                      type="button"
                      className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={async e => {
                        e.stopPropagation();
                        await handleRenameMaterialOnSubmit();
                      }}
                      aria-label={t("workspace.menu.saveMaterialName")}
                    >
                      <CheckIcon className="size-4" />
                    </button>
                  )}
                </SidebarMenuItem>
              ) : (
                <MaterialMenuItem
                  key={materialId}
                  parent={parent}
                  current={materialNode}
                />
              )}
            </Suspense>
          );
        }
      )}
    </Suspense>
  );
};

export default MaterialMenu;
