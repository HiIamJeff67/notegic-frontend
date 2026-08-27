import {
  useVisualizeMyRoutineTaskActualEndedAtCount,
  useVisualizeMyRoutineTaskActualStartedAtCount,
  useVisualizeMyRoutineTaskPurposeCount,
  useVisualizeMyRoutineTaskScheduledAtCount,
  useVisualizeMyRoutineTaskStatusCount,
} from "@/api/hooks/routineTask.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { IntChart } from "@shared/charts/components";
import { hasPositiveChartValue } from "@shared/charts/util";
import { useTranslation } from "react-i18next";
import { ChartWidgetFrame } from "./ChartWidgetFrame";
import type { RoutineTaskChartType } from "./RoutineCharts";

interface RoutineTaskChartWidgetProps {
  chartType: RoutineTaskChartType;
  onChartTypeChange: (chartType: RoutineTaskChartType) => void;
  onRemove: () => void;
  queryRange: { startAt: Date; endAt: Date };
  timeHourUnit: number;
}

const RoutineTaskChartWidget = ({
  chartType,
  onChartTypeChange,
  onRemove,
  queryRange,
  timeHourUnit,
}: RoutineTaskChartWidgetProps) => {
  const { t } = useTranslation();
  const options = [
    { value: "statusCount", label: t("workspace.charts.statusCounts") },
    { value: "purposeCount", label: t("workspace.charts.purposeCounts") },
    {
      value: "scheduledAtCount",
      label: t("workspace.charts.scheduledTimes"),
    },
    {
      value: "actualStartedAtCount",
      label: t("workspace.charts.actualStarts"),
    },
    {
      value: "actualEndedAtCount",
      label: t("workspace.charts.actualEnds"),
    },
  ] satisfies { value: RoutineTaskChartType; label: string }[];
  const permission = AccessControlPermission.Owner;
  const timeParam = {
    permission,
    timeHourUnit,
    queryRangeStartedAt: queryRange.startAt,
    queryRangeEndedAt: queryRange.endAt,
  };
  const statusQuery = useVisualizeMyRoutineTaskStatusCount(
    { param: { permission } },
    { enabled: chartType === "statusCount" }
  );
  const purposeQuery = useVisualizeMyRoutineTaskPurposeCount(
    { param: { permission } },
    { enabled: chartType === "purposeCount" }
  );
  const scheduledQuery = useVisualizeMyRoutineTaskScheduledAtCount(
    { param: timeParam },
    { enabled: chartType === "scheduledAtCount" }
  );
  const actualStartedQuery = useVisualizeMyRoutineTaskActualStartedAtCount(
    { param: timeParam },
    { enabled: chartType === "actualStartedAtCount" }
  );
  const actualEndedQuery = useVisualizeMyRoutineTaskActualEndedAtCount(
    { param: timeParam },
    { enabled: chartType === "actualEndedAtCount" }
  );

  const query =
    chartType === "statusCount"
      ? statusQuery
      : chartType === "purposeCount"
        ? purposeQuery
        : chartType === "scheduledAtCount"
          ? scheduledQuery
          : chartType === "actualStartedAtCount"
            ? actualStartedQuery
            : actualEndedQuery;
  const points = query.data?.data.data ?? [];
  const displayPoints =
    query.isError || !hasPositiveChartValue(points) ? [] : points;
  const data = { data: displayPoints };
  const series = {
    id: "routineTaskCount",
    label: t("workspace.scope.routineTasks"),
    color: "var(--chart-3)",
  };
  const chartKind =
    chartType === "statusCount"
      ? "bar"
      : chartType === "purposeCount"
        ? "column"
        : "line";
  const errorText =
    chartType === "statusCount"
      ? t("workspace.charts.unableToLoadTaskStatus")
      : chartType === "purposeCount"
        ? t("workspace.charts.unableToLoadTaskPurposes")
        : t("workspace.charts.unableToLoadRoutineTasks");

  return (
    <ChartWidgetFrame
      title={t("workspace.charts.routineTask")}
      value={chartType}
      options={options}
      onValueChange={onChartTypeChange}
      onRemove={onRemove}
    >
      <IntChart
        ariaLabel={t("workspace.charts.chartLabel", {
          title: t("workspace.charts.routineTask"),
        })}
        chartType={chartKind}
        data={data}
        emptyMessage={query.isError ? errorText : t("workspace.charts.noData")}
        height={280}
        loading={query.isPending}
        series={series}
        showLegend={false}
      />
    </ChartWidgetFrame>
  );
};

export default RoutineTaskChartWidget;
