import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  SearchBlockSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchBlocksLazyQuery } from "@/api/graphql/hooks/useSearchBlocks";
import { RoutineTaskPurpose } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import { CopyIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { translateRoutineTaskPurpose } from "@shared/i18n/workspace";
import { ShelfLocationPicker } from "../PayloadSearchPickers";
import TemplatePatternEditor, {
  type RoutineTaskTemplatePattern,
} from "../TemplatePatternEditor";
import type {
  PatternBlock,
  SelectedBlockPayloadTarget,
} from "./CreateBlockPackPayloadEditor";

interface CreateBlockPackPayloadEditorSidebarProps {
  purpose: string;
  targetSubShelfId: string;
  setTargetSubShelfId: Dispatch<SetStateAction<string>>;
  templateName: string;
  setTemplateName: Dispatch<SetStateAction<string>>;
  templatePattern: RoutineTaskTemplatePattern;
  setTemplatePattern: Dispatch<SetStateAction<RoutineTaskTemplatePattern>>;
  blockPackId: string;
  setBlockPackId: Dispatch<SetStateAction<string>>;
  blockId: string;
  setBlockId: Dispatch<SetStateAction<string>>;
  setSelectedBlock: Dispatch<SetStateAction<SelectedBlockPayloadTarget | null>>;
  patternBlocks: PatternBlock[];
  availablePatternBlocks: PatternBlock[];
  setPatternBlocks: Dispatch<SetStateAction<PatternBlock[]>>;
  onAddPatternBlock: (patternBlock: PatternBlock) => void;
  selectedPatternIds: Set<string>;
  setSelectedPatternIds: Dispatch<SetStateAction<Set<string>>>;
  payloadPreview: string;
}

const CreateBlockPackPayloadEditorSidebar = ({
  purpose,
  targetSubShelfId,
  setTargetSubShelfId,
  templateName,
  setTemplateName,
  templatePattern,
  setTemplatePattern,
  blockPackId,
  setBlockPackId,
  blockId,
  setBlockId,
  setSelectedBlock,
  patternBlocks,
  availablePatternBlocks,
  setPatternBlocks,
  onAddPatternBlock,
  selectedPatternIds,
  setSelectedPatternIds,
  payloadPreview,
}: CreateBlockPackPayloadEditorSidebarProps) => {
  const { t } = useTranslation();
  const [executeSearchBlocks] = useSearchBlocksLazyQuery({
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });
  const [isPatternBlockPickerOpen, setIsPatternBlockPickerOpen] =
    useState(false);
  const [isTemplateTableExpanded, setIsTemplateTableExpanded] = useState(false);
  const [selectedAvailablePatternIds, setSelectedAvailablePatternIds] =
    useState<Set<string>>(new Set());
  const [isBlockPickerOpen, setIsBlockPickerOpen] = useState(false);
  const [blockSearchQuery, setBlockSearchQuery] = useState("");
  const [searchedBlocks, setSearchedBlocks] = useState<
    Array<{
      id: string;
      type: string;
      props: unknown;
      content: unknown;
      contentText: string;
    }>
  >([]);
  const [blockSearchCursor, setBlockSearchCursor] = useState<string | null>(
    null
  );
  const [hasMoreBlocks, setHasMoreBlocks] = useState(true);
  const [isSearchingBlocks, setIsSearchingBlocks] = useState(false);
  const isSearchingBlocksRef = useRef(false);
  const [selectedBlockLabel, setSelectedBlockLabel] = useState("");
  const availableUnselectedPatternBlocks = availablePatternBlocks.filter(
    availablePatternBlock =>
      !patternBlocks.some(
        patternBlock => patternBlock.id === availablePatternBlock.id
      )
  );

  const searchBlocks = async (reset: boolean) => {
    if (isSearchingBlocksRef.current) return;
    if (!reset && (!hasMoreBlocks || !blockSearchCursor)) return;

    isSearchingBlocksRef.current = true;
    setIsSearchingBlocks(true);
    try {
      const result = await executeSearchBlocks({
        variables: {
          input: {
            query: blockSearchQuery.trim(),
            after: reset ? undefined : (blockSearchCursor ?? undefined),
            first: reset ? 20 : 10,
            sortBy: SearchBlockSortBy.LastUpdate,
            sortOrder: SearchSortOrder.Desc,
          },
        },
      }).retain();
      const nextBlocks =
        result.data?.searchBlocks.searchEdges.map(edge => {
          const node = edge.node as unknown as {
            id: string;
            type: string;
            props?: unknown;
            content?: unknown;
          };
          const content = node.content as any;
          const contentText = (() => {
            if (Array.isArray(content)) {
              const text = content
                .map(contentItem => {
                  if (contentItem?.type === "text") {
                    return contentItem.text ?? "";
                  }
                  if (
                    contentItem?.type === "link" &&
                    Array.isArray(contentItem.content)
                  ) {
                    return contentItem.content
                      .map((linkContent: any) => linkContent.text ?? "")
                      .join("");
                  }
                  return "";
                })
                .join("")
                .trim();
              return text;
            }
            if (Array.isArray(content?.content)) {
              const text = content.content
                .map((contentItem: any) => contentItem.text ?? "")
                .join("")
                .trim();
              return text;
            }
            if (typeof content?.text === "string") {
              return content.text.trim();
            }
            if (typeof content === "string") {
              return content.trim();
            }
            const serializedContent = JSON.stringify(content ?? {});
            return serializedContent.length > 2 ? serializedContent : "";
          })();
          return {
            id: node.id,
            type: node.type,
            props: (node as { props?: unknown }).props ?? {},
            content: node.content ?? [],
            contentText,
          };
        }) ?? [];

      setSearchedBlocks(previousBlocks => {
        if (reset) return nextBlocks;
        const nextBlockIds = new Set(nextBlocks.map(block => block.id));
        return [
          ...previousBlocks.filter(block => !nextBlockIds.has(block.id)),
          ...nextBlocks,
        ];
      });
      setBlockSearchCursor(
        result.data?.searchBlocks.searchPageInfo.endEncodedSearchCursor ?? null
      );
      setHasMoreBlocks(
        result.data?.searchBlocks.searchPageInfo.hasNextPage ?? false
      );
    } finally {
      isSearchingBlocksRef.current = false;
      setIsSearchingBlocks(false);
    }
  };

  useEffect(() => {
    if (!isBlockPickerOpen) return;

    const timeout = window.setTimeout(() => {
      void searchBlocks(true);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [blockSearchQuery, isBlockPickerOpen]);

  return (
    <aside className="flex max-h-[72vh] min-h-0 flex-col gap-4 overflow-y-auto border-r bg-sidebar p-4">
      {purpose === "CreateBlockPack" && (
        <>
          <ShelfLocationPicker
            mode="sub-only"
            label={t("workspace.payloadEditor.targetSubShelf")}
            placeholder={t("workspace.payloadEditor.selectSubShelf")}
            rootShelfId=""
            subShelfId={targetSubShelfId}
            onSelectSub={nextTargetSubShelfId =>
              setTargetSubShelfId(nextTargetSubShelfId)
            }
          />
          <div className="flex flex-col gap-2">
            <Label>{t("workspace.payloadEditor.templateName")}</Label>
            <Input
              value={templateName}
              onChange={event => setTemplateName(event.currentTarget.value)}
              placeholder={t("workspace.payloadEditor.templateNameExample")}
            />
          </div>
          <TemplatePatternEditor
            label={t("workspace.payloadEditor.patternTable")}
            pattern={templatePattern}
            onPatternChange={setTemplatePattern}
          />
        </>
      )}
      {(purpose === "AppendBlock" || purpose === "UpdateBlock") && (
        <TemplatePatternEditor
          label={t("workspace.payloadEditor.patternTable")}
          pattern={templatePattern}
          onPatternChange={setTemplatePattern}
        />
      )}
      {purpose === "AppendBlock" && (
        <>
          <div className="flex flex-col gap-2">
            <Label>{t("workspace.payloadEditor.blockPackId")}</Label>
            <Input
              value={blockPackId}
              onChange={event => setBlockPackId(event.currentTarget.value)}
            />
          </div>
        </>
      )}
      {(purpose === RoutineTaskPurpose.UpdateBlock ||
        purpose === RoutineTaskPurpose.ResetBlock) && (
        <div className="flex flex-col gap-2">
          <Label>{t("workspace.payloadEditor.block")}</Label>
          <PopoverPrimitive.Root
            modal
            open={isBlockPickerOpen}
            onOpenChange={open => {
              setIsBlockPickerOpen(open);
              if (!open) return;
              setBlockSearchQuery("");
              setSearchedBlocks([]);
              setBlockSearchCursor(null);
              setHasMoreBlocks(true);
            }}
          >
            <PopoverPrimitive.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start rounded-sm"
              >
                <span className="truncate">
                  {selectedBlockLabel || blockId ? (
                    selectedBlockLabel || blockId.slice(0, 8)
                  ) : (
                    <span className="text-muted-foreground">
                      {t("workspace.payloadEditor.selectBlock")}
                    </span>
                  )}
                </span>
              </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                align="start"
                sideOffset={4}
                className="z-[220] flex h-80 w-[520px] origin-[--radix-popover-content-transform-origin] flex-col overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              >
                <div className="shrink-0 border-b p-2">
                  <Input
                    value={blockSearchQuery}
                    onChange={event =>
                      setBlockSearchQuery(event.currentTarget.value)
                    }
                    placeholder={t("workspace.payloadEditor.searchBlocks")}
                    className="h-8"
                  />
                </div>
                <div
                  className="min-h-0 flex-1 overflow-y-auto p-2"
                  onScroll={event => {
                    const element = event.currentTarget;
                    if (
                      element.scrollTop + element.clientHeight <
                      element.scrollHeight - 24
                    ) {
                      return;
                    }
                    void searchBlocks(false);
                  }}
                >
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="transition-none hover:bg-transparent">
                        <TableHead className="h-8 w-24 p-1.5">
                          {t("workspace.payloadEditor.id")}
                        </TableHead>
                        <TableHead className="h-8 w-28 p-1.5">
                          {t("workspace.payloadEditor.type")}
                        </TableHead>
                        <TableHead className="h-8 p-1.5">
                          {t("workspace.payloadEditor.content")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchedBlocks.length === 0 ? (
                        <TableRow className="transition-none hover:bg-transparent">
                          <TableCell
                            colSpan={3}
                            className="p-5 text-center text-xs text-muted-foreground"
                          >
                            {isSearchingBlocks
                              ? t("workspace.payloadEditor.searchingBlocks")
                              : t("workspace.payloadEditor.noBlocks")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        searchedBlocks.map(searchedBlock => (
                          <TableRow
                            key={searchedBlock.id}
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => {
                              setBlockId(searchedBlock.id);
                              setSelectedBlock({
                                id: searchedBlock.id,
                                type: searchedBlock.type,
                                props: searchedBlock.props,
                                content: searchedBlock.content,
                                contentText: searchedBlock.contentText,
                              });
                              setSelectedBlockLabel(
                                `${searchedBlock.type.replace(/^BlockType_/, "").replace(/^[A-Z]/, character => character.toLowerCase())}${searchedBlock.contentText ? ` · ${searchedBlock.contentText.slice(0, 24)}${searchedBlock.contentText.length > 24 ? "..." : ""}` : ""}`
                              );
                              setIsBlockPickerOpen(false);
                            }}
                          >
                            <TableCell
                              className="w-24 overflow-hidden whitespace-nowrap p-1.5 font-mono text-[11px]"
                              title={searchedBlock.id}
                            >
                              {searchedBlock.id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="w-28 truncate p-1.5 text-xs">
                              {searchedBlock.type
                                .replace(/^BlockType_/, "")
                                .replace(/^[A-Z]/, character =>
                                  character.toLowerCase()
                                )}
                            </TableCell>
                            <TableCell className="min-w-0 p-1.5 text-xs">
                              {searchedBlock.contentText ? (
                                <HoverCard openDelay={250}>
                                  <HoverCardTrigger asChild>
                                    <span className="block truncate">
                                      {searchedBlock.contentText.length > 48
                                        ? `${searchedBlock.contentText.slice(0, 48)}...`
                                        : searchedBlock.contentText}
                                    </span>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="z-[230] max-h-64 w-80 overflow-y-auto rounded-sm text-xs">
                                    {searchedBlock.contentText}
                                  </HoverCardContent>
                                </HoverCard>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {hasMoreBlocks && (
                  <div className="shrink-0 border-t px-3 py-2 text-center text-muted-foreground text-xs">
                    {isSearchingBlocks
                      ? t("workspace.payloadEditor.loadingMoreBlocks")
                      : t("workspace.payloadEditor.scrollToLoadMore")}
                  </div>
                )}
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {t("workspace.payloadEditor.templateTable")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("workspace.payloadEditor.blocksScanned")}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <PopoverPrimitive.Root
            modal
            open={isPatternBlockPickerOpen}
            onOpenChange={open => {
              if (!open) {
                setSelectedAvailablePatternIds(new Set());
              }
              setIsPatternBlockPickerOpen(open);
            }}
          >
            <PopoverPrimitive.Trigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <PlusIcon className="size-4" />
              </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                align="end"
                side="bottom"
                sideOffset={6}
                collisionPadding={16}
                className="z-[220] flex h-72 w-[480px] origin-[--radix-popover-content-transform-origin] flex-col overflow-hidden rounded-sm border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              >
                <div className="shrink-0 border-b px-3 py-2">
                  <div className="text-sm font-semibold">
                    {t("workspace.payloadEditor.selectBlock")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("workspace.payloadEditor.chooseTemplateBlocks")}
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 w-8 p-1.5"></TableHead>
                        <TableHead className="h-8 w-24 p-1.5">
                          {t("workspace.payloadEditor.id")}
                        </TableHead>
                        <TableHead className="h-8 w-24 p-1.5">
                          {t("workspace.payloadEditor.type")}
                        </TableHead>
                        <TableHead className="h-8 p-1.5">
                          {t("workspace.payloadEditor.content")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableUnselectedPatternBlocks.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="p-5 text-center text-xs text-muted-foreground"
                          >
                            {t("workspace.payloadEditor.noAvailableBlocks")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        availableUnselectedPatternBlocks.map(
                          availablePatternBlock => (
                            <TableRow
                              key={availablePatternBlock.id}
                              className="transition-none hover:bg-transparent"
                            >
                              <TableCell className="p-1.5">
                                <Checkbox
                                  checked={selectedAvailablePatternIds.has(
                                    availablePatternBlock.id
                                  )}
                                  onCheckedChange={checked => {
                                    setSelectedAvailablePatternIds(
                                      previousSelectedAvailablePatternIds => {
                                        const nextSelectedAvailablePatternIds =
                                          new Set(
                                            previousSelectedAvailablePatternIds
                                          );
                                        if (checked) {
                                          nextSelectedAvailablePatternIds.add(
                                            availablePatternBlock.id
                                          );
                                        } else {
                                          nextSelectedAvailablePatternIds.delete(
                                            availablePatternBlock.id
                                          );
                                        }
                                        return nextSelectedAvailablePatternIds;
                                      }
                                    );
                                  }}
                                  onClick={event => event.stopPropagation()}
                                />
                              </TableCell>
                              <TableCell
                                className="w-24 cursor-pointer overflow-hidden whitespace-nowrap p-1.5 font-mono text-[11px] hover:text-foreground"
                                title={availablePatternBlock.id}
                                onClick={() => {
                                  void navigator.clipboard
                                    .writeText(availablePatternBlock.id)
                                    .then(() =>
                                      toast.success(
                                        t("workspace.clipboard.blockIdCopied")
                                      )
                                    )
                                    .catch(() =>
                                      toast.error(
                                        t(
                                          "workspace.clipboard.blockIdCopyFailed"
                                        )
                                      )
                                    );
                                }}
                              >
                                {availablePatternBlock.id.length > 8
                                  ? availablePatternBlock.id.slice(0, 8)
                                  : availablePatternBlock.id}
                              </TableCell>
                              <TableCell
                                className="w-24 cursor-pointer truncate p-1.5 text-xs hover:text-foreground"
                                onClick={() => {
                                  void navigator.clipboard
                                    .writeText(
                                      JSON.stringify(
                                        availablePatternBlock,
                                        null,
                                        2
                                      )
                                    )
                                    .then(() =>
                                      toast.success(
                                        t("workspace.clipboard.blockCopied")
                                      )
                                    )
                                    .catch(() =>
                                      toast.error(
                                        t("workspace.clipboard.blockCopyFailed")
                                      )
                                    );
                                }}
                              >
                                {availablePatternBlock.type
                                  .replace(/^BlockType_/, "")
                                  .replace(/^[A-Z]/, character =>
                                    character.toLowerCase()
                                  )}
                              </TableCell>
                              <TableCell
                                className="cursor-pointer truncate p-1.5 text-xs hover:text-foreground"
                                title={availablePatternBlock.label}
                                onClick={() => {
                                  void navigator.clipboard
                                    .writeText(
                                      JSON.stringify(
                                        availablePatternBlock,
                                        null,
                                        2
                                      )
                                    )
                                    .then(() =>
                                      toast.success(
                                        t("workspace.clipboard.blockCopied")
                                      )
                                    )
                                    .catch(() =>
                                      toast.error(
                                        t("workspace.clipboard.blockCopyFailed")
                                      )
                                    );
                                }}
                              >
                                {availablePatternBlock.label ? (
                                  <HoverCard openDelay={250}>
                                    <HoverCardTrigger asChild>
                                      <span className="block truncate">
                                        {availablePatternBlock.label.length > 40
                                          ? `${availablePatternBlock.label.slice(0, 40)}...`
                                          : availablePatternBlock.label}
                                      </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="z-[230] max-h-64 w-80 overflow-y-auto rounded-sm text-xs">
                                      {availablePatternBlock.label}
                                    </HoverCardContent>
                                  </HoverCard>
                                ) : null}
                              </TableCell>
                            </TableRow>
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex shrink-0 justify-end gap-2 border-t px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAvailablePatternIds(new Set());
                      setIsPatternBlockPickerOpen(false);
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={selectedAvailablePatternIds.size === 0}
                    onClick={() => {
                      availableUnselectedPatternBlocks.forEach(
                        availablePatternBlock => {
                          if (
                            selectedAvailablePatternIds.has(
                              availablePatternBlock.id
                            )
                          ) {
                            onAddPatternBlock(availablePatternBlock);
                          }
                        }
                      );
                      setSelectedAvailablePatternIds(new Set());
                      setIsPatternBlockPickerOpen(false);
                    }}
                  >
                    {t("common.confirm")}
                  </Button>
                </div>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={selectedPatternIds.size === 0}
            onClick={() => {
              setPatternBlocks(previousPatternBlocks =>
                previousPatternBlocks.filter(
                  patternBlock => !selectedPatternIds.has(patternBlock.id)
                )
              );
              setSelectedPatternIds(new Set());
            }}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />
      <div className="flex flex-col">
        <div
          className={
            isTemplateTableExpanded
              ? "h-72 min-h-72 shrink-0 overflow-y-auto rounded-t-sm border bg-background"
              : "h-24 min-h-24 shrink-0 overflow-hidden rounded-t-sm border bg-background"
          }
        >
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="transition-none hover:bg-transparent">
                <TableHead className="h-8 w-8 p-1.5"></TableHead>
                <TableHead className="h-8 w-16 p-1.5">
                  {t("workspace.payloadEditor.id")}
                </TableHead>
                <TableHead className="h-8 w-20 p-1.5">
                  {t("workspace.payloadEditor.type")}
                </TableHead>
                <TableHead className="h-8 p-1.5">
                  {t("workspace.payloadEditor.content")}
                </TableHead>
                <TableHead className="h-8 w-36 p-1.5">
                  {t("workspace.payloadEditor.props")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patternBlocks.length === 0 ? (
                <TableRow className="transition-none hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-56 px-2 py-6 text-center text-xs text-muted-foreground"
                  >
                    {t("workspace.payloadEditor.noTemplateBlocks")}
                  </TableCell>
                </TableRow>
              ) : (
                patternBlocks.map(patternBlock => {
                  const templateProps = JSON.stringify({
                    ...patternBlock.props,
                    template: true,
                  });
                  return (
                    <TableRow
                      key={patternBlock.id}
                      className="transition-none hover:bg-transparent"
                    >
                      <TableCell className="p-1.5">
                        <Checkbox
                          checked={selectedPatternIds.has(patternBlock.id)}
                          onCheckedChange={checked => {
                            setSelectedPatternIds(previousSelectedIds => {
                              const nextSelectedIds = new Set(
                                previousSelectedIds
                              );
                              if (checked) {
                                nextSelectedIds.add(patternBlock.id);
                              } else {
                                nextSelectedIds.delete(patternBlock.id);
                              }
                              return nextSelectedIds;
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell
                        className="w-16 cursor-pointer overflow-hidden whitespace-nowrap p-1.5 font-mono text-[11px] hover:text-foreground"
                        title={patternBlock.id}
                        onClick={() => {
                          void navigator.clipboard
                            .writeText(patternBlock.id)
                            .then(() =>
                              toast.success(
                                t("workspace.clipboard.templateBlockIdCopied")
                              )
                            )
                            .catch(() =>
                              toast.error(
                                t(
                                  "workspace.clipboard.templateBlockIdCopyFailed"
                                )
                              )
                            );
                        }}
                      >
                        {patternBlock.id.length > 8
                          ? patternBlock.id.slice(0, 8)
                          : patternBlock.id}
                      </TableCell>
                      <TableCell
                        className="w-20 truncate p-1.5 text-xs"
                        title={patternBlock.type}
                      >
                        {patternBlock.type
                          .replace(/^BlockType_/, "")
                          .replace(/^[A-Z]/, character =>
                            character.toLowerCase()
                          )}
                      </TableCell>
                      <TableCell
                        className="min-w-0 truncate p-1.5 text-xs"
                        title={patternBlock.label}
                      >
                        {patternBlock.label ? (
                          <HoverCard openDelay={250}>
                            <HoverCardTrigger asChild>
                              <span className="block truncate">
                                {patternBlock.label.length > 56
                                  ? `${patternBlock.label.slice(0, 56)}...`
                                  : patternBlock.label}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="z-[230] max-h-64 w-80 overflow-y-auto rounded-sm text-xs">
                              {patternBlock.label}
                            </HoverCardContent>
                          </HoverCard>
                        ) : null}
                      </TableCell>
                      <TableCell className="w-36 truncate p-1.5 font-mono text-[11px] text-muted-foreground">
                        <HoverCard openDelay={250}>
                          <HoverCardTrigger asChild>
                            <span className="block truncate">
                              {templateProps}
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent className="z-[230] max-h-64 w-96 overflow-y-auto whitespace-pre-wrap rounded-sm font-mono text-[11px]">
                            {templateProps}
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="-mt-px h-8 min-h-8 w-full shrink-0 rounded-t-none rounded-b-sm py-0"
          onClick={() => setIsTemplateTableExpanded(current => !current)}
        >
          {isTemplateTableExpanded
            ? t("workspace.payloadEditor.close")
            : t("workspace.payloadEditor.expand")}
        </Button>
      </div>
      <Separator />

      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>{t("workspace.payloadEditor.payloadPreview")}</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("workspace.payloadEditor.generatedJson", {
                purpose: translateRoutineTaskPurpose(
                  purpose as RoutineTaskPurpose,
                  t
                ),
              })}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              void navigator.clipboard
                .writeText(payloadPreview)
                .then(() =>
                  toast.success(t("workspace.clipboard.payloadPreviewCopied"))
                )
                .catch(() =>
                  toast.error(t("workspace.clipboard.payloadPreviewCopyFailed"))
                );
            }}
          >
            <CopyIcon className="size-4" />
          </Button>
        </div>
        <pre className="min-h-24 whitespace-pre-wrap break-words rounded-sm border bg-background p-3 font-mono text-[11px] text-foreground">
          {payloadPreview}
        </pre>
      </div>
    </aside>
  );
};

export default CreateBlockPackPayloadEditorSidebar;
