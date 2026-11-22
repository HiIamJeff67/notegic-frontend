import { useGetMyRoutinesByStationId } from "@shared/api/hooks/routine.hook";
import { useGetMyStationById } from "@shared/api/hooks/station.hook";
import { Button } from "@shared/components/shadcn/button";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useNavigate, useParams } from "@tanstack/react-router";
import { GetMyRoutinesByStationId } from "../../../api/functions/routine.function";
import { GetMyStationById } from "../../../api/functions/station.function";
import { useDesktopSession } from "../../../providers/DesktopSessionProvider";

const StationBody = ({ stationId }: { stationId: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const station = useGetMyStationById(GetMyStationById, {
    param: { stationId, isDeleted: false },
  });
  const routines = useGetMyRoutinesByStationId(GetMyRoutinesByStationId, {
    param: { stationId, areDeleted: false },
  });
  return (
    <main className="min-w-0 p-6">
      <h1 className="truncate text-lg font-medium">
        {station.data?.data.name || t("workspace.navigation.stations")}
      </h1>
      <ul className="mt-4 flex min-w-0 flex-col">
        {(routines.data?.data ?? []).map(routine => (
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
              <span className="truncate">{routine.title}</span>
            </Button>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default function StationPage() {
  const { t } = useTranslation();
  const { stationId } = useParams({ from: "/app/stations/$stationId" });
  const session = useDesktopSession();
  if (!session.account) {
    return (
      <main className="min-w-0 p-6">
        <h1 className="text-lg font-medium">{t("auth.login")}</h1>
      </main>
    );
  }
  return <StationBody stationId={stationId} />;
}
