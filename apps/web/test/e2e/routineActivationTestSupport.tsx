import { getQueryClient } from "@shared/api/queryClient";
import { DefaultStandardTheme } from "@shared/constants";
import { QueryClientProvider } from "@tanstack/react-query";
import { type ContextType, useState } from "react";
import { createRoot } from "react-dom/client";
import { localDB } from "@/api/local/db";
import { Station, User } from "@/api/local/schemas";
import RoutineInspector from "@/components/inspectors/RoutineInspector";
import { StationRoutineContext } from "@/providers/StationRoutineProvider/StationRoutineProvider";
import { ThemeContext } from "@/providers/ThemeProvider";

const routineId = "12345678-1234-4234-8234-123456789abc";
const stationId = "22345678-1234-4234-8234-123456789abc";

const RoutineActivationFixture = () => {
  const [submitted, setSubmitted] = useState<unknown>(null);
  const manager = {
    getRoutineTaskById: () => undefined,
    upsertRoutineNode: () => {},
    isUpdatingRoutine: false,
    updateRoutine: async (_id: string, values: unknown) => {
      setSubmitted(values);
    },
  } as unknown as ContextType<typeof StationRoutineContext>;
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ThemeContext.Provider
        value={
          { currentTheme: DefaultStandardTheme } as ContextType<
            typeof ThemeContext
          >
        }
      >
        <StationRoutineContext.Provider value={manager}>
          <output aria-label="Submitted routine">
            {JSON.stringify(submitted)}
          </output>
          <RoutineInspector routineId={routineId} isOpen onClose={() => {}} />
        </StationRoutineContext.Provider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};

export const mountRoutineActivationInspector = async () => {
  await localDB.ensureReady();
  await localDB
    .insert(Station)
    .values({ id: stationId, name: "Fixture station" });
  await localDB.insert(User).values({
    publicId: "activation-fixture",
    name: "ActivationFixture",
    displayName: "Fixture",
    email: "activation@example.invalid",
  });
  const container = document.createElement("div");
  document.body.append(container);
  createRoot(container).render(<RoutineActivationFixture />);
};
