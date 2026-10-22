import { RoutineTaskRecordStatus } from "@shared/api/interfaces/enums";
import { routinePhaseTKeys } from "@shared/i18n/enums/routinePhase.tKey";
import { routineTaskRecordStatusTKeys } from "@shared/i18n/enums/routineTaskRecordStatus.tKey";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";
import { type Edge, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChevronDownIcon, SquarePen, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import RoutineTaskStatusDot from "@/components/commons/RoutineTaskStatusDot/RoutineTaskStatusDot";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  useModal,
  useRoutineTaskDependencyGraphDraft,
  useStationRoutine,
  useTheme,
} from "@/hooks";
import type { RoutineTaskGraphNode } from "@/providers/RoutineTaskDependencyGraphDraftProvider";
import RoutineTaskDependencyGraphCanvas from "./RoutineTaskDependencyGraphCanvas";
import RoutineTaskDependencyGraphToolbar from "./RoutineTaskDependencyGraphToolbar";
import RoutineTaskDependencyInspector from "./RoutineTaskDependencyInspector";

const RoutineTaskDependencyGraphEditor = () => {
  const { t } = useTranslation();
  const modalManager = useModal();
  const sidebarManager = useSidebar();
  const themeManager = useTheme();
  const stationRoutineManager = useStationRoutine();
  const {
    routine,
    nodes,
    edges,
    definitionVersion,
    isDirty,
    isLoading,
    isRetryingSync,
    isRealigning,
    isSaving,
    isUpdatingDependency,
    canRealign: hasRealignableGraph,
    canAddStartingNode,
    pendingSyncCount,
    invalidMutationCount,
    selectedEdgeId,
    selectedDependency,
    setSelectedEdgeId,
    dependencyDescription,
    setDependencyDescription,
    dependencyProgress,
    setDependencyProgress,
    reload,
    createStartingNode,
    connectDependency,
    changeEdges,
    changeNodes,
    updateDependency,
    retryPendingSync,
    realign,
  } = useRoutineTaskDependencyGraphDraft();
  const [isRoutineMenuOpen, setIsRoutineMenuOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMiniMapVisible, setIsMiniMapVisible] = useState(true);
  const [isInteractive, setIsInteractive] = useState(true);
  const [isRealignOpen, setIsRealignOpen] = useState(false);
  const flow = useRef<ReactFlowInstance<RoutineTaskGraphNode, Edge> | null>(
    null
  );
  const [edgeMenu, setEdgeMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const canRealign = isInteractive && hasRealignableGraph;
  const handleRealign = async () => {
    if (!canRealign || !(await realign())) return;
    setIsRealignOpen(false);
    requestAnimationFrame(() => void flow.current?.fitView({ padding: 0.15 }));
  };
  const handleExport = () => {
    if (!routine) return;

    const graph = {
      version: 1,
      routine: {
        id: routine.id,
        title: routine.title,
      },
      nodes: nodes.map(node => ({
        id: node.id,
        position: node.position,
        data: {
          title: node.data.title,
          kind: node.data.kind,
          payload: node.data.payload,
        },
      })),
      edges: edges.map(edge => {
        const edgeData = edge.data as
          | { description?: string; progress?: number }
          | undefined;
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: {
            description: edgeData?.description ?? "",
            progress: edgeData?.progress ?? 0,
          },
        };
      }),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName =
      routine.title.trim().replace(/[^\p{L}\p{N}._-]+/gu, "-") || "routine";
    link.href = url;
    link.download = `${fileName}-dependency-graph.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("workspace.notifications.exported"));
  };

  const openCreateRoutineTaskDialog = () => {
    if (!routine) return;
    const station = stationRoutineManager.getStationById(routine.stationId);
    if (!station) return;

    modalManager.open("CreateRoutineTaskDialog", {
      routineId: routine.id,
      expectedDefinitionVersion: definitionVersion,
      routineTitle: routine.title,
      stationName: station.name,
      onCreated: async () => reload(),
    });
  };

  const station = routine
    ? stationRoutineManager.getStationById(routine.stationId)
    : undefined;
  const storageStatus = isSaving
    ? t("workspace.fields.saving")
    : isDirty
      ? t("workspace.fields.localDraft")
      : invalidMutationCount > 0
        ? `${t("workspace.fields.validationError")} (${invalidMutationCount})`
        : pendingSyncCount > 0
          ? `${t("workspace.fields.pendingSync")} (${pendingSyncCount})`
          : t("workspace.fields.saved");
  const routineTaskStatusCounts = Object.values(RoutineTaskRecordStatus)
    .map(status => ({
      status,
      count:
        routine?.routineTasks.filter(
          routineTask => routineTask.executionStatus === status
        ).length ?? 0,
    }))
    .filter(
      statusCount =>
        statusCount.count > 0 &&
        statusCount.status !== RoutineTaskRecordStatus.Running
    );
  const activeRoutineTaskCount =
    routine?.routineTasks.filter(
      routineTask =>
        routineTask.executionStatus === RoutineTaskRecordStatus.Running
    ).length ?? 0;

  if (isLoading) return <LoadingCover />;

  if (!routine) {
    return (
      <main className="flex h-full min-h-0 flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          {t("workspace.scope.noRoutines")}
        </p>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-[var(--app-toolbar-height)] w-full shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-inset/75 px-3 py-1.5 backdrop-blur-md">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <DropdownMenu
            open={isRoutineMenuOpen}
            onOpenChange={setIsRoutineMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 max-w-full gap-2 border-none px-2 text-xl font-semibold select-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <TruncatedText width="240px">{routine.title}</TruncatedText>
                <ChevronDownIcon
                  className={`transition ${isRoutineMenuOpen ? "-rotate-180" : ""}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              <DropdownMenuLabel className="flex items-center justify-between gap-6 font-normal text-muted-foreground">
                <span>{t("workspace.fields.nodeCount")}</span>
                <span className="text-foreground">{nodes.length}</span>
              </DropdownMenuLabel>
              <DropdownMenuLabel className="flex items-center justify-between gap-6 font-normal text-muted-foreground">
                <span>{t("workspace.fields.edgeCount")}</span>
                <span className="text-foreground">{edges.length}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center justify-between gap-6 font-normal text-muted-foreground">
                <span>{t("workspace.fields.storage")}</span>
                <span className="text-foreground">{storageStatus}</span>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <RoutineTaskDependencyGraphToolbar
          canRealign={canRealign}
          onRealign={() => setIsRealignOpen(true)}
          isAddMenuOpen={isAddMenuOpen}
          isRetryingSync={isRetryingSync}
          isSaving={isSaving}
          pendingSyncCount={pendingSyncCount}
          onAddMenuOpenChange={setIsAddMenuOpen}
          onOpenCreateRoutineTaskDialog={openCreateRoutineTaskDialog}
          canAddStartingNode={canAddStartingNode}
          onAddStartingNode={() => void createStartingNode()}
          onRetryPendingSync={() => void retryPendingSync()}
          onExport={handleExport}
        />
      </header>
      <Dialog
        open={isRealignOpen}
        onOpenChange={open => {
          if (!isRealigning) setIsRealignOpen(open);
        }}
      >
        <DialogContent className="rounded-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("workspace.graph.realignTitle")}</DialogTitle>
            <DialogDescription>
              {t("workspace.graph.realignDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isRealigning}
              onClick={() => setIsRealignOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              disabled={!canRealign || isRealigning}
              onClick={() => void handleRealign()}
            >
              {isRealigning && <Spinner />}
              {t("workspace.graph.realign")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {station && (
        <div className="flex h-[calc(var(--app-navigation-height)-var(--app-toolbar-height))] w-full shrink-0 items-center gap-3 overflow-x-auto whitespace-nowrap border-b border-sidebar-border bg-inset px-4 text-sm [&>span]:shrink-0">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-secondary-foreground/80">
            <span className="max-w-64 truncate">{station.name}</span>
          </span>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
          <span className="text-muted-foreground">
            {routine.phase ? t(routinePhaseTKeys[routine.phase]) : "—"}
          </span>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <RoutineTaskStatusDot status={RoutineTaskRecordStatus.Running} />
            <span>
              {t(routineTaskRecordStatusTKeys[RoutineTaskRecordStatus.Running])}
              : {activeRoutineTaskCount}
            </span>
          </span>
          {routineTaskStatusCounts.map(({ status, count }) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 text-muted-foreground"
            >
              <RoutineTaskStatusDot status={status} />
              <span>
                {t(routineTaskRecordStatusTKeys[status])}: {count}
              </span>
            </span>
          ))}
        </div>
      )}

      <section className="routine-task-dependency-graph relative min-h-0 flex-1">
        {selectedDependency && (
          <RoutineTaskDependencyInspector
            dependency={selectedDependency}
            description={dependencyDescription}
            isSaving={isUpdatingDependency}
            progress={dependencyProgress}
            onDescriptionChange={setDependencyDescription}
            onProgressChange={setDependencyProgress}
            onSave={() => void updateDependency()}
          />
        )}
        <RoutineTaskDependencyGraphCanvas
          isInteractive={isInteractive}
          onInteractiveChange={setIsInteractive}
          onInit={instance => {
            flow.current = instance;
          }}
          colorMode={themeManager.currentTheme.isDark ? "dark" : "light"}
          edges={edges}
          isMiniMapVisible={isMiniMapVisible}
          nodes={nodes}
          onConnect={connectDependency}
          onEdgeClick={(event, edge) => {
            const bounds = event.currentTarget
              .closest("section")
              ?.getBoundingClientRect();
            if (!bounds) return;
            setEdgeMenu({
              id: edge.id,
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            });
          }}
          onEdgesChange={changeEdges}
          onMiniMapVisibilityChange={setIsMiniMapVisible}
          onNodesChange={changeNodes}
          onPaneClick={() => {
            setSelectedEdgeId(null);
            setEdgeMenu(null);
          }}
        />
        <DropdownMenu
          open={edgeMenu !== null}
          onOpenChange={open => {
            if (!open) setEdgeMenu(null);
          }}
        >
          {/* SVG edge clicks are anchored outside the zoomed viewport. */}
          <DropdownMenuTrigger
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none absolute size-px opacity-0"
            style={{ left: edgeMenu?.x ?? 0, top: edgeMenu?.y ?? 0 }}
          />
          <DropdownMenuContent
            align="start"
            onClick={event => event.stopPropagation()}
            onCloseAutoFocus={event => event.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={() => {
                if (edgeMenu) setSelectedEdgeId(edgeMenu.id);
              }}
            >
              <SquarePen />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (!edgeMenu) return;
                if (selectedEdgeId === edgeMenu.id) setSelectedEdgeId(null);
                void changeEdges([{ type: "remove", id: edgeMenu.id }]);
              }}
            >
              <Trash2 />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </main>
  );
};

export default RoutineTaskDependencyGraphEditor;
