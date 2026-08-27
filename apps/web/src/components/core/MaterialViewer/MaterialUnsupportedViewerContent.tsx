import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useTranslation } from "react-i18next";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialUnsupportedViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType | undefined;
}

const MaterialUnsupportedViewerContent = ({
  meta,
  materialContentType,
}: MaterialUnsupportedViewerContentProps) => {
  const { t } = useTranslation();
  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {(meta.localContentURL ?? meta.downloadURL) && (
        <a
          href={meta.localContentURL ?? meta.downloadURL ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="underline text-primary"
        >
          {t("workspace.viewer.openFileNewTab")}
        </a>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialUnsupportedViewerContent;
