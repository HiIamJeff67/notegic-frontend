import { MaterialContentType } from "@shared/api/interfaces/enums";
import { MaterialMeta } from "@/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialVideoViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialVideoViewerContent = ({
  meta,
  materialContentType,
}: MaterialVideoViewerContentProps) => {
  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {(meta.localContentURL ?? meta.downloadURL) && (
        <video
          src={meta.localContentURL ?? meta.downloadURL ?? undefined}
          controls
          className="max-h-[70vh] w-full"
        />
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialVideoViewerContent;
