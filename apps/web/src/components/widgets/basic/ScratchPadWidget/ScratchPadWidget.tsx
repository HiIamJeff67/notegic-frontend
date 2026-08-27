// src/components/widgets/basic/ScratchPadWidget/ScratchPadWidget.tsx

import { getDefaultScratchPadData } from "@widgets/basic/ScratchPadWidget/data/scratchPadData";
import { getDefaultScratchPadSetting } from "@widgets/basic/ScratchPadWidget/setting/scratchPadSetting";
import DOMPurify from "dompurify";
import { CheckIcon } from "lucide-react";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { WidgetProps } from "@/components/widgets/widget";
import { useAnyTypeState } from "@/hooks/useAnyTypeState";
import EditScratchPadWidgetDialog from "./EditScratchPadWidgetDialog";

const ScratchPadWidget = ({
  className,
  style,
  isWidgetEditing,
  onIsWidgetEditingChange,
  setting: rawSetting,
  setSetting: setRawSetting,
  data: rawData,
  setData: setRawData,
  sync,
}: WidgetProps) => {
  const { t } = useTranslation();
  const [setting, setSetting] = useAnyTypeState(
    [rawSetting, setRawSetting],
    getDefaultScratchPadSetting()
  );
  const [data, setData] = useAnyTypeState(
    [rawData, setRawData],
    getDefaultScratchPadData()
  );

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const renderMarkdown = (text: string) => {
    const rawHtml = marked.parse(text) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return { __html: cleanHtml };
  };

  // make sure the tab button won't cause an on blur event in the text area
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const currentValue = data.content ?? "";
      const newValue =
        currentValue.substring(0, start) + "    " + currentValue.substring(end);

      setData(prev => ({ ...prev, content: newValue }));

      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
    setHasChanged(true);
  };

  return (
    <div
      ref={containerRef}
      className={`
        w-full h-full p-4 overflow-y-auto cursor-text
        bg-background border border-foreground/10 rounded-lg
        relative
        ${className}
      `}
      style={style}
      onClick={() => setIsEditing(true)}
      onPointerDown={e => {
        if (isEditing) e.stopPropagation();
      }}
    >
      <EditScratchPadWidgetDialog
        open={isWidgetEditing}
        onOpenChange={onIsWidgetEditingChange}
        setting={setting}
        setSetting={setSetting}
      />

      {!isEditing && data.content.trim() === "" && (
        <div
          className="
            absolute 
            text-muted-foreground font-mono leading-relaxed 
            transition-opacity
          "
          style={{ fontSize: setting.fontSize }}
        >
          {t("workspace.widgets.clickToEdit")}
        </div>
      )}

      {isEditing ? (
        <div className="w-full h-full flex flex-col text-muted-foreground rounded-md">
          <textarea // use textarea instead of the Textarea component from ShadCN to avoid rendering the border
            ref={textareaRef}
            value={data.content ?? ""}
            onChange={e => {
              setData(prev => ({ ...prev, content: e.target.value }));
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            className="w-full flex-1 bg-transparent resize-none outline-none text-foreground font-mono leading-relaxed whitespace-pre-wrap"
            style={{ fontSize: setting.fontSize }}
            placeholder={t("workspace.widgets.memoPlaceholder")}
          />

          {hasChanged && (
            <div className="w-full flex justify-end shrink-0 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex justify-center items-center hover:text-foreground rounded-md transition"
                onMouseDown={e => {
                  e.preventDefault();
                  sync();
                  setHasChanged(false);
                  setIsEditing(false);
                }}
                onClick={e => {
                  e.preventDefault();
                  sync();
                  setHasChanged(false);
                  setIsEditing(false);
                }}
              >
                <CheckIcon className="mr-1 shrink-0" size={16} />
                <span className="lg:text-sm sm:text-xs">
                  {t("workspace.widgets.saveChanges")}
                </span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="
            w-full h-full max-w-none break-words overflow-y-auto
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 
            [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ul_ul]:mb-0 
            [&_ul_ol]:mb-0 
            [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4 
            [&_ol_ol]:mb-0 
            [&_ol_ul]:mb-0 
            [&_p]:mb-2 
            [&_blockquote]:border-l-4 [&_blockquote]:border-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic 
            [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md 
            [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm
          "
          style={{ fontSize: setting.fontSize }}
          dangerouslySetInnerHTML={renderMarkdown(data.content ?? "")}
        />
      )}
    </div>
  );
};

export default ScratchPadWidget;
