import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { getQueryClient } from "@shared/api/queryClient";
import { APIURLPathDictionary } from "@shared/api/url";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import {
  useVisualizeMyRoutineTaskRecordActualEndedAtCount,
  useVisualizeMyRoutineTaskRecordActualStartedAtCount,
  useVisualizeMyRoutineTaskRecordPurposeCount,
  useVisualizeMyRoutineTaskRecordScheduledAtCount,
  useVisualizeMyRoutineTaskRecordStatusCount,
} from "@/api/hooks/routineTaskRecord.hook";
import { useVisualizeMyTotalCount } from "@/api/hooks/station.hook";
import RoutineCharts, {
  CHART_DEFINITIONS,
} from "@/components/core/RoutineOverviewer/RoutineCharts/RoutineCharts";

export const mountRoutineChartsExample = () => {
  const container = document.createElement("div");
  container.id = "routine-charts-test-root";
  document.body.append(container);
  const root = createRoot(container);
  const queryClient = getQueryClient();
  const param = { permission: AccessControlPermission.Owner };
  const queryRange = {
    startAt: new Date("2026-10-20T00:00:00Z"),
    endAt: new Date("2026-10-21T00:00:00Z"),
  };
  const bucket = {
    ...param,
    timeHourUnit: 24,
    queryRangeStartedAt: queryRange.startAt,
    queryRangeEndedAt: queryRange.endAt,
  };
  let fetchTotal = async () => {};
  const Example = () => {
    const total = useVisualizeMyTotalCount();
    fetchTotal = async () => {
      await queryClient.invalidateQueries({
        queryKey: ["station", "visualizeMyTotalCount"],
        refetchType: "none",
      });
      await total.fetch({ param });
    };
    const records = [
      useVisualizeMyRoutineTaskRecordStatusCount({ param }),
      useVisualizeMyRoutineTaskRecordPurposeCount({ param }),
      useVisualizeMyRoutineTaskRecordScheduledAtCount({ param: bucket }),
      useVisualizeMyRoutineTaskRecordActualStartedAtCount({ param: bucket }),
      useVisualizeMyRoutineTaskRecordActualEndedAtCount({ param: bucket }),
    ];
    return (
      <>
        <output
          data-record-query-status={records.every(query => query.isSuccess)}
        />
        <RoutineCharts
          charts={Object.values(CHART_DEFINITIONS).map(value => ({
            ...value.chart,
            id: value.id,
          }))}
          onChartChange={() => {}}
          onChartRemove={() => {}}
          onOpenAddChart={() => {}}
          queryRange={queryRange}
          timeHourUnit={24}
        />
      </>
    );
  };
  root.render(
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
  return {
    paths: [
      APIURLPathDictionary.station,
      APIURLPathDictionary.routine,
      APIURLPathDictionary.routineTask,
      APIURLPathDictionary.routineTaskRecord,
    ].flatMap(domain =>
      Object.entries(domain)
        .filter(([key]) => key.startsWith("visualize"))
        .map(([, value]) => value as string)
    ),
    queryStates: () =>
      queryClient
        .getQueryCache()
        .getAll()
        .filter(
          query =>
            query.isActive() &&
            typeof query.queryKey[1] === "string" &&
            query.queryKey[1].startsWith("visualize") &&
            query.queryKey[2] === AccessControlPermission.Owner
        )
        .map(query => query.state.status),
    refetch: async () => {
      // Repeated acceptance rounds must respect the Gateway's burst limit.
      for (const query of queryClient.getQueryCache().getAll()) {
        if (
          !query.isActive() ||
          !String(query.queryKey[1]).startsWith("visualize")
        )
          continue;
        await queryClient.refetchQueries(
          { queryKey: query.queryKey, exact: true, type: "active" },
          { throwOnError: true }
        );
      }
    },
    fetchTotal: () => fetchTotal(),
    unmount: () => root.unmount(),
  };
};
