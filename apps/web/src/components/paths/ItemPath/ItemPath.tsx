import { ItemType } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import type { UUID } from "crypto";
import { ChevronRightIcon } from "lucide-react";
import { type WheelEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import WrapPlaceholder from "@/components/holders/WrapPlaceholder";
import ItemPathItem from "@/components/paths/ItemPath/ItemPathItem";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ItemPathProps {
  parentSubShelfId: UUID;
  itemId: UUID;
  itemType: ItemType;
  path: UUID[];
  pathItems?: { id: UUID; name: string }[];
  itemName?: string;
  summary?: ShelfTreeSummary;
}

const ItemPath = ({
  parentSubShelfId,
  itemId,
  itemType,
  path,
  pathItems,
  itemName,
  summary,
}: ItemPathProps) => {
  const { t } = useTranslation();
  const tracePathInSummary = useCallback((): SubShelfNode[] => {
    if (!summary) return [];
    if (path.length === 0) {
      const parentSubShelfNode = summary.root.children[parentSubShelfId];
      return parentSubShelfNode ? [parentSubShelfNode] : [];
    }
    const subShelfNodes: SubShelfNode[] = [];
    let cur = summary.root.children[path[0]];
    if (!cur) return [];
    subShelfNodes.push(cur);
    for (let i = 1; i < path.length; i++) {
      const next = cur.children[path[i]];
      if (!next) return [];
      subShelfNodes.push(next);
      cur = next;
    }

    const parentSubShelfNode = cur.children[parentSubShelfId];
    if (!parentSubShelfNode) return [];
    subShelfNodes.push(parentSubShelfNode);
    return subShelfNodes;
  }, [path, parentSubShelfId, summary]);

  const subShelfNodes = tracePathInSummary();
  const hasSummaryPath = !!summary && subShelfNodes.length === path.length + 1;
  const [isPathExpanded, setIsPathExpanded] = useState(false);
  const canExpandPath = hasSummaryPath
    ? subShelfNodes.length > 1
    : (pathItems?.length ?? 0) > 2;
  const isScrollable = canExpandPath && isPathExpanded;

  const handlePathWheel = (event: WheelEvent<HTMLElement>) => {
    const pathElement = event.currentTarget;
    const maxScrollLeft = pathElement.scrollWidth - pathElement.clientWidth;
    if (
      !isScrollable ||
      maxScrollLeft <= 0 ||
      Math.abs(event.deltaY) <= Math.abs(event.deltaX)
    ) {
      return;
    }

    const canScrollInDirection =
      event.deltaY > 0
        ? pathElement.scrollLeft < maxScrollLeft
        : pathElement.scrollLeft > 0;
    if (!canScrollInDirection) return;

    event.preventDefault();
    pathElement.scrollLeft += event.deltaY;
  };

  if (hasSummaryPath) {
    return (
      <Breadcrumb
        className={`h-9 min-w-0 w-full shrink-0 border-y bg-transparent overflow-y-hidden ${isScrollable ? "overflow-x-auto overscroll-x-contain" : "overflow-x-hidden"}`}
        onWheel={handlePathWheel}
      >
        <BreadcrumbList
          className={`h-full flex-nowrap items-center whitespace-nowrap px-4 py-0 ${isScrollable ? "w-max min-w-full" : "w-full min-w-0"}`}
        >
          <BreadcrumbItem className={isScrollable ? "shrink-0" : "min-w-0"}>
            <DropdownMenu>
              <DropdownMenuTrigger className="min-w-0 max-w-full select-none font-semibold text-secondary-foreground/80 hover:underline">
                <span
                  className={
                    isScrollable
                      ? "whitespace-nowrap"
                      : "block max-w-[min(20vw,10rem)] truncate"
                  }
                >
                  {summary.root.name}
                </span>
              </DropdownMenuTrigger>
              {Object.entries(summary.root.children).length !== 0 && (
                <DropdownMenuContent className="max-h-[min(18rem,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto">
                  {Object.entries(summary.root.children).map(([id, child]) => {
                    return (
                      <DropdownMenuItem key={id}>
                        <ChevronRightIcon />
                        <span>{child.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </BreadcrumbItem>
          {canExpandPath && !isScrollable && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="shrink-0">
                <button
                  type="button"
                  aria-label={t("common.more")}
                  aria-expanded={isPathExpanded}
                  className="cursor-pointer select-none font-semibold text-secondary-foreground/80 hover:underline"
                  onClick={() => setIsPathExpanded(true)}
                >
                  …
                </button>
              </BreadcrumbItem>
            </>
          )}
          {(isScrollable || !canExpandPath
            ? subShelfNodes
            : subShelfNodes.slice(-1)
          ).map((subShelfNode, index, visibleNodes) => {
            if (index === visibleNodes.length - 1) {
              let itemName: string | undefined = undefined;

              switch (itemType) {
                case "BlockPack":
                  if (subShelfNode.blockPackNodes[itemId])
                    itemName = subShelfNode.blockPackNodes[itemId].name;
                  break;
                case "Material":
                  if (subShelfNode.materialNodes[itemId])
                    itemName = subShelfNode.materialNodes[itemId].name;
                  break;
              }

              if (itemName) {
                return (
                  <WrapPlaceholder key={subShelfNode.id}>
                    <ItemPathItem
                      rootShelfNode={summary.root}
                      subShelfNode={subShelfNode}
                      isScrollable={isScrollable}
                    />
                    <BreadcrumbSeparator />
                    <BreadcrumbItem
                      className={`cursor-pointer font-semibold text-secondary-foreground/80 hover:underline ${isScrollable ? "shrink-0" : "min-w-0"}`}
                    >
                      <span
                        className={
                          isScrollable
                            ? "whitespace-nowrap"
                            : "max-w-[min(20vw,10rem)] truncate"
                        }
                      >
                        {itemName}
                      </span>
                    </BreadcrumbItem>
                  </WrapPlaceholder>
                );
              }
            }

            return (
              <ItemPathItem
                key={subShelfNode.id}
                rootShelfNode={summary.root}
                subShelfNode={subShelfNode}
                isScrollable={isScrollable}
              />
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (!pathItems || pathItems.length === 0) return <></>;

  return (
    <Breadcrumb
      className={`h-9 min-w-0 w-full shrink-0 border-y bg-transparent overflow-y-hidden ${isScrollable ? "overflow-x-auto overscroll-x-contain" : "overflow-x-hidden"}`}
      onWheel={handlePathWheel}
    >
      <BreadcrumbList
        className={`h-full flex-nowrap items-center whitespace-nowrap px-4 py-0 ${isScrollable ? "w-max min-w-full" : "w-full min-w-0"}`}
      >
        <BreadcrumbItem className={isScrollable ? "shrink-0" : "min-w-0"}>
          <span
            className={
              isScrollable
                ? "whitespace-nowrap"
                : "block max-w-[min(20vw,10rem)] truncate font-semibold text-secondary-foreground/80"
            }
          >
            {pathItems[0].name}
          </span>
        </BreadcrumbItem>
        {canExpandPath && !isScrollable && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="shrink-0">
              <button
                type="button"
                aria-label={t("common.more")}
                aria-expanded={isPathExpanded}
                className="cursor-pointer select-none font-semibold text-secondary-foreground/80 hover:underline"
                onClick={() => setIsPathExpanded(true)}
              >
                …
              </button>
            </BreadcrumbItem>
          </>
        )}
        {(isScrollable || !canExpandPath
          ? pathItems.slice(1)
          : pathItems.slice(-1)
        ).map(pathItem => (
          <WrapPlaceholder key={pathItem.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem className={isScrollable ? "shrink-0" : "min-w-0"}>
              <span
                className={
                  isScrollable
                    ? "whitespace-nowrap font-semibold text-secondary-foreground/80"
                    : "block max-w-[min(20vw,10rem)] truncate font-semibold text-secondary-foreground/80"
                }
              >
                {pathItem.name}
              </span>
            </BreadcrumbItem>
          </WrapPlaceholder>
        ))}
        {itemName && (
          <WrapPlaceholder>
            <BreadcrumbSeparator />
            <BreadcrumbItem className={isScrollable ? "shrink-0" : "min-w-0"}>
              <span
                className={
                  isScrollable
                    ? "whitespace-nowrap font-semibold text-secondary-foreground/80"
                    : "block max-w-[min(20vw,10rem)] truncate font-semibold text-secondary-foreground/80"
                }
              >
                {itemName}
              </span>
            </BreadcrumbItem>
          </WrapPlaceholder>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ItemPath;
