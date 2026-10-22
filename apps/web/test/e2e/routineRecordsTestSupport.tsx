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
  mode: "routine" | "task" | "dialog",
  options: {
    uri?: string;
    routineId?: UUID;
    taskId?: UUID;
    routineRecordId?: UUID;
  } = {}
) => {
  const routineId = options.routineId ?? "00000000-0000-4000-8000-000000000001";
  const taskId = options.taskId ?? "00000000-0000-4000-8000-000000000002";
  const context = {
    visibleRoutines: [
      { id: routineId, title: "Record acceptance", routineTaskIds: [taskId] },
    ],
    getRoutineById: () => ({
      id: routineId,
      title: "Record acceptance",
      routineTaskIds: [taskId],
    }),
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
    <ApolloProvider client={client}>
      <StationRoutineContext.Provider value={context}>
        <ModalProvider>
          {mode === "routine" ? (
            <RoutineRecordTable />
          ) : mode === "task" ? (
            <RoutineTaskRecordTable routineTaskIds={[taskId]} />
          ) : (
            <RoutineTaskRecordDialog
              isOpen
              onClose={() => {}}
              routineTitle="Record acceptance"
              routineId={routineId}
              routineTaskIds={[]}
              routineRecordId={options.routineRecordId}
            />
          )}
        </ModalProvider>
      </StationRoutineContext.Provider>
    </ApolloProvider>
  );
  return {
    unmount: () => {
      root.unmount();
      client.stop();
      container.remove();
    },
  };
};
