import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialImageViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialImageViewerContent = ({
  meta,
  materialContentType,
}: MaterialImageViewerContentProps) => {
  const { t } = useTranslation();
  const [isImageAvailable, setIsImageAvailable] = useState(true);
  const contentURL = meta.localContentURL ?? meta.downloadURL;

  useEffect(() => {
    setIsImageAvailable(true);
  }, [contentURL]);

  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {contentURL && isImageAvailable ? (
        <img
          src={contentURL}
          alt={meta.name}
          className="max-h-[70vh] w-auto"
          onError={() => setIsImageAvailable(false)}
        />
      ) : (
        <div className="text-muted-foreground text-sm">
          {t("workspace.viewer.noFile")}
        </div>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialImageViewerContent;
