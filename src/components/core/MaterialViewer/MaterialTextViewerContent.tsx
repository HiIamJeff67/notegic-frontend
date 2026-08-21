import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialMeta } from "@/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialTextViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialTextViewerContent = ({
  meta,
  materialContentType,
}: MaterialTextViewerContentProps) => {
  const { t } = useTranslation();
  const [text, setText] = useState<string>("");
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);
  const [isTextAvailable, setIsTextAvailable] = useState<boolean>(true);
  const contentURL = meta.localContentURL ?? meta.downloadURL;

  useEffect(() => {
    if (!contentURL) return;

    let isCancelled = false;

    setIsLoadingText(true);
    setIsTextAvailable(true);
    setText("");

    void (async () => {
      try {
        const response = await fetch(contentURL);
        if (!response.ok) {
          setIsTextAvailable(false);
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
          setIsLoadingText(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [contentURL, materialContentType]);

  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {isLoadingText && (
        <div className="text-muted-foreground text-sm">
          {t("workspace.viewer.loadingFile")}
        </div>
      )}
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
