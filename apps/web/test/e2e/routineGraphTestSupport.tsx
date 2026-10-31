import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { DefaultStandardTheme } from "@shared/constants";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ContextType } from "react";
import { useUpdateMyRoutineById } from "@/api/hooks/routine.hook";
import { localDB } from "@/api/local/db";
import { searchPaginationPolicy } from "@/api/policies/searchPagination.policy";
import RoutineTaskDependencyGraphEditor from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphEditor";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useStationRoutine } from "@/hooks/useStationRoutine";
import { LoadingContext } from "@/providers/LoadingProvider";
import {
  defaultLocalPreferences,
  LocalPreferencesContext,
} from "@/providers/LocalPreferencesProvider";
import { RoutineTaskDependencyGraphDraftProvider } from "@/providers/RoutineTaskDependencyGraphDraftProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { getDefaultRoutineNode } from "@/providers/StationRoutineProvider/routineNode.type";
import { getDefaultRoutineTagNode } from "@/providers/StationRoutineProvider/routineTagNode.type";
import { getDefaultRoutineTaskNode } from "@/providers/StationRoutineProvider/routineTaskNode.type";
import {
  StationRoutineContext,
  StationRoutineProvider,
} from "@/providers/StationRoutineProvider/StationRoutineProvider";
import { getDefaultStationNode } from "@/providers/StationRoutineProvider/stationNode.type";
import { ThemeContext } from "@/providers/ThemeProvider";
import { TransactionSynchronizerProvider } from "@/providers/TransactionSynchronizerProvider/TransactionSynchronizerProvider";
import "@xyflow/react/dist/style.css";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { applyNodeChanges, type NodeChange } from "@xyflow/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import RoutineTaskDependencyGraphCanvas from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphCanvas";
import RoutineTaskDependencyGraphToolbar from "@/components/core/RoutineTaskDependencyGraphEditor/RoutineTaskDependencyGraphToolbar";
import { ModalProvider } from "@/providers/ModalProvider";
import type { RoutineTaskGraphNode as GraphNode } from "@/providers/RoutineTaskDependencyGraphDraftProvider";
import { UserContext } from "@/providers/UserProvider";

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
          canSave={false}
          onSave={() => {}}
          canRealign={false}
          onRealign={() => {}}
          isAddMenuOpen={menuOpen}
          onAddMenuOpenChange={setMenuOpen}
          isActive={true}
          isUpdatingRoutine={false}
          onActiveChange={() => {}}
          isSaving={false}
          isSavingLayout={false}
          onAddStartingNode={addStart}
          canAddStartingNode={
            nodes.filter(node => node.data.kind === "Start").length < 16
          }
          onOpenCreateRoutineTaskDialog={() => {}}
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

export const mountRoutineLayoutEditor = async (realProvider = false) => {
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
    `INSERT INTO RoutineTable (id,station_id,title,definition_version,is_active) VALUES ('${editorRoutineId}','${editorStationId}','Queue test',7,0)`
  );
  await localDB.run(
    `INSERT INTO RoutineTaskTable (id,routine_id,kind,title,payload,x,y) VALUES ('22345678-1234-4234-8234-123456789abc','${editorRoutineId}','Start','Daily entry','{"schemaVersion":1,"isActive":true}',-200,0)`
  );
  await localDB.run(
    `INSERT INTO RoutineTaskTable (id,routine_id,kind,title,payload,x,y) VALUES ('42345678-1234-4234-8234-123456789abc','${editorRoutineId}','Action','Read routine','{"schemaVersion":1,"purpose":"GetRoutine","routineId":"${editorRoutineId}"}',300,0)`
  );
  if (realProvider)
    await localDB.run(
      `INSERT INTO RoutinesToTasksTable (routine_id,task_id) VALUES ('${editorRoutineId}','42345678-1234-4234-8234-123456789abc')`
    );
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => false,
  });
  await mountRoutineEditor(realProvider);
};

const RoutineWorkspaceFixture = ({ children }: { children: ReactNode }) => {
  const manager = useStationRoutine();
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  const original = useRef<{
    station: ReturnType<typeof manager.getStationById>;
    routine: ReturnType<typeof manager.getRoutineById>;
    task: ReturnType<typeof manager.getRoutineTaskById>;
    otherStation: ReturnType<typeof manager.getStationById>;
    otherRoutine: ReturnType<typeof manager.getRoutineById>;
    sibling: ReturnType<typeof manager.getRoutineById>;
    otherTask: ReturnType<typeof manager.getRoutineTaskById>;
    tag: ReturnType<typeof manager.getRoutineTagById>;
  }>(undefined);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void (async () => {
      await manager.initializeStationRoutineData();
      const station = manager.upsertStationNode({
        ...getDefaultStationNode(editorStationId),
        name: "Fixture station",
        isOpen: true,
        isExpanded: true,
      });
      station.isOpen = true;
      station.isExpanded = true;
      const tag = manager.upsertRoutineTagNode({
        ...getDefaultRoutineTagNode("52345678-1234-4234-8234-123456789abc"),
        name: "Fixture tag",
        isOpen: true,
        isExpanded: true,
      });
      const routine = manager.upsertRoutineNode({
        ...getDefaultRoutineNode(editorRoutineId, editorStationId),
        title: "Queue test",
        timezone: "UTC",
        definitionVersion: 7,
        isOpen: true,
        isExpanded: true,
        routineTagIds: [tag.id],
      });
      const task = manager.upsertRoutineTaskNode({
        ...getDefaultRoutineTaskNode(
          "42345678-1234-4234-8234-123456789abc",
          editorRoutineId,
          editorStationId
        ),
        title: "Read routine",
        executionStatus:
          "Running" as import("@shared/api/interfaces/enums").RoutineTaskRecordStatus,
      });
      const sibling = manager.upsertRoutineNode({
        ...getDefaultRoutineNode(
          "62345678-1234-4234-8234-123456789abc",
          editorStationId
        ),
        title: "Sibling routine",
        isOpen: true,
        isExpanded: true,
        routineTagIds: [tag.id],
      });
      const otherStation = manager.upsertStationNode({
        ...getDefaultStationNode("72345678-1234-4234-8234-123456789abc"),
        name: "Other station",
        isOpen: true,
        isExpanded: true,
      });
      const otherRoutine = manager.upsertRoutineNode({
        ...getDefaultRoutineNode(
          "82345678-1234-4234-8234-123456789abc",
          otherStation.id
        ),
        title: "Other routine",
        isOpen: false,
        isExpanded: false,
      });
      const otherTask = manager.upsertRoutineTaskNode({
        ...getDefaultRoutineTaskNode(
          "92345678-1234-4234-8234-123456789abc",
          otherRoutine.id,
          otherStation.id
        ),
        title: "Other task",
      });
      original.current = {
        station,
        routine,
        task,
        sibling,
        otherStation,
        otherRoutine,
        otherTask,
        tag,
      };
      for (const key of [
        queryKeys.routine.oneById(otherRoutine.id),
        queryKeys.routineTask.oneById(otherTask.id),
        queryKeys.routineTaskDependency.byRoutineId(otherRoutine.id),
      ])
        getQueryClient().setQueryData(key, { fixture: "unchanged" });
      manager.setViewMode("station");
      manager.setActiveStationId(editorStationId);
      manager.selectRoutine(editorRoutineId);
      manager.setPresenceQuery("Fixture");
      manager.openInspector({ type: "routine", id: sibling.id });
      setReady(true);
    })();
  }, [manager]);
  const station = manager.getStationById(editorStationId);
  const routine = manager.getRoutineById(editorRoutineId);
  const task = manager.getRoutineTaskById(
    "42345678-1234-4234-8234-123456789abc"
  );
  const tag =
    original.current && manager.getRoutineTagById(original.current.tag!.id);
  return (
    <>
      <output hidden aria-label="Workspace cache">
        {ready
          ? JSON.stringify({
              routine: routine && {
                id: routine.id,
                version: routine.definitionVersion,
                isActive: routine.isActive,
                isOpen: routine.isOpen,
                isExpanded: routine.isExpanded,
                ids: routine.routineTaskIds,
                tasks: routine.routineTasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  executionStatus: task.executionStatus,
                })),
              },
              stationOpen: station?.isOpen,
              stationExpanded: station?.isExpanded,
              selectedRoutineId: manager.selectedRoutineId,
              activeStationId: manager.activeStationId,
              viewMode: manager.viewMode,
              query: manager.presence.query,
              inspectorTarget: manager.inspectorTarget,
              foreignQueries:
                original.current &&
                [
                  queryKeys.routine.oneById(original.current.otherRoutine!.id),
                  queryKeys.routineTask.oneById(original.current.otherTask!.id),
                  queryKeys.routineTaskDependency.byRoutineId(
                    original.current.otherRoutine!.id
                  ),
                ].map(key => ({
                  data: getQueryClient().getQueryData(key),
                  invalidated:
                    getQueryClient().getQueryState(key)?.isInvalidated,
                })),
              identities: original.current && {
                station: station === original.current.station,
                routine: routine === original.current.routine,
                task: task === original.current.task,
                sibling:
                  manager.getRoutineById(original.current.sibling!.id) ===
                  original.current.sibling,
                otherStation:
                  manager.getStationById(original.current.otherStation!.id) ===
                  original.current.otherStation,
                otherRoutine:
                  manager.getRoutineById(original.current.otherRoutine!.id) ===
                  original.current.otherRoutine,
                otherTask:
                  manager.getRoutineTaskById(original.current.otherTask!.id) ===
                  original.current.otherTask,
                tag:
                  manager.getRoutineTagById(original.current.tag!.id) ===
                  original.current.tag,
              },
              otherStation:
                original.current &&
                manager.getStationById(original.current.otherStation!.id),
              sibling:
                original.current &&
                manager.getRoutineById(original.current.sibling!.id),
              tag: tag && {
                id: tag.id,
                name: tag.name,
                isOpen: tag.isOpen,
                isExpanded: tag.isExpanded,
                routineIds: tag.routines.map(routine => routine.id),
              },
            })
          : "loading"}
      </output>
      {ready && children}
    </>
  );
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

export const mountRoutineEditor = async (
  realProvider = false,
  seedWorkspace = true
) => {
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
    upsertRoutineNode: (node: typeof routine) => Object.assign(routine, node),
    initializeStationRoutineData: async () => {},
    searchRoutines: async () => {},
    refresh: async () => {},
    updateRoutineTaskGraph: () => {},
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
  const workspace = (
    <ModalProvider>
      <SidebarProvider className="h-full min-h-0 flex-col">
        <TransactionSynchronizerProvider>
          <RoutineTaskDependencyGraphDraftProvider routineId={editorRoutineId}>
            <ActiveProbe />
            <RoutineTaskDependencyGraphEditor />
          </RoutineTaskDependencyGraphDraftProvider>
        </TransactionSynchronizerProvider>
      </SidebarProvider>
    </ModalProvider>
  );
  createRoot(container).render(
    <ScreenProvider>
      <ApolloProvider
        client={
          new ApolloClient({
            cache: new InMemoryCache({
              typePolicies: {
                Query: {
                  fields: {
                    searchStations: searchPaginationPolicy,
                    searchRoutines: searchPaginationPolicy,
                    searchRoutineTags: searchPaginationPolicy,
                  },
                },
              },
            }),
            link: realProvider
              ? new HttpLink({
                  uri: "/routine-graph-fixture/graphql",
                  fetch: async (_input, init) => {
                    const { operationName } = JSON.parse(String(init?.body));
                    if (
                      ![
                        "SearchStations",
                        "SearchRoutineTags",
                        "SearchRoutines",
                      ].includes(operationName)
                    )
                      throw new Error(
                        `Unexpected fixture query: ${operationName}`
                      );
                    return new Response(
                      JSON.stringify({
                        data: {
                          [operationName[0].toLowerCase() +
                            operationName.slice(1)]: {
                            searchEdges: [],
                            searchPageInfo: {
                              hasNextPage: false,
                              hasPreviousPage: false,
                              startEncodedSearchCursor: null,
                              endEncodedSearchCursor: null,
                            },
                            totalCount: 0,
                            searchTime: 0,
                          },
                        },
                      }),
                      { headers: { "content-type": "application/json" } }
                    );
                  },
                })
              : ApolloLink.empty(),
          })
        }
      >
        <QueryClientProvider client={getQueryClient()}>
          <LocalPreferencesContext.Provider value={preferences}>
            <LoadingContext.Provider value={loading}>
              <ThemeContext.Provider value={theme}>
                <UserContext.Provider
                  value={
                    {
                      fetchUserQuota: async () => {},
                      ...(realProvider
                        ? { userData: { publicId: "editor-user" } }
                        : {}),
                    } as unknown as ContextType<typeof UserContext>
                  }
                >
                  {realProvider ? (
                    <StationRoutineProvider>
                      {seedWorkspace ? (
                        <RoutineWorkspaceFixture>
                          {workspace}
                        </RoutineWorkspaceFixture>
                      ) : (
                        workspace
                      )}
                    </StationRoutineProvider>
                  ) : (
                    <StationRoutineContext.Provider value={stationContext}>
                      {workspace}
                    </StationRoutineContext.Provider>
                  )}
                </UserContext.Provider>
              </ThemeContext.Provider>
            </LoadingContext.Provider>
          </LocalPreferencesContext.Provider>
        </QueryClientProvider>
      </ApolloProvider>
    </ScreenProvider>
  );
};
