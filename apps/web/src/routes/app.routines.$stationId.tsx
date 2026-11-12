import { createFileRoute } from "@tanstack/react-router";
import {
  loadStationRoutines,
  StationRoutinesRoute,
} from "@/pages/app/routines/StationRoutinesRoute";

export const Route = createFileRoute("/app/routines/$stationId")({
  ssr: false,
  loader: ({ params }) => loadStationRoutines(params.stationId),
  component: StationRoutinesRoute,
});
