import toast from "@shared/lib/toast";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { CheckIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import BlockPackMenuItem from "@/components/menus/BlockPackMenu/BlockPackMenuItem";
import BlockPackMenuItemSkeleton from "@/components/menus/BlockPackMenu/BlockPackMenuItemSkeleton";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { useLoading, useShelfItem } from "@/hooks";
import { translateError } from "@shared/i18n/error";

interface BlockPackMenuProps {
  parent: SubShelfNode;
}

const BlockPackMenu = ({ parent }: BlockPackMenuProps) => {
  const loadingManager = useLoading();
  const { t } = useTranslation();
  const shelfItemManager = useShelfItem();

  const handleRenameBlockPackOnSubmit = useCallback(async () => {
    await loadingManager.startAsyncTransactionLoading(
      async () =>
        await shelfItemManager
          .renameEditingBlockPack()
          .catch(error => toast.error(translateError(error, t)))
    );
  }, [loadingManager, t, shelfItemManager]);

  return (
    <Suspense fallback={<BlockPackMenuItemSkeleton />}>
      {Object.entries(parent.blockPackNodes).map(
        ([blockPackId, blockPackNode]) => {
          return (
            <Suspense
              fallback={<BlockPackMenuItemSkeleton />}
              key={blockPackId}
            >
              {shelfItemManager.isItemNodeEditing(blockPackNode.id) ? (
                <SidebarMenuItem
                  key={blockPackId}
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
                        await handleRenameBlockPackOnSubmit();
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
                        await handleRenameBlockPackOnSubmit();
                      }}
                      aria-label={t("workspace.menu.saveBlockPackName")}
                    >
                      <CheckIcon className="size-4" />
                    </button>
                  )}
                </SidebarMenuItem>
              ) : (
                <BlockPackMenuItem
                  key={blockPackId}
                  parent={parent}
                  current={blockPackNode}
                />
              )}
            </Suspense>
          );
        }
      )}
    </Suspense>
  );
};

export default BlockPackMenu;
