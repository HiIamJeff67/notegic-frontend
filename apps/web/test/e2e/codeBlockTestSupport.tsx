import type { PartialBlock } from "@blocknote/core";
import { blocksToYDoc } from "@blocknote/core/yjs";
import { SideMenuController } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/style.css";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import { DefaultStandardTheme } from "@shared/constants";
import {
  NotegicBlockPackEditor,
  notegicBlockPackSchema,
} from "@shared/lib/blockpack";
import { NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME } from "@shared/lib/blockpack/blockPackYjsCoordinator";
import { createRoot, type Root } from "react-dom/client";
import * as Y from "yjs";
import BlockSideMenu from "@/components/core/BlockPackEditor/BlockSideMenu";
import CreateBlockPackPayloadTemplateEditor from "@/components/core/RoutineOverviewer/RoutineTaskPayloadEditors/CreateBlockPackPayloadEditor/CreateBlockPackPayloadTemplateEditor";
import { ThemeContext } from "@/providers/ThemeProvider";
import "@/global/styles/block-editor.css";

export const editors: Record<
  string,
  ReturnType<typeof NotegicBlockPackEditor.create>
> = {};
export let document: Y.Doc;
let root: Root | undefined;
let container: HTMLDivElement | undefined;

const content: PartialBlock<any, any, any>[] = [
  {
    id: "code",
    type: "codeBlock",
    props: { language: "javascript" },
    content: 'const greeting = "hello";\nconsole.log(greeting);',
  },
  {
    id: "alias",
    type: "codeBlock",
    props: { language: "ts" },
    content: "const count: number = 42;",
  },
  {
    id: "unknown",
    type: "codeBlock",
    props: { language: "legacy-language" },
    content: "<script>keep this code</script>",
  },
  {
    id: "empty-language",
    type: "codeBlock",
    props: { language: "" },
    content: "untyped code",
  },
  { id: "plain", type: "codeBlock", content: "plain code" },
];

export function mountCodeEditors(
  saved?: Record<string, PartialBlock<any, any, any>[]>
) {
  root?.unmount();
  document?.destroy();
  container?.remove();
  container = window.document.createElement("div");
  container.id = "code-editor-test-root";
  container.className =
    "fixed inset-0 z-[1000] overflow-auto bg-canvas p-4 text-foreground";
  window.document.body.append(container);
  editors.payload = NotegicBlockPackEditor.create({
    schema: notegicBlockPackSchema,
    initialContent: saved?.payload ?? content,
  });
  document = blocksToYDoc(
    editors.payload,
    saved?.blockpack ?? content,
    NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME
  );
  editors.blockpack = NotegicBlockPackEditor.create({
    schema: notegicBlockPackSchema,
    collaboration: {
      fragment: document.getXmlFragment(NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME),
      user: { name: "Fixture", color: "#4477aa" },
    },
  });
  root = createRoot(container);
  setCodeTheme(window.document.documentElement.classList.contains("dark"));
}

export function setCodeTheme(isDark: boolean) {
  window.document.documentElement.classList.toggle("dark", isDark);
  window.document.documentElement.classList.toggle("light", !isDark);
  root!.render(
    <ThemeContext.Provider
      value={{
        currentTheme: { ...DefaultStandardTheme, isDark },
        switchCurrentTheme: async () => false,
        availableThemes: [],
        loadingThemes: new Set(),
        addThemeFromStore: () => {},
        removeThemeFromStore: () => {},
        isThemeLoading: () => false,
      }}
    >
      <section data-editor="blockpack">
        <BlockNoteView
          editor={editors.blockpack}
          theme={isDark ? "dark" : "light"}
          sideMenu={false}
          className="notegic-block-editor [&_.bn-editor]:!pl-16"
        >
          <SideMenuController sideMenu={() => <BlockSideMenu />} />
        </BlockNoteView>
      </section>
      <section data-editor="payload">
        <CreateBlockPackPayloadTemplateEditor
          editor={editors.payload}
          portalElement={container!}
          purpose={RoutineTaskPurpose.CreateBlockPack}
          payloadPreview="{}"
          patternBlockIds={new Set()}
          onAddPatternBlock={() => {}}
          onRemovePatternBlock={() => {}}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      </section>
    </ThemeContext.Provider>
  );
}

export { yDocToBlocks } from "@blocknote/core/yjs";
export {
  codeLanguages,
  getCodeHighlighter,
  loadHighlighter,
} from "@shared/lib/code/codeHighlighter";
export { getSuggestionItems } from "@/components/core/BlockPackEditor/SuggestionMenu";
export { NOTEGIC_BLOCKNOTE_YJS_FRAGMENT_NAME, Y };
