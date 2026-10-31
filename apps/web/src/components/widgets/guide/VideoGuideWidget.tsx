import workspaceOverviewVideo from "@assets/document/videos/workspace-overview.mp4";
import workspaceOverviewPoster from "@assets/document/videos/workspace-overview.png";
import { useTranslation } from "@shared/i18n/useTranslation";
import { cn } from "@shared/lib/className/cn";
import type { WidgetProps } from "@widgets/widget";

const VideoGuideWidget = ({ className, style, data }: WidgetProps) => {
  const { t } = useTranslation();
  const videoURL =
    typeof data?.videoURL === "string" && data.videoURL.trim()
      ? data.videoURL
      : workspaceOverviewVideo;

  return (
    <div
      className={cn(
        "h-full min-h-0 w-full min-w-0 overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
      style={style}
    >
      <video
        aria-label={t("workspace.widgets.videoGuideTitle")}
        className="h-full w-full object-contain"
        controls
        playsInline
        preload="none"
        poster={
          videoURL === workspaceOverviewVideo
            ? workspaceOverviewPoster
            : undefined
        }
        src={videoURL}
      />
    </div>
  );
};

export default VideoGuideWidget;
