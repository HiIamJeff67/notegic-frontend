import {
  Background,
  Controls,
  type Edge,
  type EdgeMouseHandler,
  MiniMap,
  type NodeMouseHandler,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  Panel,
  ReactFlow,
  useStore,
} from "@xyflow/react";
import { Map as MapIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useScreen } from "@/hooks";
import RoutineTaskGraphNode, {
  type RoutineTaskGraphNode as RoutineTaskGraphNodeType,
} from "./RoutineTaskGraphNode";

interface RoutineTaskDependencyGraphCanvasProps {
  colorMode: "dark" | "light";
  edges: Edge[];
  isMiniMapVisible: boolean;
  nodes: RoutineTaskGraphNodeType[];
  onConnect: OnConnect;
  onEdgeClick: EdgeMouseHandler;
  onEdgesChange: OnEdgesChange<Edge>;
  onMiniMapVisibilityChange: (visible: boolean) => void;
  onNodeClick: NodeMouseHandler<RoutineTaskGraphNodeType>;
  onNodesChange: OnNodesChange<RoutineTaskGraphNodeType>;
  onPaneClick: () => void;
}

interface RoutineTaskDependencyMiniMapProps {
  fallbackAspectRatio: number;
  onMiniMapVisibilityChange: (visible: boolean) => void;
}

const nodeTypes = { routineTask: RoutineTaskGraphNode };

const RoutineTaskDependencyMiniMap = ({
  fallbackAspectRatio,
  onMiniMapVisibilityChange,
}: RoutineTaskDependencyMiniMapProps) => {
  const { t } = useTranslation();
  const flowWidth = useStore(state => state.width);
  const flowHeight = useStore(state => state.height);
  const flowAspectRatio =
    flowWidth > 0 && flowHeight > 0
      ? flowWidth / flowHeight
      : fallbackAspectRatio;
  const maxMiniMapWidth = 280;
  const maxMiniMapHeight = 180;
  const miniMapWidth = Math.min(
    maxMiniMapWidth,
    maxMiniMapHeight * flowAspectRatio
  );
  const miniMapHeight = miniMapWidth / flowAspectRatio;

  return (
    <Panel position="bottom-right">
      <div className="relative">
        <MiniMap
          pannable
          zoomable
          bgColor="var(--inset)"
          maskColor="var(--inset)"
          offsetScale={0}
          className="!static !m-0"
          style={{
            width: miniMapWidth,
            height: miniMapHeight,
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1 left-1 z-10 size-6 rounded-sm p-0 text-muted-foreground !shadow-none !bg-transparent hover:!bg-transparent hover:!text-foreground focus-visible:!bg-transparent focus-visible:!text-foreground [&_svg]:size-3.5"
          onClick={() => onMiniMapVisibilityChange(false)}
          aria-label={t("common.close")}
          title={t("common.close")}
        >
          <X />
        </Button>
      </div>
    </Panel>
  );
};

const RoutineTaskDependencyGraphCanvas = ({
  colorMode,
  edges,
  isMiniMapVisible,
  nodes,
  onConnect,
  onEdgeClick,
  onEdgesChange,
  onMiniMapVisibilityChange,
  onNodeClick,
  onNodesChange,
  onPaneClick,
}: RoutineTaskDependencyGraphCanvasProps) => {
  const { t } = useTranslation();
  const screenManager = useScreen();
  const fallbackAspectRatio =
    screenManager.width > 0 && screenManager.height > 0
      ? screenManager.width / screenManager.height
      : 16 / 9;

  return (
    <ReactFlow<RoutineTaskGraphNodeType, Edge>
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      onPaneClick={onPaneClick}
      onNodeClick={onNodeClick}
      fitView
      colorMode={colorMode}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
      {isMiniMapVisible && (
        <RoutineTaskDependencyMiniMap
          fallbackAspectRatio={fallbackAspectRatio}
          onMiniMapVisibilityChange={onMiniMapVisibilityChange}
        />
      )}
      {!isMiniMapVisible && (
        <Panel position="bottom-right">
          <div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-md border border-foreground/30 bg-inset text-muted-foreground !shadow-none hover:bg-inset hover:text-foreground focus-visible:bg-inset focus-visible:text-foreground [&_svg]:size-3.5"
              onClick={() => onMiniMapVisibilityChange(true)}
              aria-label={t("workspace.viewer.overview")}
              title={t("workspace.viewer.overview")}
            >
              <MapIcon />
            </Button>
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
};

export default RoutineTaskDependencyGraphCanvas;
