import { MaterialContentType } from "@shared/api/interfaces/enums";
import { MaterialMeta } from "@/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialImageViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialImageViewerContent = ({
  meta,
  materialContentType,
}: MaterialImageViewerContentProps) => {
  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {(meta.localContentURL ?? meta.downloadURL) && (
        <img
          src={meta.localContentURL ?? meta.downloadURL ?? undefined}
          alt={meta.name}
          className="max-h-[70vh] w-auto"
        />
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialImageViewerContent;
