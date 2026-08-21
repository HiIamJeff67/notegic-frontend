import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { CheckIcon, SquarePen } from "lucide-react";
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { dashboardHeaderBackgroundImageOptions } from "@/assets/backgrounds";
import { ProgressiveBackground } from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useBackgroundImages,
  useModal,
  useResizeSidebar,
  useStationRoutine,
} from "@/hooks";
import AddChartDialog from "./RoutineCharts/AddChartDialog";
import RoutineCharts, {
  CHART_DEFINITIONS,
  type NewRoutineOverviewChart,
  type RoutineOverviewChart,
  type RoutineOverviewChartComponentId,
} from "./RoutineCharts/RoutineCharts";
import RoutineOverviewerContentSkeleton from "./RoutineOverviewerContentSkeleton";

import RoutineScopeBar from "./RoutineScopeBar/RoutineScopeBar";
import RoutineTable from "./RoutineTable/RoutineTable";
import RoutineTaskRecordTable from "./RoutineTaskRecordTable/RoutineTaskRecordTable";
import RoutineTaskTable from "./RoutineTaskTable/RoutineTaskTable";
import TimeRailsSkeleton from "./TimeRails/TimeRailsSkeleton";

const TimeRails = React.lazy(() => import("./TimeRails/TimeRails"));

function dedupeChartComponentIds(componentIds: string[]) {
  return Array.from(new Set(componentIds));
}

function createChartsFromComponentIds(componentIds: string[]) {
  return dedupeChartComponentIds(componentIds)
    .map(componentId => {
      const definition =
        CHART_DEFINITIONS[componentId as RoutineOverviewChartComponentId];
      if (!definition) return null;

      return {
        ...definition.chart,
        id: definition.id,
      } as RoutineOverviewChart;
    })
    .filter((chart): chart is RoutineOverviewChart => chart !== null);
}

function getChartComponentIds(charts: RoutineOverviewChart[]) {
  return dedupeChartComponentIds(charts.map(chart => chart.id));
}

function getChartDefinitionId(chart: NewRoutineOverviewChart) {
  return Object.values(CHART_DEFINITIONS).find(
    definition =>
      definition.chart.domain === chart.domain &&
      definition.chart.chartType === chart.chartType
  )?.id;
}

type RoutineOverviewerContentProps = {
  showStationScope?: boolean;
};

const RoutineOverviewerContent = ({
  showStationScope = true,
}: RoutineOverviewerContentProps) => {
  const { t } = useTranslation();
  const modalManager = useModal();
  const backgroundImagesManager = useBackgroundImages();
  const sidebarManager = useSidebar();
  const resizableSidebarManager = useResizeSidebar();
  const stationRoutineManager = useStationRoutine();

  const [isHeaderBackgroundImageEditing, setIsHeaderBackgroundImageEditing] =
    useState<boolean>(false);
  const [isAddChartDialogOpen, setIsAddChartDialogOpen] =
    useState<boolean>(false);
  const [shouldRenderTimeRails, setShouldRenderTimeRails] =
    useState<boolean>(false);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number>(16 / 9);

  const headerBackgroundImageRef = useRef<HTMLDivElement>(null);
  const defaultHeaderBackgroundImage =
    dashboardHeaderBackgroundImageOptions.find(
      image => image.id === backgroundImagesManager.defaultBackgroundImageId
    )?.src ?? dashboardHeaderBackgroundImageOptions[0].src;
  const chartComponentIdsRef = useRef<string[]>([]);
  const [charts, setCharts] = useState<RoutineOverviewChart[]>(() => {
    const storedCharts = createChartsFromComponentIds(
      LocalStorageManipulator.getItemByKey(
        LocalStorageKey.routineOverviewCharts
      ) ?? []
    );
    chartComponentIdsRef.current = getChartComponentIds(storedCharts);
    return storedCharts;
  });
  const chartTimeHourUnit =
    stationRoutineManager.timeRailScale === "day" ? 1 : 24;
  const headerLeft = sidebarManager.isMobile
    ? 0
    : sidebarManager.open
      ? resizableSidebarManager.width
      : "var(--sidebar-width-icon)";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShouldRenderTimeRails(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    LocalStorageManipulator.setItem(
      LocalStorageKey.routineOverviewCharts,
      chartComponentIdsRef.current
    );
  }, []);

  const setChartsAndPersist = (
    getNextCharts: (
      currentCharts: RoutineOverviewChart[]
    ) => RoutineOverviewChart[]
  ) => {
    setCharts(currentCharts => {
      const nextCharts = createChartsFromComponentIds(
        getChartComponentIds(getNextCharts(currentCharts))
      );
      const nextComponentIds = getChartComponentIds(nextCharts);

      chartComponentIdsRef.current = nextComponentIds;
      LocalStorageManipulator.setItem(
        LocalStorageKey.routineOverviewCharts,
        nextComponentIds
      );

      return nextCharts;
    });
  };

  const addChart = (chart: NewRoutineOverviewChart) => {
    setChartsAndPersist(currentCharts => {
      const componentId = getChartDefinitionId(chart);
      if (!componentId) return currentCharts;

      const hasChart = currentCharts.some(
        currentChart => currentChart.id === componentId
      );
      if (hasChart) return currentCharts;

      return [
        ...currentCharts,
        { ...chart, id: componentId } as RoutineOverviewChart,
      ];
    });
  };

  const updateChart = (nextChart: RoutineOverviewChart) => {
    setChartsAndPersist(currentCharts => {
      const nextComponentId = getChartDefinitionId(nextChart);
      if (!nextComponentId) return currentCharts;

      const hasDuplicate = currentCharts.some(
        chart => chart.id !== nextChart.id && chart.id === nextComponentId
      );
      if (hasDuplicate) return currentCharts;

      return currentCharts.map(chart =>
        chart.id === nextChart.id
          ? ({ ...nextChart, id: nextComponentId } as RoutineOverviewChart)
          : chart
      );
    });
  };

  const removeChart = (chartId: string) => {
    setChartsAndPersist(currentCharts =>
      currentCharts.filter(chart => chart.id !== chartId)
    );
  };

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [backgroundImagesManager.currentBackgroundImage]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-start overflow-hidden bg-inset bg-cover bg-center bg-no-repeat">
      <header
        className="
          fixed top-0 right-0 z-20 h-10
          flex shrink-0 justify-between items-center
          gap-2 bg-inset/75 backdrop-blur-md border-inset/10
        "
        style={{
          left: headerLeft,
          transition: "left 0.2s",
        }}
      >
        <RoutineScopeBar
          onOpenAddChart={() => setIsAddChartDialogOpen(true)}
          showStationStatus={showStationScope}
        />
      </header>
      <div className="custom-scrollbar flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto pt-10">
        <div className="relative z-10 h-60 w-full shrink-0">
          {isHeaderBackgroundImageEditing ? (
            <Button
              variant="ghost"
              className="
                absolute right-0 bottom-0 justify-center items-center
                rounded-full shadow-lg w-8 h-8 m-2
                transition z-100
              "
              onClick={() => setIsHeaderBackgroundImageEditing(false)}
            >
              <CheckIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="
                absolute right-0 bottom-0 justify-center items-center
                rounded-full shadow-lg w-8 h-8 m-2
                transition z-100
              "
              onClick={() => setIsHeaderBackgroundImageEditing(true)}
            >
              <SquarePen />
            </Button>
          )}
          {backgroundImagesManager.currentBackgroundImage === null ? (
            <div
              ref={headerBackgroundImageRef}
              className="relative z-10 h-full w-full shrink-0 overflow-hidden"
            >
              <img
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full object-cover"
                decoding="async"
                fetchPriority="high"
                src={defaultHeaderBackgroundImage}
              />
              {isHeaderBackgroundImageEditing && (
                <ModifyImageHover
                  className="absolute"
                  imageSrc=""
                  imageAlt={t("workspace.navigation.dashboardBackgroundImage")}
                  onClick={() =>
                    modalManager.open("SelectBackgroundImageDialog", {
                      cropperAspectRatio: cropperAspectRatio,
                    })
                  }
                  hoverText={t("workspace.navigation.changeBackgroundImage")}
                />
              )}
            </div>
          ) : (
            <ProgressiveBackground
              ref={headerBackgroundImageRef}
              className="w-full h-full shrink-0 border-none relative z-10"
            >
              {isHeaderBackgroundImageEditing && (
                <ModifyImageHover
                  className="absolute inset-0"
                  imageAlt={t("workspace.navigation.dashboardBackgroundImage")}
                  onClick={() =>
                    modalManager.open("SelectBackgroundImageDialog", {
                      cropperAspectRatio: cropperAspectRatio,
                    })
                  }
                  hoverText={t("workspace.navigation.changeBackgroundImage")}
                />
              )}
            </ProgressiveBackground>
          )}
        </div>
        <div className="relative z-20 -mt-3 flex w-full min-h-0 shrink-0 flex-col gap-2 overflow-x-hidden rounded-t-lg border border-foreground/30 bg-inset p-2">
          {shouldRenderTimeRails ? (
            <Suspense fallback={<TimeRailsSkeleton />}>
              <TimeRails />
            </Suspense>
          ) : (
            <TimeRailsSkeleton />
          )}
          <RoutineCharts
            charts={charts}
            onChartChange={updateChart}
            onChartRemove={removeChart}
            onOpenAddChart={() => setIsAddChartDialogOpen(true)}
            queryRange={stationRoutineManager.timeWindow}
            timeHourUnit={chartTimeHourUnit}
          />
          <RoutineTable />
          <RoutineTaskTable />
          <RoutineTaskRecordTable />
        </div>
      </div>
      <AddChartDialog
        activeChartComponentIds={getChartComponentIds(charts)}
        onAddChart={addChart}
        onOpenChange={setIsAddChartDialogOpen}
        open={isAddChartDialogOpen}
      />
    </div>
  );
};

export default RoutineOverviewerContent;
