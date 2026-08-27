import { lazy, Suspense } from "react";
import StationMenuItemSkeleton from "@/components/menus/StationMenu/StationMenuItemSkeleton";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useStationRoutine } from "@/hooks";

const StationMenuItem = lazy(
  () => import("@/components/menus/StationMenu/StationMenuItem")
);

const StationMenu = () => {
  const stationRoutineManager = useStationRoutine();

  if (
    stationRoutineManager.state !== "idle" &&
    stationRoutineManager.stations.length === 0
  ) {
    return (
      <SidebarMenu className="overflow-hidden">
        <StationMenuItemSkeleton number={4} />
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu className="overflow-hidden">
      <Suspense fallback={<StationMenuItemSkeleton />}>
        {stationRoutineManager.stations.map(station => (
          <Suspense fallback={<StationMenuItemSkeleton />} key={station.id}>
            <StationMenuItem station={station} />
          </Suspense>
        ))}
      </Suspense>
    </SidebarMenu>
  );
};

export default StationMenu;
