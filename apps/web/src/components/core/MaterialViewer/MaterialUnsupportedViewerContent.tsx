import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useTranslation } from "@shared/i18n/useTranslation";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import MaterialViewerFrame, {
  type MaterialFileState,
} from "./MaterialViewerFrame";

interface MaterialUnsupportedViewerContentProps {
  meta: MaterialMeta;
  file: MaterialFileState;
  materialContentType: MaterialContentType | undefined;
}

const MaterialUnsupportedViewerContent = ({
  meta,
  file,
  materialContentType,
}: MaterialUnsupportedViewerContentProps) => {
  const { t } = useTranslation();
  return (
    <MaterialViewerFrame
      file={file}
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
