import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialAudioViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialAudioViewerContent = ({
  meta,
  materialContentType,
}: MaterialAudioViewerContentProps) => {
  const { t } = useTranslation();
  const [isAudioAvailable, setIsAudioAvailable] = useState(true);
  const contentURL = meta.localContentURL ?? meta.downloadURL;

  useEffect(() => {
    setIsAudioAvailable(true);
  }, [contentURL]);

  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {contentURL && isAudioAvailable ? (
        <audio
          src={contentURL}
          controls
          className="w-full"
          onError={() => setIsAudioAvailable(false)}
        />
      ) : (
        <div className="text-muted-foreground text-sm">
          {t("workspace.viewer.noFile")}
        </div>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialAudioViewerContent;
