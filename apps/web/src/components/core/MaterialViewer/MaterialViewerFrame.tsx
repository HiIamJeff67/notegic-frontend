import { MaterialContentType } from "@shared/api/interfaces/enums";
import { tError } from "@shared/i18n/error";
import { useTranslation } from "@shared/i18n/useTranslation";
import toast from "@shared/lib/toast";
import { MaterialMeta } from "@shared/reducers/materialMeta.reducer";
import { cn } from "@shared/util/utils";
import {
  ChevronDownIcon,
  Copy,
  ExternalLink,
  FilePlus,
  RefreshCw,
} from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { getClientRequestHeaders } from "@/api/clientHeaders";
import { useSaveMyMaterialById } from "@/api/hooks/material.hook";
import DropFileZone from "@/components/commons/DropFileZone/DropFileZone";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
import LoadingCover from "@/components/covers/LoadingCover/LoadingCover";
import { MaterialIcon } from "@/components/icons/WorkspaceEntityIcons";
import ItemPath from "@/components/paths/ItemPath/ItemPath";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useShelfItem } from "@/hooks";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";

export interface MaterialFileState {
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
}

interface MaterialViewerFrameProps {
  meta: MaterialMeta;
  file: MaterialFileState;
  materialContentType: MaterialContentType | undefined;
  contentClassName?: string;
  isContentLoading?: boolean;
  toolbarChildren?: React.ReactNode;
  fileMenuChildren?: React.ReactNode;
  children: React.ReactNode;
}

const MaterialViewerFrame = ({
  meta,
  file,
  materialContentType,
  contentClassName,
  isContentLoading = false,
  toolbarChildren,
  fileMenuChildren,
  children,
}: MaterialViewerFrameProps) => {
  const { i18n, t } = useTranslation();
  const sidebarManager = useSidebar();
  const shelfItemManager = useShelfItem();
  const saveMaterialMutator = useSaveMyMaterialById();

  const [isMetaDropdownOpen, setIsMetaDropdownOpen] = useState<boolean>(false);
  const [isImporting, startImportingTransition] = useTransition();
  const contentURL = meta.localContentURL ?? meta.downloadURL;
  const isFileAvailable =
    materialContentType !== MaterialContentType.None && Boolean(contentURL);
  const isLoading =
    file.isLoading ||
    (!file.isError && isFileAvailable && isContentLoading) ||
    isImporting;
  useRegisterLoadingDependencies(isLoading);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t("workspace.notifications.copied"));
      } catch (error) {
        toast.error(tError(error, t));
      }
    },
    [t]
  );

  const importFile = useCallback(
    async (contentFile: File) => {
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
      toast.success(
        t("workspace.notifications.fileImported", {
          name: contentFile.name,
        })
      );
    },
    [meta.id, meta.parentId, saveMaterialMutator, t]
  );

  const handleImportFileOnClick = useCallback(
    async (contentFile: File) => {
      startImportingTransition(async () => {
        try {
          await importFile(contentFile);
        } catch (error) {
          toast.error(tError(error, t));
        }
      });
    },
    [importFile, t]
  );

  return (
    <div className="w-full h-full min-w-0 min-h-0 overflow-hidden flex flex-col items-stretch bg-background">
      <LoadingCover condition={isLoading} />
      <header className="flex h-[var(--app-toolbar-height)] w-full min-w-0 shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-inset/75 px-3 py-1.5 backdrop-blur-md">
        <div className="flex flex-1 min-w-0 justify-start items-center gap-2">
          {sidebarManager.isMobile && <SidebarTrigger />}
          <DropdownMenu
            open={isMetaDropdownOpen}
            onOpenChange={setIsMetaDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 min-w-0 max-w-full gap-2 border-none px-2 text-xl font-semibold select-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
        <div className="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain p-1">
          {!file.isLoading &&
            !file.isError &&
            isFileAvailable &&
            toolbarChildren}
          <ButtonGroup className="shrink-0">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 px-0 [&_svg]:size-3.5"
                      aria-label={t("workspace.viewer.file")}
                    >
                      <MaterialIcon />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {t("workspace.viewer.file")}
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" side="bottom">
                <DropdownMenuItem
                  disabled={!meta.downloadURL}
                  onClick={async () => {
                    if (!meta.downloadURL) return;
                    await copyToClipboard(meta.downloadURL);
                  }}
                >
                  <Copy />
                  {t("workspace.viewer.copyUrl")}
                </DropdownMenuItem>
                <DropdownMenuItem
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
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
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
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
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
                          Exclude<
                            MaterialContentType,
                            MaterialContentType.None
                          >,
                          string[]
                        >
                      }
                      onDrop={async files => {
                        const targetFile = files[0];
                        if (!targetFile) return;
                        await handleImportFileOnClick(targetFile);
                      }}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {!file.isLoading &&
                  !file.isError &&
                  isFileAvailable &&
                  fileMenuChildren}
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 px-0 [&_svg]:size-3.5"
                  disabled={file.isLoading}
                  onClick={file.onRefresh}
                  aria-label={t("workspace.viewer.refresh")}
                >
                  <RefreshCw
                    className={file.isLoading ? "animate-spin" : undefined}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("workspace.viewer.refresh")}
              </TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </div>
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
        {!file.isLoading && file.isError && (
          <div
            role="alert"
            className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground"
          >
            <p>{t("workspace.viewer.failedFilePreview")}</p>
          </div>
        )}
        {!file.isLoading && !file.isError && !isFileAvailable && (
          <div className="w-full min-h-[60vh] flex justify-center items-center">
            <div className="font-bold text-foreground text-base text-center">
              {t("workspace.viewer.noFile")}
            </div>
          </div>
        )}
        {!file.isLoading && !file.isError && isFileAvailable && children}
      </div>
    </div>
  );
};

export default MaterialViewerFrame;
