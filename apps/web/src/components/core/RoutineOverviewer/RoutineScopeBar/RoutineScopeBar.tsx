import { ChartNoAxesCombined, Tags } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  RoutineIcon,
  RoutineTaskIcon,
  StationIcon,
} from "@/components/icons/WorkspaceEntityIcons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStationRoutine } from "@/hooks";

type RoutineScopeBarProps = {
  onOpenAddChart?: () => void;
  showAddChart?: boolean;
  showStationStatus?: boolean;
};

type StatusPillProps = ComponentPropsWithoutRef<"div"> & {
  icon: ReactNode;
  presentCount: number;
  totalCount: number;
  title: string;
};

const RoutineScopeBar = ({
  onOpenAddChart,
  showAddChart = true,
  showStationStatus = true,
}: RoutineScopeBarProps) => {
  const { t } = useTranslation();
  const stationRoutineManager = useStationRoutine();

  const [pendingStationIds, setPendingStationIds] = useState(
    stationRoutineManager.presence.stationIds
  );
  const [pendingRoutineTagIds, setPendingRoutineTagIds] = useState(
    stationRoutineManager.presence.routineTagIds
  );
  const [pendingShowUntaggedRoutines, setPendingShowUntaggedRoutines] =
    useState(stationRoutineManager.presence.showUntaggedRoutines);

  useEffect(() => {
    setPendingStationIds(stationRoutineManager.presence.stationIds);
  }, [stationRoutineManager.presence.stationIds]);

  useEffect(() => {
    setPendingRoutineTagIds(stationRoutineManager.presence.routineTagIds);
    setPendingShowUntaggedRoutines(
      stationRoutineManager.presence.showUntaggedRoutines
    );
  }, [
    stationRoutineManager.presence.routineTagIds,
    stationRoutineManager.presence.showUntaggedRoutines,
  ]);

  return (
    <div
      className="
        @container
        flex h-full w-full min-w-0 items-center justify-between gap-4
        border-b border-border/40 bg-inset/75 px-3 backdrop-blur-md
      "
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {showStationStatus && (
            <HoverCard
              openDelay={250}
              closeDelay={150}
              onOpenChange={open => {
                if (!open) return;
                setPendingStationIds(stationRoutineManager.presence.stationIds);
              }}
            >
              <HoverCardTrigger asChild>
                <StatusPill
                  icon={<StationIcon size={14} />}
                  presentCount={stationRoutineManager.visibleStations.length}
                  totalCount={stationRoutineManager.statusSummary.totalStations}
                  title={t("workspace.scope.stations")}
                />
              </HoverCardTrigger>
              <HoverCardContent align="end" className="w-72 rounded-sm p-0">
                <div className="border-b px-3 py-2.5">
                  <p className="text-sm font-medium">
                    {t("workspace.scope.presentStations")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("workspace.scope.stationsShown", {
                      shown: stationRoutineManager.presence.stationIds.length,
                      total: stationRoutineManager.stations.length,
                    })}
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto p-1.5">
                  {stationRoutineManager.stations.map(station => (
                    <label
                      key={station.id}
                      className="flex h-9 cursor-default items-center gap-2 rounded-sm px-2 hover:bg-accent/50"
                    >
                      <Checkbox
                        checked={pendingStationIds.includes(station.id)}
                        onCheckedChange={() => {
                          setPendingStationIds(previousStationIds =>
                            previousStationIds.includes(station.id)
                              ? previousStationIds.filter(
                                  id => id !== station.id
                                )
                              : [...previousStationIds, station.id]
                          );
                        }}
                      />
                      {station.icon ? (
                        <span className="shrink-0 text-sm">{station.icon}</span>
                      ) : (
                        <StationIcon size={14} />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {station.name}
                      </span>
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {station.routineCount}
                      </span>
                    </label>
                  ))}
                  {stationRoutineManager.stations.length === 0 && (
                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                      {t("workspace.scope.noStations")}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-sm px-2 text-xs"
                    onClick={() =>
                      setPendingStationIds(
                        stationRoutineManager.presence.stationIds
                      )
                    }
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 rounded-sm px-2 text-xs"
                    onClick={() => {
                      const currentStationIds = [
                        ...stationRoutineManager.presence.stationIds,
                      ].sort();
                      const nextStationIds = [...pendingStationIds].sort();
                      const hasChanged =
                        currentStationIds.length !== nextStationIds.length ||
                        currentStationIds.some(
                          (stationId, index) =>
                            stationId !== nextStationIds[index]
                        );
                      if (!hasChanged) return;

                      stationRoutineManager.setStationPresence(
                        pendingStationIds
                      );
                    }}
                  >
                    {t("workspace.scope.filter")}
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
          <StatusPill
            icon={<RoutineIcon className="size-3.5" />}
            presentCount={stationRoutineManager.visibleRoutines.length}
            totalCount={stationRoutineManager.statusSummary.totalRoutines}
            title={t("workspace.scope.routines")}
          />
          <HoverCard
            openDelay={250}
            closeDelay={150}
            onOpenChange={open => {
              if (!open) return;
              setPendingRoutineTagIds(
                stationRoutineManager.presence.routineTagIds
              );
              setPendingShowUntaggedRoutines(
                stationRoutineManager.presence.showUntaggedRoutines
              );
            }}
          >
            <HoverCardTrigger asChild>
              <StatusPill
                icon={<Tags className="size-3.5" />}
                presentCount={stationRoutineManager.visibleRoutineTags.length}
                totalCount={
                  stationRoutineManager.statusSummary.totalRoutineTags
                }
                title={t("workspace.scope.routineTags")}
              />
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-72 rounded-sm p-0">
              <div className="border-b px-3 py-2.5">
                <p className="text-sm font-medium">
                  {t("workspace.scope.presentRoutineTags")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("workspace.scope.tagsShown", {
                    shown: stationRoutineManager.presence.routineTagIds.length,
                    total: stationRoutineManager.routineTags.length,
                  })}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto p-1.5">
                {stationRoutineManager.routineTags.map(routineTag => (
                  <label
                    key={routineTag.id}
                    className="flex h-9 cursor-default items-center gap-2 rounded-sm px-2 hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={pendingRoutineTagIds.includes(routineTag.id)}
                      onCheckedChange={() => {
                        setPendingRoutineTagIds(previousRoutineTagIds =>
                          previousRoutineTagIds.includes(routineTag.id)
                            ? previousRoutineTagIds.filter(
                                id => id !== routineTag.id
                              )
                            : [...previousRoutineTagIds, routineTag.id]
                        );
                      }}
                    />
                    <span
                      className="size-2.5 shrink-0 rounded-full border border-foreground/15"
                      style={{ backgroundColor: routineTag.color }}
                    />
                    {routineTag.icon && (
                      <span className="shrink-0 text-sm">
                        {routineTag.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {routineTag.name}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {routineTag.routineCount}
                    </span>
                  </label>
                ))}
                {stationRoutineManager.routineTags.length === 0 && (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                    {t("workspace.scope.noRoutineTags")}
                  </p>
                )}
                <Separator className="my-1.5" />
                <label className="flex h-9 cursor-default items-center gap-2 rounded-sm px-2 hover:bg-accent/50">
                  <Checkbox
                    checked={pendingShowUntaggedRoutines}
                    onCheckedChange={() =>
                      setPendingShowUntaggedRoutines(
                        currentValue => !currentValue
                      )
                    }
                  />
                  <span className="text-sm">
                    {t("workspace.scope.untaggedRoutines")}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 border-t px-3 py-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-sm px-2 text-xs"
                  onClick={() => {
                    setPendingRoutineTagIds(
                      stationRoutineManager.presence.routineTagIds
                    );
                    setPendingShowUntaggedRoutines(
                      stationRoutineManager.presence.showUntaggedRoutines
                    );
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 rounded-sm px-2 text-xs"
                  onClick={() => {
                    const currentRoutineTagIds = [
                      ...stationRoutineManager.presence.routineTagIds,
                    ].sort();
                    const nextRoutineTagIds = [...pendingRoutineTagIds].sort();
                    const hasChanged =
                      currentRoutineTagIds.length !==
                        nextRoutineTagIds.length ||
                      currentRoutineTagIds.some(
                        (routineTagId, index) =>
                          routineTagId !== nextRoutineTagIds[index]
                      ) ||
                      stationRoutineManager.presence.showUntaggedRoutines !==
                        pendingShowUntaggedRoutines;
                    if (!hasChanged) return;

                    stationRoutineManager.setRoutineTagPresence(
                      pendingRoutineTagIds
                    );
                    if (
                      stationRoutineManager.presence.showUntaggedRoutines !==
                      pendingShowUntaggedRoutines
                    ) {
                      stationRoutineManager.toggleUntaggedRoutines();
                    }
                  }}
                >
                  {t("workspace.scope.filter")}
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
          <StatusPill
            icon={<RoutineTaskIcon className="size-3.5" />}
            presentCount={stationRoutineManager.visibleRoutineTasks.length}
            totalCount={stationRoutineManager.statusSummary.totalRoutineTasks}
            title={t("workspace.scope.routineTasks")}
          />
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {showAddChart && onOpenAddChart && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("workspace.scope.addChart")}
                className="size-7 rounded-sm"
                onClick={onOpenAddChart}
              >
                <ChartNoAxesCombined className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("workspace.scope.addCharts")}
            </TooltipContent>
          </Tooltip>
        )}

        <ToggleGroup
          type="single"
          value={stationRoutineManager.timeRailScale}
          onValueChange={value => {
            if (value === "day" || value === "week" || value === "month") {
              stationRoutineManager.setTimeRailScale(value);
            }
          }}
          className="rounded-sm border border-border/60 bg-secondary p-0.5"
        >
          <ToggleGroupItem
            value="day"
            size="sm"
            className="h-7 rounded-sm bg-transparent px-2 text-xs hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            <span className="@max-[480px]:hidden">
              {t("workspace.scope.daily")}
            </span>
            <span className="hidden @max-[480px]:inline">
              {t("workspace.scope.dailyShort")}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="week"
            size="sm"
            className="h-7 rounded-sm bg-transparent px-2 text-xs hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            <span className="@max-[480px]:hidden">
              {t("workspace.scope.weekly")}
            </span>
            <span className="hidden @max-[480px]:inline">
              {t("workspace.scope.weeklyShort")}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="month"
            size="sm"
            className="h-7 rounded-sm bg-transparent px-2 text-xs hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            <span className="@max-[480px]:hidden">
              {t("workspace.scope.monthly")}
            </span>
            <span className="hidden @max-[480px]:inline">
              {t("workspace.scope.monthlyShort")}
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

const StatusPill = forwardRef<HTMLDivElement, StatusPillProps>(
  ({ icon, presentCount, totalCount, title, ...props }, ref) => {
    const { t } = useTranslation();
    return (
      <div
        ref={ref}
        {...props}
        className="flex h-7 items-center gap-1 rounded-sm border border-border/50 bg-card px-2"
        aria-label={t("workspace.scope.presentSummary", {
          title,
          shown: presentCount,
          total: totalCount,
        })}
      >
        {icon}
        <div className="tabular-nums">
          <span className="@max-[480px]:hidden">{presentCount}</span>
          <span className="px-0.5 @max-[480px]:hidden">|</span>
          {totalCount}
        </div>
      </div>
    );
  }
);
StatusPill.displayName = "StatusPill";

export default RoutineScopeBar;
