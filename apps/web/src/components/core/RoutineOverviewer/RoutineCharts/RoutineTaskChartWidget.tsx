import { useVisualizeMyRoutineTaskPurposeCount } from "@/api/hooks/routineTask.hook";
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
}

const RoutineTaskChartWidget = ({
  chartType,
  onChartTypeChange,
  onRemove,
}: RoutineTaskChartWidgetProps) => {
  const { t } = useTranslation();
  const options = [
    { value: "purposeCount", label: t("workspace.charts.purposeCounts") },
  ] satisfies { value: RoutineTaskChartType; label: string }[];
  const permission = AccessControlPermission.Owner;
  const purposeQuery = useVisualizeMyRoutineTaskPurposeCount(
    { param: { permission } },
    { enabled: chartType === "purposeCount" }
  );
  const points = purposeQuery.data?.data.data ?? [];
  const displayPoints =
    purposeQuery.isError || !hasPositiveChartValue(points) ? [] : points;
  const data = { data: displayPoints };
  const series = {
    id: "routineTaskCount",
    label: t("workspace.scope.routineTasks"),
    color: "var(--chart-3)",
  };
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
        chartType="column"
        data={data}
        emptyMessage={
          purposeQuery.isError
            ? t("workspace.charts.unableToLoadTaskPurposes")
            : t("workspace.charts.noData")
        }
        height={280}
        loading={purposeQuery.isPending}
        series={series}
        showLegend={false}
      />
    </ChartWidgetFrame>
  );
};

export default RoutineTaskChartWidget;
