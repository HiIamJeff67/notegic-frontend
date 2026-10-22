import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { getQueryClient } from "@shared/api/queryClient";
import { DefaultStandardTheme } from "@shared/constants";
import { getDefaultRoutineNode } from "@shared/types/routineNode.type";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ContextType } from "react";
import { useUpdateMyRoutineById } from "@/api/hooks/routine.hook";
import { localDB } from "@/api/local/db";
import RoutineTaskDependencyGraphEditor from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphEditor";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LoadingContext } from "@/providers/LoadingProvider";
import {
  defaultLocalPreferences,
  LocalPreferencesContext,
} from "@/providers/LocalPreferencesProvider";
import { RoutineTaskDependencyGraphDraftProvider } from "@/providers/RoutineTaskDependencyGraphDraftProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { StationRoutineContext } from "@/providers/StationRoutineProvider/StationRoutineProvider";
import { ThemeContext } from "@/providers/ThemeProvider";
import { TransactionSynchronizerProvider } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import "@xyflow/react/dist/style.css";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { applyNodeChanges, type NodeChange } from "@xyflow/react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import RoutineTaskDependencyGraphCanvas from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphCanvas";
import RoutineTaskDependencyGraphToolbar from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphToolbar";
import type { RoutineTaskGraphNode as GraphNode } from "@/providers/RoutineTaskDependencyGraphDraftProvider";
import { ModalProvider } from "@/providers/ModalProvider";

const RoutineGraphFixture = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isInteractive, setIsInteractive] = useState(true);
  const [editingId, setEditingId] = useState("");
  const [nodes, setNodes] = useState<GraphNode[]>([
    {
      id: "action",
      type: "routineTask",
      position: { x: 450, y: 100 },
      data: {
        title: "Read routine",
        kind: "Action",
        payload: { schemaVersion: 1, purpose: RoutineTaskPurpose.GetRoutine },
        onEdit: () => setEditingId("action"),
      },
    },
  ]);
  const addStart = () => {
    const id = `start-${nodes.length}`;
    setNodes(current => [
      ...current,
      {
        id,
        type: "routineTask",
        position: { x: 80, y: 100 },
        data: {
          title: "Daily entry",
          kind: "Start",
          payload: { schemaVersion: 1, isActive: true },
          onEdit: () => setEditingId(id),
          onUpdated: async values => {
            setNodes(current =>
              current.map(node =>
                node.id === id
                  ? { ...node, data: { ...node.data, ...values } }
                  : node
              )
            );
          },
        },
      },
    ]);
  };
  return (
    <ModalProvider>
      <div className="h-full flex flex-col bg-background text-foreground">
        <output aria-label="Editing node">{editingId}</output>
        <RoutineTaskDependencyGraphToolbar
          canRealign={false}
          onRealign={() => {}}
          isAddMenuOpen={menuOpen}
          onAddMenuOpenChange={setMenuOpen}
          isRetryingSync={false}
          isSaving={false}
          pendingSyncCount={0}
          onAddStartingNode={addStart}
          canAddStartingNode={
            nodes.filter(node => node.data.kind === "Start").length < 16
          }
          onOpenCreateRoutineTaskDialog={() => {}}
          onRetryPendingSync={() => {}}
          onExport={() => {}}
        />
        <div className="min-h-0 flex-1">
          <RoutineTaskDependencyGraphCanvas
            isInteractive={isInteractive}
            onInteractiveChange={setIsInteractive}
            colorMode="dark"
            nodes={nodes}
            edges={[]}
            isMiniMapVisible={false}
            onConnect={() => {}}
            onEdgeClick={() => {}}
            onEdgesChange={() => {}}
            onMiniMapVisibilityChange={() => {}}
            onPaneClick={() => {}}
            onNodesChange={(changes: NodeChange<GraphNode>[]) =>
              setNodes(current => applyNodeChanges(changes, current))
            }
          />
        </div>
      </div>
    </ModalProvider>
  );
};

export const mountRoutineGraph = () => {
  const container = document.createElement("div");
  container.id = "routine-graph-test-root";
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    zIndex: "40",
  });
  document.body.append(container);
  createRoot(container).render(
    <ScreenProvider>
      <RoutineGraphFixture />
    </ScreenProvider>
  );
};

export const editorRoutineId = "12345678-1234-4234-8234-123456789abc";
export const editorStationId = "32345678-1234-4234-8234-123456789abc";

export const mountRoutineLayoutEditor = async () => {
  await localDB.ensureReady();
  await localDB.run(
    "INSERT INTO UserTable (public_id,name,display_name,email,is_logged_in) VALUES ('editor-user','User','User','editor@example.invalid',1)"
  );
  await localDB.run(
    `INSERT INTO StationTable (id,name) VALUES ('${editorStationId}','Fixture station')`
  );
  await localDB.run(
    `INSERT INTO UsersToStationsTable (user_public_id,station_id,permission) VALUES ('editor-user','${editorStationId}','Owner')`
  );
  await localDB.run(
    `INSERT INTO RoutineTable (id,station_id,title,definition_version,is_active) VALUES ('${editorRoutineId}','${editorStationId}','Queue test',7,1)`
  );
  await localDB.run(
    `INSERT INTO RoutineTaskTable (id,routine_id,kind,title,payload,x,y) VALUES ('22345678-1234-4234-8234-123456789abc','${editorRoutineId}','Start','Daily entry','{"schemaVersion":1,"isActive":true}',-200,0)`
  );
  await localDB.run(
    `INSERT INTO RoutineTaskTable (id,routine_id,kind,title,payload,x,y) VALUES ('42345678-1234-4234-8234-123456789abc','${editorRoutineId}','Action','Read routine','{"schemaVersion":1,"purpose":"GetRoutine","routineId":"${editorRoutineId}"}',300,0)`
  );
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => false,
  });
  await mountRoutineEditor();
};
const ActiveProbe = () => {
  const mutation = useUpdateMyRoutineById();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const response = await mutation.mutateAsync({
          body: { routineId: editorRoutineId, values: { isActive: false } },
        });
        setPending(!response.success);
      }}
    >
      {pending ? "Active queued" : "Pause fixture"}
    </button>
  );
};

export const mountRoutineEditor = async () => {
  await localDB.ensureReady();
  const routine = {
    ...getDefaultRoutineNode(editorRoutineId, editorStationId),
    title: "Queue test",
    timezone: "UTC",
  };
  const station = { id: editorStationId, name: "Fixture station" };
  const stationContext = {
    getRoutineById: () => routine,
    getStationById: () => station,
    initializeStationRoutineData: async () => {},
    searchRoutines: async () => {},
    refresh: async () => {},
    openInspector: () => {},
  } as unknown as ContextType<typeof StationRoutineContext>;
  const loading = {
    startAsyncTransactionLoading: async (operation: () => Promise<unknown>) =>
      operation(),
  } as ContextType<typeof LoadingContext>;
  const preferences = {
    preferences: {
      ...defaultLocalPreferences,
      localVault: true,
      offlineQueue: true,
    },
    isReady: true,
  } as ContextType<typeof LocalPreferencesContext>;
  const theme = { currentTheme: DefaultStandardTheme } as ContextType<
    typeof ThemeContext
  >;
  const container = document.createElement("div");
  container.id = "routine-editor-test-root";
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    zIndex: "40",
  });
  document.body.append(container);
  createRoot(container).render(
    <ScreenProvider>
      <ApolloProvider
        client={
          new ApolloClient({
            cache: new InMemoryCache(),
            link: ApolloLink.empty(),
          })
        }
      >
        <QueryClientProvider client={getQueryClient()}>
          <LocalPreferencesContext.Provider value={preferences}>
            <LoadingContext.Provider value={loading}>
              <ThemeContext.Provider value={theme}>
                <ModalProvider>
                  <SidebarProvider className="h-full min-h-0 flex-col">
                    <StationRoutineContext.Provider value={stationContext}>
                      <TransactionSynchronizerProvider>
                        <RoutineTaskDependencyGraphDraftProvider
                          routineId={editorRoutineId}
                        >
                          <ActiveProbe />
                          <RoutineTaskDependencyGraphEditor />
                        </RoutineTaskDependencyGraphDraftProvider>
                      </TransactionSynchronizerProvider>
                    </StationRoutineContext.Provider>
                  </SidebarProvider>
                </ModalProvider>
              </ThemeContext.Provider>
            </LoadingContext.Provider>
          </LocalPreferencesContext.Provider>
        </QueryClientProvider>
      </ApolloProvider>
    </ScreenProvider>
  );
};
