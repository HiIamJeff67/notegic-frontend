import { isValidUUID } from "@shared/types/uuidv4.type";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UUID } from "crypto";
import RoutinesPage from "@/pages/app/routines/RoutinesPage";

export const Route = createFileRoute("/app/routines/$stationId")({
  ssr: false,
  loader: ({ params }) => {
    if (!isValidUUID(params.stationId)) {
      throw notFound();
    }

    return {
      stationId: params.stationId as UUID,
    };
  },
  component: StationRoutinesRoute,
});

function StationRoutinesRoute() {
  const { stationId } = Route.useLoaderData();
  return <RoutinesPage stationId={stationId} />;
}
