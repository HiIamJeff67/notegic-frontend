import { useStationRoutineSidebar } from "@shared/api/hooks/react/StationRoutineSidebarProvider";
import { useGetMyRoutinesByStationId } from "@shared/api/hooks/routine.hook";
import {
  RoutineIcon,
  StationIcon,
} from "@shared/components/icons/WorkspaceEntityIcons";
import { Button } from "@shared/components/shadcn/button";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useNavigate } from "@tanstack/react-router";
import { GetMyRoutinesByStationId } from "../../../api/functions/routine.function";
import { useDesktopSession } from "../../../providers/DesktopSessionProvider";

const StationRoutines = ({
  stationId,
  stationName,
}: {
  stationId: string;
  stationName: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routines = useGetMyRoutinesByStationId(GetMyRoutinesByStationId, {
    param: { stationId, areDeleted: false },
  });
  const rows = routines.data?.data ?? [];
  return (
    <section className="min-w-0">
      <h2 className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <StationIcon size={16} />
        <span className="truncate">{stationName}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="px-6 py-2 text-sm text-muted-foreground">
          {t("workspace.table.noRoutinesMatch")}
        </p>
      ) : (
        <ul className="mt-1 flex min-w-0 flex-col">
          {rows.map(routine => (
            <li key={routine.id}>
              <Button
                variant="ghost"
                className="min-w-0 justify-start"
                onClick={() =>
                  void navigate({
                    to: "/app/routines/$routineId",
                    params: { routineId: routine.id },
                  })
                }
              >
                <RoutineIcon className="size-4" />
                <span className="truncate">{routine.title}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const RoutineOverview = () => {
  const { t } = useTranslation();
  const sidebar = useStationRoutineSidebar();
  return (
    <main className="flex min-h-0 min-w-0 flex-col gap-6 overflow-auto p-6">
      <h1 className="text-lg font-medium">
        {t("workspace.navigation.routinesOverview")}
      </h1>
      {sidebar.stations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("workspace.scope.noStations")}
        </p>
      ) : (
        sidebar.stations.map(station => (
          <StationRoutines
            key={station.id}
            stationId={station.id}
            stationName={station.name}
          />
        ))
      )}
    </main>
  );
};

export default function RoutineOverviewPage() {
  const { t } = useTranslation();
  const session = useDesktopSession();
  if (!session.account) {
    return (
      <main className="min-w-0 p-6">
        <h1 className="text-lg font-medium">{t("auth.login")}</h1>
      </main>
    );
  }
  return <RoutineOverview />;
}
