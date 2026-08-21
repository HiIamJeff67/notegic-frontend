import { MaterialContentType } from "@shared/api/interfaces/enums";
import {
  loadMaterialAttachment,
  saveMaterialAttachment,
} from "@shared/api/local/material-attachment.cache";
import { Suspense, useEffect, useMemo, useReducer, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useLocalPreferences, useShelfItem } from "@/hooks";
import {
  MaterialMeta,
  materialMetaReducer,
} from "@/reducers/materialMeta.reducer";
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
  const { preferences } = useLocalPreferences();

  const [meta, dispatchMeta] = useReducer(materialMetaReducer, materialMeta);
  const [localContentURL, setLocalContentURL] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let objectURL: string | null = null;

    if (!preferences.cacheAttachments || !meta.downloadURL) {
      setLocalContentURL(null);
      return;
    }

    void (async () => {
      try {
        const cachedContent = await loadMaterialAttachment(
          meta.id,
          meta.updatedAt
        );
        let content = cachedContent;
        if (!content) {
          const response = await fetch(meta.downloadURL as string);
          if (!response.ok) {
            throw new Error("Failed to fetch material content.");
          }
          content = await response.blob();
          await saveMaterialAttachment(meta.id, meta.updatedAt, content);
        }

        objectURL = URL.createObjectURL(content);
        if (!isActive) {
          URL.revokeObjectURL(objectURL);
          return;
        }
        setLocalContentURL(objectURL);
      } catch {
        if (isActive) setLocalContentURL(null);
      }
    })();

    return () => {
      isActive = false;
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [meta.downloadURL, meta.id, meta.updatedAt, preferences.cacheAttachments]);

  const viewerMeta = useMemo(
    () => ({ ...meta, localContentURL }),
    [localContentURL, meta]
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
