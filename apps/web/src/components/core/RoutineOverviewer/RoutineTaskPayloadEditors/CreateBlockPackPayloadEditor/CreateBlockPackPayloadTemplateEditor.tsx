import type { BlockNoteEditor } from "@blocknote/core";
import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  DragHandleButton,
  SideMenu,
  SideMenuController,
  useExtensionState,
} from "@blocknote/react";
import {
  BlockNoteView,
  components as blockNoteShadcnComponents,
} from "@blocknote/shadcn";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { Form, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import type { PatternBlock } from "./CreateBlockPackPayloadEditor";
import "@/global/styles/block-editor.css";

interface CreateBlockPackPayloadTemplateEditorProps {
  editor: BlockNoteEditor<any, any, any>;
  portalElement: HTMLElement;
  purpose: RoutineTaskPurpose;
  payloadPreview: string;
  patternBlockIds: Set<string>;
  onAddPatternBlock: (patternBlock: PatternBlock) => void;
  onRemovePatternBlock: (blockId: string) => void;
  onClose: () => void;
  onConfirm: (payload: string) => void;
  isSaveDisabled?: boolean;
}

const PatternToggleButton = ({
  patternBlockIds,
  onAddPatternBlock,
  onRemovePatternBlock,
  t,
}: Pick<
  CreateBlockPackPayloadTemplateEditorProps,
  "patternBlockIds" | "onAddPatternBlock" | "onRemovePatternBlock"
> & { t: (key: string) => string }) => {
  const block = useExtensionState(SideMenuExtension, {
    selector: state => state?.block,
  });

  if (!block) return null;

  const isSelected = patternBlockIds.has(block.id);
  const label = isSelected
    ? t("workspace.payloadEditor.removeFromPatternTable")
    : t("workspace.payloadEditor.addToPatternTable");
  const icon = isSelected ? (
    <XIcon className="size-3.5" />
  ) : (
    <Form className="size-3.5" />
  );
  const handleToggle = () => {
    if (isSelected) {
      onRemovePatternBlock(block.id);
      return;
    }

    onAddPatternBlock({
      id: block.id,
      type: block.type,
      props: block.props ?? {},
      label: Array.isArray(block.content)
        ? block.content
            .map((content: any) => {
              if (content.type === "text") return content.text;
              if (content.type === "link" && Array.isArray(content.content)) {
                return content.content
                  .map((linkContent: any) => linkContent.text ?? "")
                  .join("");
              }
              return "";
            })
            .join("")
            .trim()
        : "",
    });
  };

  return (
    <blockNoteShadcnComponents.SideMenu.Button
      className="bn-button"
      label={label}
      icon={icon}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        handleToggle();
      }}
    />
  );
};

const CreateBlockPackPayloadTemplateEditor = ({
  editor,
  portalElement,
  purpose,
  payloadPreview,
  patternBlockIds,
  onAddPatternBlock,
  onRemovePatternBlock,
  onClose,
  onConfirm,
  isSaveDisabled = false,
}: CreateBlockPackPayloadTemplateEditorProps) => {
  const { t } = useTranslation();
  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-card md:max-h-[72vh]">
      <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-4 pl-7">
        <section className="min-w-0">
          <BlockNoteView
            editor={editor}
            sideMenu={false}
            portalElements={{ default: portalElement }}
            className="notegic-block-editor caret-muted-foreground [&_.bn-editor]:px-4"
          >
            <SideMenuController
              sideMenu={sideMenuProps => (
                <SideMenu {...sideMenuProps}>
                  <PatternToggleButton
                    patternBlockIds={patternBlockIds}
                    onAddPatternBlock={onAddPatternBlock}
                    onRemovePatternBlock={onRemovePatternBlock}
                    t={t}
                  />
                  <DragHandleButton />
                </SideMenu>
              )}
            />
          </BlockNoteView>
        </section>
      </div>
      <DialogFooter className="min-h-10 border-t bg-secondary px-4 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaveDisabled}
          onClick={() => {
            onConfirm(payloadPreview);
            onClose();
          }}
        >
          {t("common.save")}
        </Button>
      </DialogFooter>
    </main>
  );
};

export default CreateBlockPackPayloadTemplateEditor;
