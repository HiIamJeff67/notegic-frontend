import { createRoot } from "react-dom/client";
import VideoGuideWidget from "@/components/widgets/guide/VideoGuideWidget";

export const mountVideoGuideWidget = (
  data: Record<string, unknown> = { videoURL: "" }
) => {
  const container = document.createElement("main");
  container.id = "video-guide-widget-test-root";
  container.className = "fixed inset-0 z-50 bg-canvas p-4";
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    <VideoGuideWidget
      style={{ height: "min(400px, 80vh)" }}
      data={data}
      setting={{}}
      isWidgetEditing={false}
      onIsWidgetEditingChange={() => {}}
      setSetting={() => {}}
      setData={() => {}}
      sync={() => {}}
    />
  );
  return {
    unmount: () => {
      root.unmount();
      container.remove();
    },
  };
};
