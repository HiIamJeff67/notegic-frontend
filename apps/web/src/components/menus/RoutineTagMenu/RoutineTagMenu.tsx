import { lazy, Suspense } from "react";
import RoutineTagMenuItemSkeleton from "@/components/menus/RoutineTagMenu/RoutineTagMenuItemSkeleton";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useStationRoutine } from "@/hooks";

const RoutineTagMenuItem = lazy(
  () => import("@/components/menus/RoutineTagMenu/RoutineTagMenuItem")
);

const RoutineTagMenu = () => {
  const stationRoutineManager = useStationRoutine();

  if (
    stationRoutineManager.routineTags.length === 0 &&
    (stationRoutineManager.state !== "idle" ||
      stationRoutineManager.isSearchingRoutineTags ||
      !stationRoutineManager.searchRoutineTagsData)
  ) {
    return (
      <SidebarMenu className="overflow-hidden">
        <RoutineTagMenuItemSkeleton number={4} />
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu className="overflow-hidden">
      <Suspense fallback={<RoutineTagMenuItemSkeleton />}>
        {stationRoutineManager.routineTags.map(routineTag => (
          <Suspense
            fallback={<RoutineTagMenuItemSkeleton />}
            key={routineTag.id}
          >
            <RoutineTagMenuItem routineTag={routineTag} />
          </Suspense>
        ))}
      </Suspense>
    </SidebarMenu>
  );
};

export default RoutineTagMenu;
