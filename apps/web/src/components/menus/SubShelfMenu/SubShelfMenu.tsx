import { RootShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { CheckIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SubShelfMenuItem from "@/components/menus/SubShelfMenu/SubShelfMenuItem";
import SubShelfMenuItemSkeleton from "@/components/menus/SubShelfMenu/SubShelfMenuItemSkeleton";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useShelfItem } from "@/hooks";

interface SubShelfMenuProps {
  summary: ShelfTreeSummary;
  root: RootShelfNode;
}

// handle the translation and some loading states here
const SubShelfMenu = ({ summary, root }: SubShelfMenuProps) => {
  const { t } = useTranslation();
  const shelfItemManager = useShelfItem();

  const handleRenameSubShelfOnSubmit = useCallback(
    async () => await shelfItemManager.renameEditingSubShelf(),
    [shelfItemManager]
  );

  return (
    <SidebarMenu>
      <Suspense fallback={<SubShelfMenuItemSkeleton />}>
        {Object.entries(root.children).map(([subShelfId, subShelfNode]) => {
          return (
            <Suspense fallback={<SubShelfMenuItemSkeleton />} key={subShelfId}>
              {shelfItemManager.isSubShelfNodeEditing(subShelfNode.id) ? (
                <SidebarMenuItem className="relative flex items-center justify-end rounded-sm border border-foreground bg-muted px-2 py-1">
                  <input
                    ref={shelfItemManager.inputRef}
                    type="text"
                    value={shelfItemManager.editSubShelfName}
                    className="h-6 min-w-0 flex-1 overflow-hidden bg-transparent pr-6 outline-none"
                    onChange={e =>
                      shelfItemManager.setEditSubShelfName(e.target.value)
                    }
                    onKeyDown={async e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        await handleRenameSubShelfOnSubmit();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        e.stopPropagation();
                        shelfItemManager.cancelRenamingSubShelfNode();
                      }
                    }}
                    // note that autoFocus doesn't work in this case,
                    // bcs the user clicked context menu trigger before the input element rendering
                  />
                  {shelfItemManager.isNewSubShelfName() && (
                    <button
                      type="button"
                      className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={async e => {
                        e.stopPropagation();
                        await handleRenameSubShelfOnSubmit();
                      }}
                      aria-label={t("workspace.menu.saveSubShelfName")}
                    >
                      <CheckIcon className="size-4" />
                    </button>
                  )}
                </SidebarMenuItem>
              ) : (
                <SubShelfMenuItem
                  key={subShelfId}
                  summary={summary}
                  root={root}
                  prev={null}
                  current={subShelfNode}
                  depth={1}
                />
              )}
            </Suspense>
          );
        })}
      </Suspense>
    </SidebarMenu>
  );
};

export default SubShelfMenu;
