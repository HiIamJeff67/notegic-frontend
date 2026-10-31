import type { BlockNoteEditor } from "@blocknote/core";
import { SideMenuController } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { useTranslation } from "@shared/i18n/useTranslation";
import BlockSideMenu from "@/components/core/BlockPackEditor/BlockSideMenu";
import {
  type PatternBlock,
  PatternToggleButton,
} from "@/components/core/BlockPackEditor/PatternToggleButton";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
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
  const { currentTheme } = useTheme();
  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-card md:max-h-[72vh]">
      <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-4 pl-7">
        <section className="min-w-0">
          <BlockNoteView
            editor={editor}
            theme={currentTheme.isDark ? "dark" : "light"}
            sideMenu={false}
            portalElements={{ default: portalElement }}
            className="notegic-block-editor caret-muted-foreground [&_.bn-editor]:px-4 [&_.bn-editor]:!pl-[88px]"
          >
            <SideMenuController
              sideMenu={() => (
                <BlockSideMenu>
                  <PatternToggleButton
                    patternBlockIds={patternBlockIds}
                    onAddPatternBlock={onAddPatternBlock}
                    onRemovePatternBlock={onRemovePatternBlock}
                  />
                </BlockSideMenu>
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
