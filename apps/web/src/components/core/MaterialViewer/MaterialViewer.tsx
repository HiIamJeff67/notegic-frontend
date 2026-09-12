import { MaterialContentType } from "@shared/api/interfaces/enums";
import {
  MaterialMeta,
  materialMetaReducer,
} from "@shared/reducers/materialMeta.reducer";
import { Suspense, useEffect, useMemo, useReducer } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useShelfItem } from "@/hooks";
import MaterialAudioViewerContent from "./MaterialAudioViewerContent";
import MaterialImageViewerContent from "./MaterialImageViewerContent";
import MaterialPDFViewerContent from "./MaterialPDFViewerContent";
import MaterialTextViewerContent from "./MaterialTextViewerContent";
import MaterialUnsupportedViewerContent from "./MaterialUnsupportedViewerContent";
import MaterialVideoViewerContent from "./MaterialVideoViewerContent";

interface MaterialViewerProps {
  materialMeta: MaterialMeta;
}

const MaterialViewer = ({ materialMeta }: MaterialViewerProps) => {
  const shelfItemManager = useShelfItem();
  const [meta, dispatchMeta] = useReducer(materialMetaReducer, materialMeta);

  const viewerMeta = useMemo(
    () => ({ ...meta, localContentURL: null }),
    [meta]
  );

  const materialContentType = useMemo(() => {
    const normalizedContentType = meta.contentType.trim().toLowerCase();
    return Object.values(MaterialContentType).find(
      contentType => contentType === normalizedContentType
    );
  }, [meta.contentType]);

  useEffect(() => {
    if (shelfItemManager.isItemNodeEditing(meta.id)) {
      dispatchMeta({
        type: "setName",
        newName: shelfItemManager.editItemName,
      });
    }
  }, [shelfItemManager.editItemName]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <div className="w-full h-dvh min-w-0 min-h-0 overflow-hidden">
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
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            case MaterialContentType.MP4:
            case MaterialContentType.WebM:
              return (
                <MaterialVideoViewerContent
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            case MaterialContentType.MP3:
              return (
                <MaterialAudioViewerContent
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            case MaterialContentType.PDF:
              return <MaterialPDFViewerContent meta={viewerMeta} />;
            case MaterialContentType.JSON:
            case MaterialContentType.Markdown:
            case MaterialContentType.PlainText:
            case MaterialContentType.HTML:
              return (
                <MaterialTextViewerContent
                  meta={viewerMeta}
                  materialContentType={materialContentType}
                />
              );
            default:
              return (
                <MaterialUnsupportedViewerContent
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
