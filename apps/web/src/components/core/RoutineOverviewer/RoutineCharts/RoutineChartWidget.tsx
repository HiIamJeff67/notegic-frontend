import {
  useVisualizeMyRoutinePeriodCount,
  useVisualizeMyRoutineScheduledEndAtCount,
  useVisualizeMyRoutineScheduledStartAtCount,
  useVisualizeMyRoutineStatusCount,
} from "@/api/hooks/routine.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { IntChart } from "@shared/charts/components";
import { hasPositiveChartValue } from "@shared/charts/util";
import { useTranslation } from "react-i18next";
import { ChartWidgetFrame } from "./ChartWidgetFrame";
import type { RoutineChartType } from "./RoutineCharts";

interface RoutineChartWidgetProps {
  chartType: RoutineChartType;
  onChartTypeChange: (chartType: RoutineChartType) => void;
  onRemove: () => void;
  queryRange: { startAt: Date; endAt: Date };
  timeHourUnit: number;
}

const RoutineChartWidget = ({
  chartType,
  onChartTypeChange,
  onRemove,
  queryRange,
  timeHourUnit,
}: RoutineChartWidgetProps) => {
  const { t } = useTranslation();
  const options = [
    { value: "statusCount", label: t("workspace.charts.statusCounts") },
    { value: "periodCount", label: t("workspace.charts.periodCounts") },
    {
      value: "scheduledStartAtCount",
      label: t("workspace.charts.scheduledStarts"),
    },
    {
      value: "scheduledEndAtCount",
      label: t("workspace.charts.scheduledEnds"),
    },
  ] satisfies { value: RoutineChartType; label: string }[];
  const permission = AccessControlPermission.Owner;
  const statusQuery = useVisualizeMyRoutineStatusCount(
    { param: { permission } },
    { enabled: chartType === "statusCount" }
  );
  const periodQuery = useVisualizeMyRoutinePeriodCount(
    { param: { permission } },
    { enabled: chartType === "periodCount" }
  );
  const scheduledStartQuery = useVisualizeMyRoutineScheduledStartAtCount(
    {
      param: {
        permission,
        timeHourUnit,
        queryRangeStartedAt: queryRange.startAt,
        queryRangeEndedAt: queryRange.endAt,
      },
    },
    { enabled: chartType === "scheduledStartAtCount" }
  );
  const scheduledEndQuery = useVisualizeMyRoutineScheduledEndAtCount(
    {
      param: {
        permission,
        timeHourUnit,
        queryRangeStartedAt: queryRange.startAt,
        queryRangeEndedAt: queryRange.endAt,
      },
    },
    { enabled: chartType === "scheduledEndAtCount" }
  );

  const query =
    chartType === "statusCount"
      ? statusQuery
      : chartType === "periodCount"
        ? periodQuery
        : chartType === "scheduledStartAtCount"
          ? scheduledStartQuery
          : scheduledEndQuery;
  const points = query.data?.data.data ?? [];
  const displayPoints =
    query.isError || !hasPositiveChartValue(points) ? [] : points;
  const data = { data: displayPoints };
  const series = {
    id: "routineCount",
    label: t("workspace.scope.routines"),
    color: "var(--chart-2)",
  };
  const chartKind =
    chartType === "statusCount"
      ? "pie"
      : chartType === "periodCount"
        ? "column"
        : "line";
  const errorText =
    chartType === "statusCount"
      ? t("workspace.charts.unableToLoadRoutineStatus")
      : chartType === "periodCount"
        ? t("workspace.charts.unableToLoadRoutinePeriods")
        : t("workspace.charts.unableToLoadRoutines");

  return (
    <ChartWidgetFrame
      title={t("workspace.table.routine")}
      value={chartType}
      options={options}
      onValueChange={onChartTypeChange}
      onRemove={onRemove}
    >
      <IntChart
        ariaLabel={t("workspace.charts.chartLabel", {
          title: t("workspace.table.routine"),
        })}
        chartType={chartKind}
        data={data}
        emptyMessage={query.isError ? errorText : t("workspace.charts.noData")}
        height={280}
        innerRadiusRatio={0.48}
        loading={query.isPending}
        series={series}
        showLegend={chartKind === "pie"}
      />
    </ChartWidgetFrame>
  );
};

export default RoutineChartWidget;
