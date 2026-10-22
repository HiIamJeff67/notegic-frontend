import { getQueryClient } from "@shared/api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import RoutineTable from "@/components/core/RoutineOverviewer/RoutineTable/RoutineTable";
import RoutineTaskTable from "@/components/core/RoutineOverviewer/RoutineTaskTable/RoutineTaskTable";
import { TransactionSynchronizerContext } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import type { UUID } from "crypto";
import type { ContextType } from "react";
import { createRoot } from "react-dom/client";
import { getClientCSRFToken } from "@/api/clientHeaders";
import { searchPaginationPolicy } from "@/api/policies/searchPagination.policy";
import RoutineRecordTable from "@/components/core/RoutineOverviewer/RoutineRecordTable/RoutineRecordTable";
import RoutineTaskRecordTable from "@/components/core/RoutineOverviewer/RoutineTaskRecordTable/RoutineTaskRecordTable";
import RoutineTaskRecordDialog from "@/components/dialogs/StationRoutineDialog/RoutineTaskRecordDialog";
import { ModalProvider } from "@/providers/ModalProvider";
import { StationRoutineContext } from "@/providers/StationRoutineProvider/StationRoutineProvider";

export const mountRoutineRecords = (
  mode:
    | "routine"
    | "task"
    | "dialog"
    | "record-dialog"
    | "task-dialog"
    | "routines"
    | "tasks",
  options: {
    uri?: string;
    routineId?: UUID;
    taskId?: UUID;
    routineRecordId?: UUID;
  } = {}
) => {
  const routineId = options.routineId ?? "00000000-0000-4000-8000-000000000001";
  const taskId = options.taskId ?? "00000000-0000-4000-8000-000000000002";
  const stationId = "00000000-0000-4000-8000-000000000010" as UUID;
  const fixtureRoutine = {
    id: routineId,
    stationId,
    title: "Record acceptance",
    routineTagIds: [],
    routineTaskIds: [taskId],
  };
  const context = {
    viewMode: "overview",
    activeStationId: null,
    stations: [{ id: stationId, name: "Fixture station" }],
    routineTags: [],
    routines: [fixtureRoutine],
    presence: {
      stationIds: [stationId],
      routineTagIds: [],
      showUntaggedRoutines: true,
      query: "",
    },
    getStationById: () => ({ id: stationId, name: "Fixture station" }),
    getRoutineTagById: () => undefined,
    openInspector: (target: { id: string }) => {
      container.dataset.inspectedId = target.id;
    },
    visibleRoutines: [
      { id: routineId, title: "Record acceptance", routineTaskIds: [taskId] },
    ],
    getRoutineById: () => fixtureRoutine,
    getRoutineTaskById: () => ({ id: taskId, title: "Task acceptance" }),
  } as unknown as ContextType<typeof StationRoutineContext>;
  const client = new ApolloClient({
    link: new HttpLink({
      uri: options.uri ?? "/record-acceptance/graphql",
      credentials: "include",
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            "X-CSRF-Token": getClientCSRFToken() ?? "",
          },
        }),
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            searchRoutines: searchPaginationPolicy,
            searchRoutineTasks: searchPaginationPolicy,
            searchRoutineRecords: searchPaginationPolicy,
            searchRoutineTaskRecords: searchPaginationPolicy,
          },
        },
      },
    }),
  });
  const container = document.createElement("div");
  container.id = "routine-record-acceptance";
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    background: "white",
    zIndex: "40",
    overflow: "auto",
  });
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    <QueryClientProvider client={getQueryClient()}>
      <ApolloProvider client={client}>
        <TransactionSynchronizerContext.Provider
          value={
            { synchronizationRevision: 0 } as ContextType<
              typeof TransactionSynchronizerContext
            >
          }
        >
          <StationRoutineContext.Provider value={context}>
            <ModalProvider>
              {mode === "routines" ? (
                <RoutineTable />
              ) : mode === "tasks" ? (
                <RoutineTaskTable />
              ) : mode === "routine" ? (
                <RoutineRecordTable />
              ) : mode === "task" ? (
                <RoutineTaskRecordTable routineTaskIds={[taskId]} />
              ) : (
                <RoutineTaskRecordDialog
                  isOpen
                  onClose={() => {}}
                  routineTitle="Record acceptance"
                  routineId={mode === "task-dialog" ? undefined : routineId}
                  routineTaskIds={mode === "task-dialog" ? [taskId] : []}
                  routineRecordId={
                    options.routineRecordId ??
                    (mode === "record-dialog"
                      ? "00000000-0000-4000-8000-000000000099"
                      : undefined)
                  }
                />
              )}
            </ModalProvider>
          </StationRoutineContext.Provider>
        </TransactionSynchronizerContext.Provider>
      </ApolloProvider>
    </QueryClientProvider>
  );
  return {
    unmount: () => {
      root.unmount();
      client.stop();
      container.remove();
    },
  };
};
