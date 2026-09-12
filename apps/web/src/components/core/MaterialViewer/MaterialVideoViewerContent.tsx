import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialVideoViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialVideoViewerContent = ({
  meta,
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
          {t("workspace.viewer.noFile")}
        </div>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialVideoViewerContent;
