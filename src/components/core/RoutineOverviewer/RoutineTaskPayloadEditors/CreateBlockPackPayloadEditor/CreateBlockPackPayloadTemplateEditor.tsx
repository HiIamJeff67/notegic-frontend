import type { BlockNoteEditor } from "@blocknote/core";
import { SideMenuExtension } from "@blocknote/core/extensions";
import {
  AddBlockButton,
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

interface CreateBlockPackPayloadTemplateEditorProps {
  editor: BlockNoteEditor<any, any, any>;
  originalBlockEditor: BlockNoteEditor<any, any, any>;
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
  return (
    <blockNoteShadcnComponents.SideMenu.Button
      className="bn-button size-7 min-w-0 p-1.5 text-muted-foreground"
      label={
        isSelected
          ? t("workspace.payloadEditor.removeFromPatternTable")
          : t("workspace.payloadEditor.addToPatternTable")
      }
      icon={
        isSelected ? <XIcon className="size-4" /> : <Form className="size-4" />
      }
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
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
                  if (
                    content.type === "link" &&
                    Array.isArray(content.content)
                  ) {
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
      }}
    />
  );
};

const CreateBlockPackPayloadTemplateEditor = ({
  editor,
  originalBlockEditor,
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
    <main className="flex max-h-[72vh] min-h-0 flex-col overflow-hidden bg-card">
      <div
        className={
          purpose === RoutineTaskPurpose.UpdateBlock
            ? "grid min-h-0 flex-1 grid-rows-[minmax(160px,0.8fr)_minmax(220px,1.2fr)] overflow-hidden"
            : "min-h-0 flex-1 overflow-y-auto overflow-x-visible py-6 pr-6 pl-16"
        }
      >
        {purpose === RoutineTaskPurpose.UpdateBlock && (
          <section className="min-h-0 overflow-y-auto border-b bg-secondary py-4 pr-6 pl-16">
            <div className="mb-2 text-muted-foreground text-xs">
              {t("workspace.payloadEditor.currentBlock")}
            </div>
            <BlockNoteView
              editor={originalBlockEditor}
              editable={false}
              sideMenu={false}
              className="caret-muted-foreground [&_.bn-editor]:px-8"
            />
          </section>
        )}
        <section
          className={
            purpose === RoutineTaskPurpose.UpdateBlock
              ? "min-h-0 overflow-y-auto overflow-x-visible py-4 pr-6 pl-16"
              : ""
          }
        >
          {purpose === RoutineTaskPurpose.UpdateBlock && (
            <div className="mb-2 text-muted-foreground text-xs">
              {t("workspace.payloadEditor.nextBlock")}
            </div>
          )}
          <BlockNoteView
            editor={editor}
            sideMenu={false}
            className="caret-muted-foreground [&_.bn-editor]:px-8 [&_.bn-side-menu_.bn-button]:size-7 [&_.bn-side-menu_.bn-button]:min-w-0 [&_.bn-side-menu_.bn-button]:p-1.5 [&_.bn-side-menu_.bn-button_svg]:size-4"
          >
            <SideMenuController
              sideMenu={sideMenuProps => (
                <SideMenu {...sideMenuProps}>
                  <AddBlockButton />
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
        <span className="mr-auto self-center text-xs text-muted-foreground">
          {t("workspace.payloadEditor.estimatedCost", {
            count: Math.ceil(new Blob([payloadPreview]).size / 1024),
          })}
        </span>
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
