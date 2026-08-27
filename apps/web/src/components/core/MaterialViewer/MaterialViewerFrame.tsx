import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSaveMyMaterialById } from "@/api/hooks/material.hook";
import { MaterialContentType } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import { cn } from "@shared/util/utils";
import {
  ChevronDownIcon,
  Copy,
  ExternalLink,
  FilePlus,
  RotateCw,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import DropFileZone from "@/components/commons/DropFileZone/DropFileZone";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
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
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useAppRouter, useShelfItem } from "@/hooks";
import { translateError } from "@shared/i18n/error";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";

interface MaterialViewerFrameProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType | undefined;
  contentClassName?: string;
  toolbarChildren?: React.ReactNode;
  menubarChildren?: React.ReactNode;
  fileAdditionalMenubarChildren?: React.ReactNode;
  viewAdditionalMenubarChildren?: React.ReactNode;
  children: React.ReactNode;
}

const MaterialViewerFrame = ({
  meta,
  materialContentType,
  contentClassName,
  toolbarChildren,
  menubarChildren,
  fileAdditionalMenubarChildren,
  viewAdditionalMenubarChildren,
  children,
}: MaterialViewerFrameProps) => {
  const router = useAppRouter();
  const { i18n, t } = useTranslation();
  const sidebarManager = useSidebar();
  const shelfItemManager = useShelfItem();
  const saveMaterialMutator = useSaveMyMaterialById();

  const [isMetaDropdownOpen, setIsMetaDropdownOpen] = useState<boolean>(false);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [isFileAvailable, setIsFileAvailable] = useState<boolean>(false);
  const [isImporting, startImportingTransition] = useTransition();

  const loadFile = useCallback(async () => {
    setIsFileLoading(true);

    if (materialContentType === MaterialContentType.None || !meta.downloadURL) {
      setIsFileAvailable(false);
      setIsFileLoading(false);
      return;
    }

    setIsFileAvailable(true);
    setIsFileLoading(false);
  }, [materialContentType, meta.downloadURL]);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t("workspace.notifications.copied"));
      } catch (error) {
        toast.error(translateError(error, t));
      }
    },
    [t]
  );

  const importFile = useCallback(
    async (
      contentFile: File,
      successMessage = t("workspace.notifications.fileImported", {
        name: contentFile.name,
      })
    ) => {
      await saveMaterialMutator.mutateAsync({
        header: getClientRequestHeaders(navigator.userAgent),
        body: {
          materialId: meta.id,
          contentFile: contentFile,
        },
        affected: {
          parentSubShelfId: meta.parentId,
        },
      });
      router.refresh();
      await loadFile();
      toast.success(successMessage);
    },
    [loadFile, meta.id, meta.parentId, router, saveMaterialMutator, t]
  );

  const handleImportFileOnClick = useCallback(
    async (contentFile: File) => {
      startImportingTransition(async () => {
        try {
          await importFile(contentFile);
        } catch (error) {
          toast.error(translateError(error, t));
        }
      });
    },
    [t, importFile]
  );

  useEffect(() => {
    void loadFile();
  }, [meta.id, meta.downloadURL, materialContentType, loadFile]);

  return (
    <div className="w-full h-full min-w-0 min-h-0 overflow-hidden flex flex-col items-stretch bg-cover bg-transparent bg-no-repeat">
      <header className="w-full min-w-0 h-14 flex shrink-0 justify-between items-center px-4 gap-2 bg-canvas/15 backdrop-blur-md border-b border-canvas/10 overflow-hidden">
        <div className="flex flex-1 min-w-0 justify-start items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <DropdownMenu
            open={isMetaDropdownOpen}
            onOpenChange={setIsMetaDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="min-w-0 max-w-full font-semibold text-2xl select-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <TruncatedText width="100%">{meta.name}</TruncatedText>
                <ChevronDownIcon
                  className={`transition ${isMetaDropdownOpen ? "-rotate-180" : ""}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              <DropdownMenuItem
                onClick={() => copyToClipboard(meta.id.toString())}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.id")}
                </span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {meta.id}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(meta.name)}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.name")}
                </span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {meta.name}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(meta.contentType)}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.contentType")}
                </span>
                <TruncatedText width="200px" className="text-muted-foreground">
                  {meta.contentType}
                </TruncatedText>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(String(meta.size))}
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.size")}
                </span>
                <span className="text-muted-foreground">
                  {t("workspace.viewer.bytes", { count: meta.size })}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  copyToClipboard(
                    meta.updatedAt.toLocaleString(i18n.resolvedLanguage)
                  )
                }
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.updatedAt")}
                </span>
                <span className="text-muted-foreground">
                  {meta.updatedAt.toLocaleString(i18n.resolvedLanguage)}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  copyToClipboard(
                    meta.createdAt.toLocaleString(i18n.resolvedLanguage)
                  )
                }
                className="hover:cursor-pointer"
              >
                <span className="font-semibold">
                  {t("workspace.viewer.createdAt")}
                </span>
                <span className="text-muted-foreground">
                  {meta.createdAt.toLocaleString(i18n.resolvedLanguage)}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {toolbarChildren}
        <Menubar className="bg-muted/25 shrink-0">
          {menubarChildren}
          <MenubarMenu>
            <MenubarTrigger>{t("workspace.viewer.file")}</MenubarTrigger>
            <MenubarContent align="end" side="bottom">
              <MenubarItem
                disabled={!meta.downloadURL}
                onClick={async () => {
                  if (!meta.downloadURL) return;
                  await copyToClipboard(meta.downloadURL);
                }}
              >
                <Copy />
                {t("workspace.viewer.copyUrl")}
              </MenubarItem>
              <MenubarItem
                disabled={!meta.downloadURL}
                onClick={() => {
                  if (!meta.downloadURL) return;
                  window.open(
                    meta.downloadURL,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                <ExternalLink />
                {t("workspace.viewer.openNewTab")}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger
                  disabled={isImporting}
                  className="gap-2 p-1.5"
                >
                  {isImporting ? (
                    <Spinner />
                  ) : (
                    <>
                      <FilePlus size={18} className="text-muted-foreground" />
                      {t("workspace.viewer.import")}
                    </>
                  )}
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <DropFileZone
                    disabled={isImporting}
                    width="300px"
                    height="200px"
                    accept={
                      {
                        [MaterialContentType.JSON]: [".json"],
                        [MaterialContentType.PDF]: [".pdf"],
                        [MaterialContentType.Markdown]: [".md", ".markdown"],
                        [MaterialContentType.PlainText]: [".txt"],
                        [MaterialContentType.HTML]: [".html", ".htm"],
                        [MaterialContentType.PNG]: [".png"],
                        [MaterialContentType.JPG]: [".jpg"],
                        [MaterialContentType.JPEG]: [".jpg", ".jpeg"],
                        [MaterialContentType.GIF]: [".gif"],
                        [MaterialContentType.SVG]: [".svg"],
                        [MaterialContentType.WebP]: [".webp"],
                        [MaterialContentType.MP4]: [".mp4"],
                        [MaterialContentType.WebM]: [".webm"],
                        [MaterialContentType.MP3]: [".mp3"],
                      } satisfies Record<
                        Exclude<MaterialContentType, MaterialContentType.None>,
                        string[]
                      >
                    }
                    onDrop={async files => {
                      const targetFile = files[0];
                      if (!targetFile) return;
                      await handleImportFileOnClick(targetFile);
                    }}
                  />
                </MenubarSubContent>
              </MenubarSub>
              {fileAdditionalMenubarChildren}
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>{t("workspace.viewer.view")}</MenubarTrigger>
            <MenubarContent align="end" side="bottom">
              <MenubarItem onClick={async () => await loadFile()}>
                <RotateCw />
                {t("workspace.viewer.refresh")}
              </MenubarItem>
              {viewAdditionalMenubarChildren}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>
      <ItemPath
        parentSubShelfId={meta.parentId}
        itemId={meta.id}
        itemType="Material"
        path={meta.path}
        summary={shelfItemManager.expandedShelves.get(meta.rootId.toString())}
      />
      <div
        className={cn(
          "w-full min-w-0 flex-1 min-h-0 rounded-none z-0",
          contentClassName
        )}
      >
        {isFileLoading && (
          <div className="text-muted-foreground text-sm">
            {t("workspace.viewer.loadingFile")}
          </div>
        )}
        {!isFileLoading && !isFileAvailable && (
          <div className="w-full min-h-[60vh] flex justify-center items-center">
            <div className="font-bold text-foreground text-base text-center">
              {t("workspace.viewer.noFile")}
            </div>
          </div>
        )}
        {!isFileLoading && isFileAvailable && meta.downloadURL && children}
      </div>
    </div>
  );
};

export default MaterialViewerFrame;
