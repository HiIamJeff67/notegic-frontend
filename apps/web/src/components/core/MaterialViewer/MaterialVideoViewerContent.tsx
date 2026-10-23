import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useTranslation } from "@shared/i18n/useTranslation";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { useEffect, useState } from "react";
import MaterialViewerFrame, {
  type MaterialFileState,
} from "./MaterialViewerFrame";

interface MaterialVideoViewerContentProps {
  meta: MaterialMeta;
  file: MaterialFileState;
  materialContentType: MaterialContentType;
}

const MaterialVideoViewerContent = ({
  meta,
  file,
  materialContentType,
}: MaterialVideoViewerContentProps) => {
  const { t } = useTranslation();
  const [isVideoAvailable, setIsVideoAvailable] = useState(true);
  const contentURL = meta.localContentURL ?? meta.downloadURL;

  useEffect(() => {
    setIsVideoAvailable(true);
  }, [contentURL]);

  return (
    <MaterialViewerFrame
      file={file}
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {contentURL && isVideoAvailable ? (
        <video
          src={contentURL}
          controls
          className="max-h-[70vh] w-full"
          onError={() => setIsVideoAvailable(false)}
        />
      ) : (
        <div className="text-muted-foreground text-sm">
          {t("workspace.viewer.failedFilePreview")}
        </div>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialVideoViewerContent;
