import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useTranslation } from "@shared/i18n/useTranslation";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { useEffect, useState } from "react";
import Image from "@/components/commons/Image/Image";
import MaterialViewerFrame, {
  type MaterialFileState,
} from "./MaterialViewerFrame";

interface MaterialImageViewerContentProps {
  meta: MaterialMeta;
  file: MaterialFileState;
  materialContentType: MaterialContentType;
}

const MaterialImageViewerContent = ({
  meta,
  file,
  materialContentType,
}: MaterialImageViewerContentProps) => {
  const { t } = useTranslation();
  const [isImageAvailable, setIsImageAvailable] = useState(true);
  const [loadedURL, setLoadedURL] = useState<string | null>(null);
  const contentURL = meta.localContentURL ?? meta.downloadURL;

  useEffect(() => {
    setIsImageAvailable(true);
  }, [contentURL]);

  return (
    <MaterialViewerFrame
      file={file}
      meta={meta}
      materialContentType={materialContentType}
      isContentLoading={
        Boolean(contentURL) && loadedURL !== contentURL && isImageAvailable
      }
      contentClassName="p-8 overflow-auto"
    >
      {contentURL && isImageAvailable ? (
        <Image
          src={contentURL}
          alt={meta.name}
          className="max-h-[70vh] w-auto"
          loading="eager"
          onLoadingStatusChange={status => {
            if (status === "loaded") setLoadedURL(contentURL);
            if (status === "error") setIsImageAvailable(false);
          }}
        />
      ) : (
        <div className="text-muted-foreground text-sm">
          {t("workspace.viewer.failedFilePreview")}
        </div>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialImageViewerContent;
