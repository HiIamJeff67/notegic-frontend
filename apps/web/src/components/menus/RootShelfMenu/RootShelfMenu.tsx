import { compareEntityNames } from "@shared/lib/comparisons/compareEntityNames";
import { Suspense } from "react";
import RootShelfMenuItem from "@/components/menus/RootShelfMenu/RootShelfMenuItem";
import RootShelfMenuItemSkeleton from "@/components/menus/RootShelfMenu/RootShelfMenuItemSkeleton";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useShelfItem } from "@/hooks";

const RootShelfMenu = () => {
  const shelfItemManager = useShelfItem();

  const rootShelfEdges = [...shelfItemManager.rootShelfEdges].sort(
    (left, right) =>
      compareEntityNames(
        shelfItemManager.expandedShelves.get(left.node.id)?.root ?? left.node,
        shelfItemManager.expandedShelves.get(right.node.id)?.root ?? right.node
      )
  );

  return (
    <SidebarMenu className="overflow-hidden">
      <Suspense fallback={<RootShelfMenuItemSkeleton />}>
        {rootShelfEdges.map(edge => (
          <Suspense fallback={<RootShelfMenuItemSkeleton />} key={edge.node.id}>
            <RootShelfMenuItem rootShelfEdge={edge} />
          </Suspense>
        ))}
      </Suspense>
    </SidebarMenu>
  );
};

export default RootShelfMenu;
