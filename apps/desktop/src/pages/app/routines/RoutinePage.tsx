import { useGetMyRoutineById } from "@shared/api/hooks/routine.hook";
import { useTranslation } from "@shared/hooks/useTranslation";
import { useParams } from "@tanstack/react-router";
import { GetMyRoutineById } from "../../../api/functions/routine.function";
import { useDesktopSession } from "../../../providers/DesktopSessionProvider";

const RoutineBody = ({ routineId }: { routineId: string }) => {
  const { t } = useTranslation();
  const routine = useGetMyRoutineById(GetMyRoutineById, {
    param: { routineId, isDeleted: false },
  });
  return (
    <main className="min-w-0 p-6">
      <h1 className="truncate text-lg font-medium">
        {routine.data?.data.title || t("workspace.navigation.routinesOverview")}
      </h1>
      {routine.data?.data.description ? (
        <p className="mt-4 min-w-0 whitespace-pre-wrap text-sm">
          {routine.data.data.description}
        </p>
      ) : null}
    </main>
  );
};

export default function RoutinePage() {
  const { t } = useTranslation();
  const { routineId } = useParams({ from: "/app/routines/$routineId" });
  const session = useDesktopSession();
  if (!session.account) {
    return (
      <main className="min-w-0 p-6">
        <h1 className="text-lg font-medium">{t("auth.login")}</h1>
      </main>
    );
  }
  return <RoutineBody routineId={routineId} />;
}
