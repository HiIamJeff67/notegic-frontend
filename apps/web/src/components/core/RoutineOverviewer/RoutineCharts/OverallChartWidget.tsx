import { useVisualizeMyTotalCount } from "@/api/hooks/station.hook";
import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { IntChart } from "@shared/charts/components";
import { hasPositiveChartValue } from "@shared/charts/util";
import { useTranslation } from "react-i18next";
import { ChartWidgetFrame } from "./ChartWidgetFrame";
import type { OverallChartType } from "./RoutineCharts";

interface OverallChartWidgetProps {
  chartType: OverallChartType;
  onChartTypeChange: (chartType: OverallChartType) => void;
  onRemove: () => void;
}

const OverallChartWidget = ({
  chartType,
  onChartTypeChange,
  onRemove,
}: OverallChartWidgetProps) => {
  const { t } = useTranslation();
  const query = useVisualizeMyTotalCount({
    param: { permission: AccessControlPermission.Owner },
  });
  const points = query.data?.data.data ?? [];
  const displayPoints =
    query.isError || !hasPositiveChartValue(points) ? [] : points;

  return (
    <ChartWidgetFrame
      title={t("workspace.charts.overall")}
      value={chartType}
      options={[
        { value: "totalCount", label: t("workspace.charts.totalCounts") },
      ]}
      onValueChange={onChartTypeChange}
      onRemove={onRemove}
    >
      <IntChart
        ariaLabel={t("workspace.charts.workspaceTotals")}
        chartType="column"
        data={{ data: displayPoints }}
        emptyMessage={
          query.isError
            ? t("workspace.charts.unableToLoadTotals")
            : t("workspace.charts.noData")
        }
        height={280}
        loading={query.isPending}
        series={{
          id: "totalCount",
          label: t("workspace.charts.total"),
          color: "var(--chart-1)",
        }}
        showLegend={false}
      />
    </ChartWidgetFrame>
  );
};

export default OverallChartWidget;
