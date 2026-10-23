import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useTranslation } from "@shared/i18n/useTranslation";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { useEffect, useState } from "react";
import MaterialViewerFrame, {
  type MaterialFileState,
} from "./MaterialViewerFrame";

interface MaterialAudioViewerContentProps {
  meta: MaterialMeta;
  file: MaterialFileState;
  materialContentType: MaterialContentType;
}

const MaterialAudioViewerContent = ({
  meta,
  file,
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
      file={file}
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
          {t("workspace.viewer.failedFilePreview")}
        </div>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialAudioViewerContent;
