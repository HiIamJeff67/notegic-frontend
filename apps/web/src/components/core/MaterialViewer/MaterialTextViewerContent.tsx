import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useTranslation } from "@shared/i18n/useTranslation";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { useEffect, useState } from "react";
import MaterialViewerFrame, {
  type MaterialFileState,
} from "./MaterialViewerFrame";

interface MaterialTextViewerContentProps {
  meta: MaterialMeta;
  file: MaterialFileState;
  materialContentType: MaterialContentType;
}

const MaterialTextViewerContent = ({
  meta,
  file,
  materialContentType,
}: MaterialTextViewerContentProps) => {
  const { t } = useTranslation();
  const [text, setText] = useState<string>("");
  const [loadedURL, setLoadedURL] = useState<string | null>(null);
  const [isTextAvailable, setIsTextAvailable] = useState<boolean>(true);
  const contentURL = meta.localContentURL ?? meta.downloadURL;
  const isLoadingText = Boolean(contentURL) && loadedURL !== contentURL;

  useEffect(() => {
    if (!contentURL) return;

    let isCancelled = false;

    setIsTextAvailable(true);
    setText("");

    void (async () => {
      try {
        const response = await fetch(contentURL);
        if (!response.ok) {
          if (!isCancelled) setIsTextAvailable(false);
          return;
        }

        const rawText = await response.text();
        if (isCancelled) return;

        if (materialContentType === MaterialContentType.JSON) {
          try {
            setText(JSON.stringify(JSON.parse(rawText), null, 2));
          } catch {
            setText(rawText);
          }
        } else {
          setText(rawText);
        }
      } catch {
        if (!isCancelled) {
          setIsTextAvailable(false);
        }
      } finally {
        if (!isCancelled) {
          setLoadedURL(contentURL);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [contentURL, materialContentType]);

  return (
    <MaterialViewerFrame
      file={file}
      meta={meta}
      materialContentType={materialContentType}
      isContentLoading={isLoadingText}
      contentClassName="p-8 overflow-auto"
    >
      {!isLoadingText && !isTextAvailable && (
        <div className="text-muted-foreground text-sm">
          {t("workspace.viewer.failedTextPreview")}
        </div>
      )}
      {!isLoadingText && isTextAvailable && (
        <pre className="whitespace-pre-wrap break-all text-sm">{text}</pre>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialTextViewerContent;
