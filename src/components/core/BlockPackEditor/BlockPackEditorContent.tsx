import { PartialBlock } from "@blocknote/core";
import { SideMenuController } from "@blocknote/react";
import {
  convertBlocksToDOCX,
  convertBlocksToHTML,
  convertBlocksToJSON,
  convertBlocksToMarkdown,
  convertBlocksToPDF,
  convertBlocksToPlainText,
} from "@shared/util/convertBlocksToFiles";
import { useTranslation } from "react-i18next";
import DropFileZone from "@/components/commons/DropFileZone/DropFileZone";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
import BlockPackParticipantsDropdown from "@/components/core/BlockPackEditor/BlockPackParticipantsDropdown";
import BlockSideMenu from "@/components/core/BlockPackEditor/BlockSideMenu";
import ItemPath from "@/components/paths/ItemPath/ItemPath";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useShelfItem } from "@/hooks";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import { translateError } from "@/i18n/error";
// @ts-ignore allow side-effect import of BlockNote
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import { ContentType } from "@shared/enums/contentType.enum";
import toast from "@shared/lib/toast";
import { cn } from "@shared/util/utils";
import { ChevronDownIcon } from "lucide-react";
import type { CSSProperties, Dispatch } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useLocalPreferences } from "@/hooks/localPreferences";
import {
  BlockPackMeta,
  BlockPackMetaAction,
} from "@/reducers/blockPackMeta.reducer";

interface BlockPackEditorContentProps {
  blockPackMeta: BlockPackMeta;
  dispatchMeta: Dispatch<BlockPackMetaAction>;
}

const BlockPackEditorContent = ({
  blockPackMeta,
}: BlockPackEditorContentProps) => {
  const { i18n, t } = useTranslation();
  const sidebarManager = useSidebar();
  const shelfItemManager = useShelfItem();
  const { preferences } = useLocalPreferences();

  const { editor, state, resync, maximumBlockCount, rejectQuotaExceededEdit } =
    useBlockEditor();
  const isRejectingQuotaEdit = useRef(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isResyncing, setIsResyncing] = useState(false);
  const [isImporting, startImportingTransition] = useTransition();
  const [isExporting, startExportingTransition] = useTransition();
  const editorWidthClass = {
    narrow: "max-w-2xl",
    standard: "max-w-4xl",
    wide: "max-w-7xl",
  }[preferences.editorWidth];
  const shouldShowSideMenu =
    preferences.quickInsert || preferences.blockDragHandle;

  const countBlocks = (blocks: Array<{ children?: unknown }>): number =>
    blocks.reduce(
      (count, block) =>
        count +
        1 +
        (Array.isArray(block.children) ? countBlocks(block.children) : 0),
      0
    );

  const handleEditorChange = () => {
    if (
      isRejectingQuotaEdit.current ||
      maximumBlockCount === null ||
      state !== "ready" ||
      countBlocks(editor.document) <= maximumBlockCount
    ) {
      return;
    }

    isRejectingQuotaEdit.current = true;
    rejectQuotaExceededEdit();
    isRejectingQuotaEdit.current = false;
    toast.error(t("workspace.notifications.realtimeError"));
  };

  useEffect(() => {
    const editorElement = editor.domElement;
    if (!editorElement) return;

    editorElement.spellcheck = preferences.spellcheck;
    editorElement.setAttribute("spellcheck", String(preferences.spellcheck));
  }, [editor, preferences.spellcheck]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("workspace.notifications.copied"));
    } catch (error) {
      toast.error(translateError(error, t));
    }
  };

  const handleImportFiles = async (files: File[]) => {
    if (!files.length) return;

    startImportingTransition(async () => {
      try {
        const file = files[0];
        let blocks: PartialBlock<any, any, any>[] | undefined = undefined;
        switch (file.type) {
          case ContentType.Markdown:
          case ContentType.PlainText: // use the same way as markdown to parse the text
            const markdownText = await file.text();
            blocks = await editor.tryParseMarkdownToBlocks(markdownText);
            break;
          case ContentType.HTML:
            const htmlText = await file.text();
            blocks = await editor.tryParseHTMLToBlocks(htmlText);
            break;
          case ContentType.JSON:
            const jsonText = await file.text();
            blocks = JSON.parse(jsonText) as PartialBlock<any, any, any>[];
            break;
          default:
            throw new Error(`Unexpected content type received`);
        }
        if (!blocks) {
          throw new Error(`Unexpected content type received`);
        }

        editor.replaceBlocks([editor.document[0]?.id], blocks);

        toast.success(
          t("workspace.notifications.fileImported", { name: file.name })
        );
      } catch (error) {
        toast.error(translateError(error, t));
      }
    });
  };

  const handleExportFiles = async (contentType: ContentType) => {
    startExportingTransition(async () => {
      try {
        let blob: Blob | undefined = undefined;
        const a = document.createElement("a");

        switch (contentType) {
          case ContentType.Markdown:
            blob = await convertBlocksToMarkdown(editor);
            a.download = `${blockPackMeta.name}.md`;
            break;
          case ContentType.HTML:
            blob = await convertBlocksToHTML(editor);
            a.download = `${blockPackMeta.name}.html`;
            break;
          case ContentType.PlainText:
            blob = await convertBlocksToPlainText(editor);
            a.download = `${blockPackMeta.name}.txt`;
            break;
          case ContentType.JSON:
            blob = await convertBlocksToJSON(editor);
            a.download = `${blockPackMeta.name}.json`;
            break;
          case ContentType.PDF:
            blob = await convertBlocksToPDF(editor);
            a.download = `${blockPackMeta.name}.pdf`;
            break;
          case ContentType.DOCX:
            blob = await convertBlocksToDOCX(editor);
            a.download = `${blockPackMeta.name}.docx`;
            break;
          default:
            throw new Error(`Unexpected content type received`);
        }
        if (!blob) {
          throw new Error(`Unexpected content type received`);
        }

        const url = URL.createObjectURL(blob);
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);

        toast.success(t("workspace.notifications.exported"));
      } catch (error) {
        toast.error(translateError(error, t));
      }
    });
  };

  const handleResync = async () => {
    if (!window.confirm(t("workspace.viewer.resyncConfirm"))) return;

    setIsResyncing(true);
    try {
      await resync();
      toast.success(t("workspace.notifications.reconnecting"));
    } catch (error) {
      toast.error(translateError(error, t));
    } finally {
      setIsResyncing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-start bg-cover bg-center bg-no-repeat">
      <header className="w-full h-14 flex shrink-0 justify-between items-center px-4 gap-2 bg-canvas/15 backdrop-blur-md border-b border-canvas/10">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 max-w-full gap-2 border-none px-2 text-2xl font-semibold select-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <TruncatedText width="240px">
                  {blockPackMeta.name}
                </TruncatedText>
                <ChevronDownIcon
                  className={`transition ${isDropdownOpen ? "-rotate-180" : ""}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              <DropdownMenuItem
                onClick={() => {
                  if (blockPackMeta.id)
                    copyToClipboard(blockPackMeta.id.toString());
                }}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.id")}
                </span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {blockPackMeta.id}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(blockPackMeta.name)}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.name")}
                </span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {blockPackMeta.name}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  copyToClipboard(blockPackMeta.blockCount.toString())
                }
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.blockCount")}
                </span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {blockPackMeta.blockCount}
                </TruncatedText>
              </DropdownMenuItem>
              {blockPackMeta.updatedAt && (
                <DropdownMenuItem
                  onClick={() => {
                    if (blockPackMeta.updatedAt)
                      copyToClipboard(
                        blockPackMeta.updatedAt.toLocaleString(
                          i18n.resolvedLanguage
                        )
                      );
                  }}
                  className="hover:cursor-pointer"
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.updatedAt")}
                  </span>
                  <span className="text-muted-foreground">
                    {blockPackMeta.updatedAt.toLocaleString(
                      i18n.resolvedLanguage
                    )}
                  </span>
                </DropdownMenuItem>
              )}
              {blockPackMeta.createdAt && (
                <DropdownMenuItem
                  onClick={() => {
                    if (blockPackMeta.createdAt)
                      copyToClipboard(
                        blockPackMeta.createdAt.toLocaleString(
                          i18n.resolvedLanguage
                        )
                      );
                  }}
                  className="hover:cursor-pointer"
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.createdAt")}
                  </span>
                  <span className="text-muted-foreground">
                    {blockPackMeta.createdAt.toLocaleString(
                      i18n.resolvedLanguage
                    )}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BlockPackParticipantsDropdown
            blockPackId={blockPackMeta.id}
            rootShelfId={blockPackMeta.rootId}
            isEditorReady={state === "ready" || state === "readOnly"}
          />
          <Menubar className="h-9 gap-0 bg-muted/25 p-1">
            <MenubarMenu>
              <MenubarTrigger
                data-density-static
                className="h-7 px-3 py-0 text-sm leading-none"
              >
                {isImporting ? (
                  <Spinner />
                ) : (
                  <span className="leading-none">
                    {t("workspace.viewer.import")}
                  </span>
                )}
              </MenubarTrigger>
              <MenubarContent align="end" side="bottom">
                <DropFileZone
                  disabled={!editor}
                  width="300px"
                  height="200px"
                  onDrop={handleImportFiles}
                >
                  <p className="text-sm text-muted-foreground">
                    {t("workspace.viewer.dropFiles")}
                  </p>
                </DropFileZone>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger
                data-density-static
                className="h-7 px-3 py-0 text-sm leading-none"
              >
                {isExporting ? (
                  <Spinner />
                ) : (
                  <span className="leading-none">
                    {t("workspace.viewer.export")}
                  </span>
                )}
              </MenubarTrigger>
              <MenubarContent align="end" side="bottom">
                <MenubarItem
                  onClick={async () => {
                    const blob = await convertBlocksToMarkdown(editor);
                    await handleExportFiles(ContentType.Markdown);
                  }}
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.markdown")}
                  </span>
                  <span className="text-muted-foreground">(.md)</span>
                </MenubarItem>
                <MenubarItem
                  onClick={async () =>
                    await handleExportFiles(ContentType.HTML)
                  }
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.html")}
                  </span>
                  <span className="text-muted-foreground">(.html)</span>
                </MenubarItem>
                <MenubarItem
                  onClick={async () =>
                    await handleExportFiles(ContentType.PlainText)
                  }
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.plainText")}
                  </span>
                  <span className="text-muted-foreground">(.txt)</span>
                </MenubarItem>
                <MenubarItem
                  onClick={async () =>
                    await handleExportFiles(ContentType.JSON)
                  }
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.rawJson")}
                  </span>
                  <span className="text-muted-foreground">(.json)</span>
                </MenubarItem>
                <MenubarItem
                  onClick={async () => await handleExportFiles(ContentType.PDF)}
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.pdf")}
                  </span>
                  <span className="text-muted-foreground">(.pdf)</span>
                </MenubarItem>
                <MenubarItem
                  onClick={async () =>
                    await handleExportFiles(ContentType.DOCX)
                  }
                >
                  <span className="font-semibold">
                    {t("workspace.viewer.word")}
                  </span>
                  <span className="text-muted-foreground">(.docx)</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </header>
      <ItemPath
        parentSubShelfId={blockPackMeta.parentId}
        itemId={blockPackMeta.id}
        itemType="BlockPack"
        path={blockPackMeta.path}
        summary={shelfItemManager.expandedShelves.get(
          blockPackMeta.rootId.toString()
        )}
      />
      <div className="z-0 h-full w-full overflow-auto rounded-none p-4">
        <div
          className={cn(
            "mx-auto min-h-full w-full",
            editorWidthClass,
            preferences.editorWidth === "wide" && "px-10"
          )}
          style={
            {
              "--notezy-editor-font-size": `${preferences.editorFontSize}px`,
            } as CSSProperties
          }
        >
          {state === "syncError" ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <p>{t("workspace.viewer.resyncRequired")}</p>
              <Button disabled={isResyncing} onClick={handleResync}>
                {isResyncing && <Spinner />}
                {isResyncing
                  ? t("workspace.viewer.resyncing")
                  : t("workspace.viewer.resyncDocument")}
              </Button>
            </div>
          ) : (
            <BlockNoteView
              editor={editor}
              editable={state !== "readOnly"}
              onChange={handleEditorChange}
              sideMenu={false}
              spellCheck={preferences.spellcheck}
              className={cn(
                "notezy-block-editor caret-muted-foreground z-10 [&_.bn-default-styles]:!text-[length:var(--notezy-editor-font-size)] [&_.bn-editor]:!px-4 [&_.bn-editor]:!text-[length:var(--notezy-editor-font-size)] [&_.bn-block-content]:py-[3px]",
                !preferences.lineWrap &&
                  "[&_.bn-editor]:overflow-x-auto [&_.bn-inline-content]:whitespace-nowrap"
              )}
            >
              {shouldShowSideMenu && (
                <SideMenuController
                  floatingOptions={{ placement: "left-start" }}
                  sideMenu={sideMenuProps => (
                    <BlockSideMenu
                      {...sideMenuProps}
                      showDragHandle={preferences.blockDragHandle}
                      showQuickInsert={preferences.quickInsert}
                    />
                  )}
                />
              )}
            </BlockNoteView>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockPackEditorContent;
