import { Suspense } from "react";
import RootShelfMenuItem from "@/components/menus/RootShelfMenu/RootShelfMenuItem";
import RootShelfMenuItemSkeleton from "@/components/menus/RootShelfMenu/RootShelfMenuItemSkeleton";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useShelfItem } from "@/hooks";

const RootShelfMenu = () => {
  const shelfItemManager = useShelfItem();

  return (
    <SidebarMenu className="overflow-hidden">
      <Suspense fallback={<RootShelfMenuItemSkeleton />}>
        {shelfItemManager.rootShelfEdges.map((edge, index) => (
          <Suspense fallback={<RootShelfMenuItemSkeleton />} key={index}>
            <RootShelfMenuItem key={index} rootShelfEdge={edge} index={index} />
          </Suspense>
        ))}
      </Suspense>
    </SidebarMenu>
  );
};

export default RootShelfMenu;
