import { isValidUUID } from "@shared/lib/uuid/uuidv4.type";
import { notFound, useLoaderData } from "@tanstack/react-router";
import type { UUID } from "crypto";
import RoutinesPage from "@/pages/app/routines/RoutinesPage";

export const loadStationRoutines = (stationId: string) => {
  if (!isValidUUID(stationId)) throw notFound();
  return { stationId: stationId as UUID };
};

export function StationRoutinesRoute() {
  const { stationId } = useLoaderData({ strict: false }) as {
    stationId: UUID;
  };
  return <RoutinesPage stationId={stationId} />;
}
