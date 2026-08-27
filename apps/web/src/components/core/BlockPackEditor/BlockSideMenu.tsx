import {
  AddBlockButton,
  DragHandleButton,
  SideMenu,
  type SideMenuProps,
} from "@blocknote/react";

interface BlockSideMenuProps extends SideMenuProps {
  showDragHandle: boolean;
  showQuickInsert: boolean;
}

const BlockSideMenu = ({
  showDragHandle,
  showQuickInsert,
}: BlockSideMenuProps) => (
  <div className="h-auto w-16 [&_.bn-side-menu]:!flex [&_.bn-side-menu]:!h-auto [&_.bn-side-menu]:!w-16 [&_.bn-side-menu]:!flex-row [&_.bn-side-menu]:!items-center [&_.bn-side-menu]:!justify-start [&_.bn-side-menu_.bn-button]:!size-8 [&_.bn-side-menu_.bn-button]:!min-h-8 [&_.bn-side-menu_.bn-button]:!min-w-8 [&_.bn-side-menu_.bn-button]:!shrink-0 [&_.bn-side-menu_.bn-button]:!p-0 [&_.bn-side-menu_.bn-button_svg]:!size-4">
    <SideMenu>
      {showQuickInsert && <AddBlockButton />}
      {showDragHandle && <DragHandleButton />}
    </SideMenu>
  </div>
);

export default BlockSideMenu;
