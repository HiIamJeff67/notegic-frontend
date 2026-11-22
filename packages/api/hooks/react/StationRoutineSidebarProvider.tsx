import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import { NotegicValidationError } from "@shared/api/exceptions/errors/validation.error";
import {
  useCreateRoutineTag,
  useGetAllMyRoutineTags,
} from "@shared/api/hooks/routineTag.hook";
import {
  useCreateStation,
  useDeleteMyStationById,
  useGetAllMyStations,
} from "@shared/api/hooks/station.hook";
import type { GetAllMyRoutineTagsRequest } from "@shared/api/interfaces/routineTag.interface";
import type { GetAllMyStationsRequest } from "@shared/api/interfaces/station.interface";
import { createContext, type ReactNode, useContext } from "react";

export type SidebarStation = {
  id: string;
  name: string;
  routineCount: number;
};

export type SidebarRoutineTag = {
  id: string;
  name: string;
};

type StationRoutineSidebarValue = {
  stations: SidebarStation[];
  routineTags: SidebarRoutineTag[];
  createStation: (name: string) => Promise<void>;
  deleteStation: (stationId: string) => Promise<void>;
  createRoutineTag: (name: string) => Promise<void>;
};

const StationRoutineSidebarContext = createContext<
  StationRoutineSidebarValue | undefined
>(undefined);

const stationRequest: GetAllMyStationsRequest = {
  param: { areDeleted: false },
};
const routineTagRequest: GetAllMyRoutineTagsRequest = {
  param: { areDeleted: false },
};

export const StationRoutineSidebarProvider = ({
  getAllStations,
  createStation,
  deleteStation,
  getAllRoutineTags,
  createRoutineTag,
  children,
}: {
  getAllStations: Parameters<typeof useGetAllMyStations>[0];
  createStation: Parameters<typeof useCreateStation>[0];
  deleteStation: Parameters<typeof useDeleteMyStationById>[0];
  getAllRoutineTags: Parameters<typeof useGetAllMyRoutineTags>[0];
  createRoutineTag: Parameters<typeof useCreateRoutineTag>[0];
  children: ReactNode;
}) => {
  const stationsQuery = useGetAllMyStations(getAllStations, stationRequest);
  const tagsQuery = useGetAllMyRoutineTags(
    getAllRoutineTags,
    routineTagRequest
  );
  const createStationMutation = useCreateStation(createStation);
  const deleteStationMutation = useDeleteMyStationById(deleteStation);
  const createTagMutation = useCreateRoutineTag(createRoutineTag);
  const stations = (stationsQuery.data?.data ?? [])
    .filter(station => station.deletedAt === null)
    .map(station => ({
      id: station.id,
      name: station.name,
      routineCount: station.routineCount,
    }));
  const routineTags = (tagsQuery.data?.data ?? []).map(tag => ({
    id: tag.id,
    name: tag.name,
  }));

  return (
    <StationRoutineSidebarContext.Provider
      value={{
        stations,
        routineTags,
        createStation: async name => {
          const trimmed = name.trim();
          if (trimmed === "") return;
          await createStationMutation.mutateAsync({
            body: {
              name: trimmed,
              description: "",
              icon: null,
              headerBackgroundURL: null,
            },
          });
        },
        deleteStation: async stationId => {
          await deleteStationMutation.mutateAsync({ body: { stationId } });
        },
        createRoutineTag: async name => {
          const trimmed = name.trim();
          if (trimmed === "") return;
          await createTagMutation.mutateAsync({
            body: { name: trimmed, color: "#64748b", icon: null },
          });
        },
      }}
    >
      {children}
    </StationRoutineSidebarContext.Provider>
  );
};

export const useStationRoutineSidebar = () => {
  const value = useContext(StationRoutineSidebarContext);
  if (value === undefined) {
    throw new NotegicValidationError(
      ValidationClientException.ReceivedUndefinedRequest()
    );
  }
  return value;
};
