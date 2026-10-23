import { MaterialContentType } from "@shared/api/interfaces/enums";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { Suspense, useMemo } from "react";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { useShelfItem } from "@/hooks";
import MaterialAudioViewerContent from "./MaterialAudioViewerContent";
import MaterialImageViewerContent from "./MaterialImageViewerContent";
import MaterialPDFViewerContent from "./MaterialPDFViewerContent";
import MaterialTextViewerContent from "./MaterialTextViewerContent";
import MaterialUnsupportedViewerContent from "./MaterialUnsupportedViewerContent";
import MaterialVideoViewerContent from "./MaterialVideoViewerContent";
import type { MaterialFileState } from "./MaterialViewerFrame";

interface MaterialViewerProps {
  materialMeta: MaterialMeta;
  file: MaterialFileState;
}

const MaterialViewer = ({ materialMeta, file }: MaterialViewerProps) => {
  const shelfItemManager = useShelfItem();
  const viewerMeta = {
    ...materialMeta,
    name: shelfItemManager.isItemNodeEditing(materialMeta.id)
      ? shelfItemManager.editItemName
      : materialMeta.name,
  };

  const materialContentType = useMemo(() => {
    const mediaType = materialMeta.contentType.trim().toLowerCase();
    return Object.values(MaterialContentType).find(
      contentType => contentType === mediaType
    );
  }, [materialMeta.contentType]);

  return (
    <Suspense fallback={<LoadingCover />}>
      <div className="w-full h-full min-w-0 min-h-0 overflow-hidden">
        {(() => {
          switch (materialContentType) {
            case MaterialContentType.PNG:
            case MaterialContentType.JPG:
            case MaterialContentType.JPEG:
            case MaterialContentType.GIF:
            case MaterialContentType.SVG:
            case MaterialContentType.WebP:
              return (
                <MaterialImageViewerContent
                  file={file}
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            case MaterialContentType.MP4:
            case MaterialContentType.WebM:
              return (
                <MaterialVideoViewerContent
                  file={file}
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            case MaterialContentType.MP3:
              return (
                <MaterialAudioViewerContent
                  file={file}
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            case MaterialContentType.PDF:
              return <MaterialPDFViewerContent meta={viewerMeta} file={file} />;
            case MaterialContentType.JSON:
            case MaterialContentType.Markdown:
            case MaterialContentType.PlainText:
            case MaterialContentType.HTML:
              return (
                <MaterialTextViewerContent
                  file={file}
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            default:
              return (
                <MaterialUnsupportedViewerContent
                  file={file}
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
          }
        })()}
      </div>
    </Suspense>
  );
};

export default MaterialViewer;
