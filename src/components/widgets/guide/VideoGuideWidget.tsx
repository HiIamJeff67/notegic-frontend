import { WidgetProps } from "@widgets/widget";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";

const VideoGuideWidget = ({ className, style, data }: WidgetProps) => {
  const { t } = useTranslation();
  const videoURL = typeof data?.videoURL === "string" ? data.videoURL : "";

  return (
    <div
      className={`h-full w-full overflow-hidden rounded-lg border border-border bg-card ${className ?? ""}`}
      style={style}
    >
      {videoURL ? (
        <video
          className="h-full w-full object-cover"
          controls
          preload="metadata"
          src={videoURL}
        />
      ) : (
        <div className="flex h-full min-h-32 flex-col items-center justify-center gap-3 p-5 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Play className="ml-0.5 size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t("workspace.widgets.videoGuideTitle")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("workspace.widgets.videoGuidePlaceholder")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGuideWidget;
