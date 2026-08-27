import {
  DashboardWidthFrameCountStep,
  MaxDashboardWidthFrameCount,
  MinDashboardWidthFrameCount,
} from "@shared/constants/widgetLayout.constant";
import { DNDType } from "@shared/enums";
import { FrameCountPosition, FrameCountSize } from "@shared/types/cord";
import type { UUID } from "crypto";
import {
  CheckIcon,
  ChevronsRightLeftIcon,
  PlusIcon,
  WrenchIcon,
} from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DropTargetMonitor } from "react-dnd";
import { useTranslation } from "react-i18next";
import { dashboardHeaderBackgroundImageOptions } from "@assets/backgrounds";
import PlaceableBackground from "@/components/backgrounds/PlaceableBackground/PlaceableBackground";
import { ProgressiveBackground } from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import Draggable from "@/components/commons/Draggable/Draggable";
import Extendable from "@/components/commons/Extendable/Extendable";
import XYResizable from "@/components/commons/Resizable/XYResizable";
import CreateWidgetDialog from "@/components/dialogs/WidgetDialog/CreateWidgetDialog";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import EditIcon from "@/components/icons/EditIcon";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  getPositionValue,
  getSizeValue,
  getWidgetWidthFrameCount,
  PreviewWidget,
  toWidget,
  Widget,
} from "@/components/widgets/widget";
import {
  useBackgroundImages,
  useLocalPreferences,
  useModal,
  useScreen,
  useWidget,
} from "@/hooks";

const DashboardElementZIndexes = {
  headerBackgroundImage: 50,
  placeableBackground: 50,
  placeableFrames: 50,
  widgets: {
    draggable: 75,
    resizable: 100,
    extendable: 125,
  },
  editButtons: 200,
  // all the dialogs can be consider to have the same z index of infinity
};

const DashboardPage = () => {
  const { t } = useTranslation();
  const screenManager = useScreen();
  const widgetManager = useWidget();
  const { preferences, updatePreference } = useLocalPreferences();
  const modalManager = useModal();
  const backgroundImagesManager = useBackgroundImages();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingWidgetIndex, setEditingWidgetIndex] = useState<number>(-1);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number>(16 / 9);
  const [frameSize, setFrameSize] = useState<number>(0);
  const [currentFramePosition, setCurrentFramePosition] = useState<{
    leftFrameCount: number;
    topFrameCount: number;
  }>({ leftFrameCount: 0, topFrameCount: 0 });
  const [currentResizedWidgetInfo, setCurrentResizedWidgetInfo] = useState<{
    width: number;
    height: number;
    index: number;
  }>({ width: 0, height: 0, index: -1 });
  const [createWidgetDialogOpen, setCreateWidgetDialogOpen] =
    useState<boolean>(false);
  const [createWidgetAtBottom, setCreateWidgetAtBottom] =
    useState<boolean>(false);

  const defaultHeaderBackgroundImage =
    dashboardHeaderBackgroundImageOptions.find(
      image => image.id === backgroundImagesManager.defaultBackgroundImageId
    )?.src ?? dashboardHeaderBackgroundImageOptions[0].src;

  const headerBackgroundImageRef = useRef<HTMLDivElement>(null);

  const { widthTotalFrameCount, heightTotalFrameCount, frameGap } =
    useMemo(() => {
      let widthTotalFrameCount = MinDashboardWidthFrameCount;
      const frameGap = screenManager.breakpoint === "xl" ? 6 : 4;
      if (preferences.manualDashboardWidth) {
        widthTotalFrameCount = preferences.dashboardWidthFrameCount;
      } else {
        switch (screenManager.breakpoint) {
          case "base":
          case "sm":
            break;
          case "md":
          case "lg":
            widthTotalFrameCount = 6;
            break;
          case "xl":
            widthTotalFrameCount = 8;
            break;
          case "2xl":
            widthTotalFrameCount = 12;
            break;
          case "3xl":
            widthTotalFrameCount = 16;
            break;
        }
      }

      let heightTotalFrameCount = 0;
      widgetManager.getWidgets().forEach(widget => {
        heightTotalFrameCount = Math.max(
          heightTotalFrameCount,
          widget.position.topFrameCount + widget.size.heightFrameCount
        );
      });
      return {
        widthTotalFrameCount: widthTotalFrameCount,
        heightTotalFrameCount: heightTotalFrameCount,
        frameGap: frameGap,
      };
    }, [preferences, screenManager.breakpoint, widgetManager]);

  const updateDashboardWidth = useCallback(
    (direction: 1 | -1) => {
      updatePreference("manualDashboardWidth", true);
      updatePreference(
        "dashboardWidthFrameCount",
        Math.min(
          MaxDashboardWidthFrameCount,
          Math.max(
            MinDashboardWidthFrameCount,
            widthTotalFrameCount + direction * DashboardWidthFrameCountStep
          )
        )
      );
    },
    [updatePreference, widthTotalFrameCount]
  );

  const hasSomeWidgetsOutOfBoundary = useMemo(
    () =>
      widgetManager
        .getWidgets()
        .some(
          widget =>
            (widget.layoutMode === "full-width"
              ? 0
              : widget.position.leftFrameCount) +
              getWidgetWidthFrameCount(widget, widthTotalFrameCount) >
            widthTotalFrameCount
        ),
    [widgetManager, widthTotalFrameCount]
  );

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [backgroundImagesManager.currentBackgroundImage]);

  const handleCreateWidgetOnClick = useCallback(
    (previewWidget: PreviewWidget) => {
      const previewWidthFrameCount =
        previewWidget.layoutMode === "full-width"
          ? widthTotalFrameCount
          : previewWidget.size.widthFrameCount;
      if (createWidgetAtBottom) {
        let availableTopFrameCount = 0;
        widgetManager.getWidgets().forEach(widget => {
          if (
            previewWidget.layoutMode === "full-width" ||
            widget.position.leftFrameCount < previewWidthFrameCount
          ) {
            availableTopFrameCount = Math.max(
              availableTopFrameCount,
              widget.position.topFrameCount + widget.size.heightFrameCount
            );
          }
        });
        widgetManager.append(
          toWidget(previewWidget, {
            leftFrameCount: 0,
            topFrameCount: availableTopFrameCount,
          })
        );
      } else {
        const createdFramePosition: FrameCountPosition = {
          ...currentFramePosition,
        };
        if (
          createdFramePosition.leftFrameCount + previewWidthFrameCount >
          widthTotalFrameCount
        ) {
          createdFramePosition.leftFrameCount = 0;
          let availableTopFrameCount = 0;
          widgetManager.getWidgets().forEach(widget => {
            if (
              previewWidget.layoutMode === "full-width" ||
              widget.position.leftFrameCount < previewWidthFrameCount
            ) {
              availableTopFrameCount = Math.max(
                availableTopFrameCount,
                widget.position.topFrameCount + widget.size.heightFrameCount
              );
            }
          });
          createdFramePosition.topFrameCount = availableTopFrameCount;
        }
        if (previewWidget.layoutMode === "full-width") {
          createdFramePosition.leftFrameCount = 0;
        }
        widgetManager.append(toWidget(previewWidget, createdFramePosition));
      }
      setCreateWidgetDialogOpen(false);
      setCreateWidgetAtBottom(false);
    },
    [
      widgetManager,
      currentFramePosition,
      createWidgetAtBottom,
      widthTotalFrameCount,
    ]
  );

  const isWidgetConflicted = useCallback(
    (
      widget: Widget,
      widthFrameCount?: number,
      heightFrameCount?: number
    ): boolean => {
      const widgetWidthFrameCount =
        widget.layoutMode === "full-width"
          ? widthTotalFrameCount
          : (widthFrameCount ?? widget.size.widthFrameCount);
      const widgetHeightFrameCount =
        heightFrameCount ?? widget.size.heightFrameCount;
      const widgetLeftFrameCount =
        widget.layoutMode === "full-width" ? 0 : widget.position.leftFrameCount;
      const widgetRightFrameCount =
        widgetLeftFrameCount + widgetWidthFrameCount;
      const widgetTopFrameCount = widget.position.topFrameCount;
      const widgetBottomFrameCount =
        widgetTopFrameCount + widgetHeightFrameCount;

      return widgetManager.getWidgets().some(potentialConflictableWidget => {
        if (potentialConflictableWidget.id === widget.id) return false;

        const potentialLeftFrameCount =
          potentialConflictableWidget.layoutMode === "full-width"
            ? 0
            : potentialConflictableWidget.position.leftFrameCount;
        const potentialRightFrameCount =
          potentialLeftFrameCount +
          getWidgetWidthFrameCount(
            potentialConflictableWidget,
            widthTotalFrameCount
          );
        const potentialTopFrameCount =
          potentialConflictableWidget.position.topFrameCount;
        const potentialBottomFrameCount =
          potentialTopFrameCount +
          potentialConflictableWidget.size.heightFrameCount;

        return (
          widgetLeftFrameCount < potentialRightFrameCount &&
          widgetRightFrameCount > potentialLeftFrameCount &&
          widgetTopFrameCount < potentialBottomFrameCount &&
          widgetBottomFrameCount > potentialTopFrameCount
        );
      });
    },
    [widgetManager, widthTotalFrameCount]
  );

  const handleWidgetOnResize = useCallback(
    (
      width: number,
      height: number,
      resizedWidget: Widget
    ): {
      size: { availableWidth: number; availableHeight: number };
      frameCount: FrameCountSize;
    } => {
      const compatibleSizes: FrameCountSize[] = []; // the non conflicted widgets
      const availableSizes =
        resizedWidget.layoutMode === "full-width"
          ? resizedWidget.availableSizes.map(size => ({
              ...size,
              widthFrameCount: widthTotalFrameCount,
            }))
          : resizedWidget.availableSizes;

      // Pass 1: Eliminate the available sizes which may cause a conflict to other widgets
      availableSizes.forEach(availableSize => {
        if (
          !isWidgetConflicted(
            resizedWidget,
            availableSize.widthFrameCount,
            availableSize.heightFrameCount
          )
        ) {
          // we check the right and the bottom border to handle the resize of the expansion on the right and the bottom border
          // we don't need check the left and top border, since if the resized widget is shrinking, it will not be smaller than its smallest size
          compatibleSizes.push(availableSize);
        }
      });

      // Pass 2: Find the closest available sizes when there're no available sizes which will cause the conflict
      let result: {
        size: { availableWidth: number; availableHeight: number };
        frameCount: FrameCountSize;
      } = {
        size: {
          availableWidth: getSizeValue(
            getWidgetWidthFrameCount(resizedWidget, widthTotalFrameCount),
            frameSize,
            frameGap
          ),
          availableHeight: getSizeValue(
            resizedWidget.size.heightFrameCount,
            frameSize,
            frameGap
          ),
        },
        frameCount: {
          widthFrameCount: resizedWidget.size.widthFrameCount,
          heightFrameCount: resizedWidget.size.heightFrameCount,
        },
      };
      let resultDistance = Math.sqrt(
        Math.pow(result.size.availableWidth - width, 2) +
          Math.pow(result.size.availableHeight - height, 2)
      );
      compatibleSizes.forEach(compatibleSize => {
        const currentDistance = Math.sqrt(
          Math.pow(
            getSizeValue(compatibleSize.widthFrameCount, frameSize, frameGap) -
              width,
            2
          ) +
            Math.pow(
              getSizeValue(
                compatibleSize.heightFrameCount,
                frameSize,
                frameGap
              ) - height,
              2
            )
        );
        if (currentDistance < resultDistance) {
          resultDistance = currentDistance;
          result = {
            size: {
              availableWidth: getSizeValue(
                compatibleSize.widthFrameCount,
                frameSize,
                frameGap
              ),
              availableHeight: getSizeValue(
                compatibleSize.heightFrameCount,
                frameSize,
                frameGap
              ),
            },
            frameCount: {
              widthFrameCount:
                resizedWidget.layoutMode === "full-width"
                  ? resizedWidget.size.widthFrameCount
                  : compatibleSize.widthFrameCount,
              heightFrameCount: compatibleSize.heightFrameCount,
            },
          };
        }
      });

      return result;
    },
    [isWidgetConflicted, frameSize, frameGap, widthTotalFrameCount]
  );

  const handleReorderWidgetsToFitInBoundary = useCallback(() => {
    const sortedWidgets = [...widgetManager.getWidgets()].sort(
      (a: Widget, b: Widget) =>
        a.position.topFrameCount === b.position.topFrameCount
          ? a.position.leftFrameCount - b.position.leftFrameCount
          : a.position.topFrameCount - b.position.topFrameCount
    );
    let currentLeftFrameCount = 0,
      currentTopFrameCount = 0;
    const isOccupied: (UUID | undefined)[][] = Array.from(
      { length: heightTotalFrameCount },
      () => Array(widthTotalFrameCount).fill(undefined)
    );
    const placedWidgets = new Map<UUID, Widget>();
    const orderedWidgets: Widget[] = [];

    sortedWidgets.forEach(widget => {
      const widgetWidthFrameCount = getWidgetWidthFrameCount(
        widget,
        widthTotalFrameCount
      );
      if (
        currentLeftFrameCount + widgetWidthFrameCount > widthTotalFrameCount ||
        isOccupied[currentTopFrameCount]?.[currentLeftFrameCount] !== undefined
      ) {
        let reservedTopFrameCount = currentTopFrameCount + 1;
        for (let j = 0; j < widgetWidthFrameCount; j++) {
          const occupyingId = isOccupied[currentTopFrameCount]?.[j];
          if (occupyingId === undefined) continue;

          const placedWidget = placedWidgets.get(occupyingId as UUID);
          if (placedWidget === undefined) continue;

          reservedTopFrameCount = Math.max(
            reservedTopFrameCount,
            placedWidget.position.topFrameCount +
              placedWidget.size.heightFrameCount
          );
        }
        currentTopFrameCount = reservedTopFrameCount;
        currentLeftFrameCount = 0;
      }
      const orderedWidget: Widget = {
        ...widget,
        position: {
          leftFrameCount: currentLeftFrameCount,
          topFrameCount: currentTopFrameCount,
        },
      };

      for (
        let i = currentTopFrameCount;
        i < currentTopFrameCount + widget.size.heightFrameCount;
        i++
      ) {
        if (!isOccupied[i]) {
          isOccupied[i] = Array(widthTotalFrameCount).fill(undefined);
        }
        for (
          let j = currentLeftFrameCount;
          j < currentLeftFrameCount + widgetWidthFrameCount;
          j++
        ) {
          isOccupied[i][j] = widget.id;
        }
      }

      currentLeftFrameCount += widgetWidthFrameCount;
      placedWidgets.set(widget.id, orderedWidget);
      orderedWidgets.push(orderedWidget);
    });

    widgetManager.sync(orderedWidgets);
  }, [widgetManager, widthTotalFrameCount, heightTotalFrameCount]);

  return (
    <div
      className="
        relative w-full h-full min-h-[calc(100vh-4rem)] overflow-hidden flex flex-col
      "
    >
      <CreateWidgetDialog
        open={createWidgetDialogOpen}
        onOpenChange={setCreateWidgetDialogOpen}
        onCreate={handleCreateWidgetOnClick}
      />
      {backgroundImagesManager.currentBackgroundImage === null ? (
        <div
          ref={headerBackgroundImageRef}
          className={`!w-full !h-60 shrink-0 relative z-${DashboardElementZIndexes.headerBackgroundImage}`}
        >
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
            decoding="async"
            fetchPriority="high"
            src={defaultHeaderBackgroundImage}
          />
          {isEditing && (
            <ModifyImageHover
              className="absolute"
              imageSrc=""
              imageAlt={t("workspace.navigation.dashboardBackgroundImage")}
              onClick={() =>
                modalManager.open("SelectBackgroundImageDialog", {
                  cropperAspectRatio: cropperAspectRatio,
                })
              }
              hoverText={t("workspace.navigation.changeBackgroundImage")}
            />
          )}
        </div>
      ) : (
        <ProgressiveBackground
          ref={headerBackgroundImageRef}
          className={`!w-full !h-60 shrink-0 border-none relative z-${DashboardElementZIndexes.headerBackgroundImage}`}
        >
          {isEditing && (
            <ModifyImageHover
              className="absolute inset-0"
              imageAlt={t("workspace.navigation.dashboardBackgroundImage")}
              onClick={() =>
                modalManager.open("SelectBackgroundImageDialog", {
                  cropperAspectRatio: cropperAspectRatio,
                })
              }
              hoverText={t("workspace.navigation.changeBackgroundImage")}
            />
          )}
        </ProgressiveBackground>
      )}
      <PlaceableBackground
        className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto relative !bg-inset mt-[-12px] border border-foreground/30 rounded-t-lg"
        zIndex={DashboardElementZIndexes.placeableBackground}
        frameSizeSource="horizontal"
        rightInset={1}
        frameSize={frameSize}
        setFrameSize={setFrameSize}
        widthTotalFrameCount={widthTotalFrameCount}
        heightTotalFrameCount={heightTotalFrameCount + 2}
        frameProps={{
          children: <PlusIcon />,
          zIndex: DashboardElementZIndexes.placeableFrames,
          className: "cursor-pointer",
          gap: frameGap,
          disabled: !isEditing,
          droppableProps: {
            type: DNDType.DraggableWidget,
            hover: (
              draggedItem: Widget,
              monitor: DropTargetMonitor
            ): { widthFrameCount: number; heightFrameCount: number } => {
              if (!monitor.canDrop())
                return { widthFrameCount: 0, heightFrameCount: 0 };
              return (
                // make sure we return the size of the current widget from widgetManager.widgets
                (() => {
                  const draggedWidget = widgetManager
                    .getWidgets()
                    .find(widget => widget.id === draggedItem.id);
                  if (draggedWidget === undefined) return draggedItem.size;
                  return {
                    widthFrameCount: getWidgetWidthFrameCount(
                      draggedWidget,
                      widthTotalFrameCount
                    ),
                    heightFrameCount: draggedWidget.size.heightFrameCount,
                  };
                })()
              );
            },
            canDrop: (
              draggedItem: Widget,
              _: DropTargetMonitor,
              position: FrameCountPosition
            ) => {
              // make sure we get the current widget from widgetManager.widgets
              const draggedWidget = widgetManager
                .getWidgets()
                .find(widget => widget.id === draggedItem.id);
              if (draggedWidget === undefined) return false;
              const nextPosition = {
                ...position,
                leftFrameCount:
                  draggedWidget.layoutMode === "full-width"
                    ? 0
                    : position.leftFrameCount,
              };
              return !isWidgetConflicted({
                ...draggedWidget,
                position: nextPosition,
              });
            },
            drop: (
              draggedItem: Widget,
              _: DropTargetMonitor,
              position: FrameCountPosition
            ) => {
              const draggedWidget = widgetManager
                .getWidgets()
                .find(widget => widget.id === draggedItem.id);
              if (draggedWidget === undefined) return;
              const nextPosition = {
                ...position,
                leftFrameCount:
                  draggedWidget.layoutMode === "full-width"
                    ? 0
                    : position.leftFrameCount,
              };
              widgetManager.updateByWidget(draggedWidget, "position", {
                ...nextPosition,
              });
            },
          },
          onClick: (position: FrameCountPosition) => {
            setCreateWidgetAtBottom(false);
            setCurrentFramePosition(position);
            setCreateWidgetDialogOpen(true);
          },
        }}
      >
        {widgetManager.getWidgets().map((widget, index) => {
          const widgetWidthFrameCount = getWidgetWidthFrameCount(
            widget,
            widthTotalFrameCount
          );
          const widgetLeftFrameCount =
            widget.layoutMode === "full-width"
              ? 0
              : widget.position.leftFrameCount;
          const widgetWidth = getSizeValue(
            widgetWidthFrameCount,
            frameSize,
            frameGap
          );
          const widgetHeight = getSizeValue(
            widget.size.heightFrameCount,
            frameSize,
            frameGap
          );

          return (
            <Draggable // a draggable wrapper to locate the widget base on the correct position
              key={index}
              style={{
                left: getPositionValue(
                  widgetLeftFrameCount,
                  frameSize,
                  frameGap
                ),
                top: getPositionValue(
                  widget.position.topFrameCount,
                  frameSize,
                  frameGap
                ),
                width:
                  index === currentResizedWidgetInfo.index
                    ? currentResizedWidgetInfo.width
                    : getSizeValue(widgetWidthFrameCount, frameSize, frameGap),
                height:
                  index === currentResizedWidgetInfo.index
                    ? currentResizedWidgetInfo.height
                    : getSizeValue(
                        widget.size.heightFrameCount,
                        frameSize,
                        frameGap
                      ),
                zIndex: DashboardElementZIndexes.widgets.draggable,
              }}
              className="absolute shadow rounded-lg bg-transparent"
              type={DNDType.DraggableWidget}
              item={widget}
              canDrag={isEditing}
            >
              <XYResizable
                style={{ zIndex: DashboardElementZIndexes.widgets.resizable }}
                width={
                  index === currentResizedWidgetInfo.index
                    ? currentResizedWidgetInfo.width
                    : getSizeValue(widgetWidthFrameCount, frameSize, frameGap)
                }
                setWidth={(newWidth: number) =>
                  setCurrentResizedWidgetInfo(prev => ({
                    ...prev,
                    width: newWidth,
                  }))
                }
                minWidth={
                  widget.layoutMode === "full-width"
                    ? widgetWidth
                    : getSizeValue(
                        widget.minSize.widthFrameCount,
                        frameSize,
                        frameGap
                      )
                }
                minHeight={getSizeValue(
                  widget.minSize.heightFrameCount,
                  frameSize,
                  frameGap
                )}
                maxWidth={
                  widget.layoutMode === "full-width"
                    ? widgetWidth
                    : getSizeValue(
                        widget.maxSize.widthFrameCount,
                        frameSize,
                        frameGap
                      )
                }
                maxHeight={getSizeValue(
                  widget.maxSize.heightFrameCount,
                  frameSize,
                  frameGap
                )}
                height={
                  index === currentResizedWidgetInfo.index
                    ? currentResizedWidgetInfo.height
                    : getSizeValue(
                        widget.size.heightFrameCount,
                        frameSize,
                        frameGap
                      )
                }
                setHeight={(newHeight: number) =>
                  setCurrentResizedWidgetInfo(prev => ({
                    ...prev,
                    height: newHeight,
                  }))
                }
                onBeforeResize={() =>
                  setCurrentResizedWidgetInfo({
                    width: widgetWidth,
                    height: widgetHeight,
                    index: index,
                  })
                }
                onResize={(
                  width: number,
                  height: number
                ): { availableWidth: number; availableHeight: number } => {
                  const resizedWidget = widgetManager
                    .getWidgets()
                    .find(currentWidget => currentWidget.id === widget.id); // make sure we get the current widget from the widgetManager.widgets
                  if (resizedWidget === undefined) {
                    return {
                      availableWidth: 0,
                      availableHeight: 0,
                    };
                  }
                  return handleWidgetOnResize(width, height, resizedWidget)
                    .size;
                }}
                onAfterResize={(width: number, height: number) => {
                  const resizedWidget = widgetManager
                    .getWidgets()
                    .find(currentWidget => currentWidget.id === widget.id); // make sure we get the current widget from the widgetManager.widgets
                  if (resizedWidget === undefined) return;
                  const resizedFrameCount = handleWidgetOnResize(
                    width,
                    height,
                    resizedWidget
                  ).frameCount;
                  widgetManager.update(index, "size", resizedFrameCount);
                  setCurrentResizedWidgetInfo({
                    width: 0,
                    height: 0,
                    index: -1,
                  });
                }}
                size={2.5}
                disabled={!isEditing}
                hasParent
              >
                <Extendable
                  className="w-4 h-4 top-2! right-2! bg-transparent!"
                  style={{
                    zIndex: DashboardElementZIndexes.widgets.extendable,
                  }}
                  size={24}
                  disabled={!isEditing}
                  optionMenuItems={
                    <>
                      {widget.isEditable && (
                        <DropdownMenuItem
                          onClick={() => setEditingWidgetIndex(index)}
                        >
                          {t("common.edit")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => widgetManager.remove(index)}
                      >
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </>
                  }
                  hasParent
                >
                  <widget.component
                    style={{
                      width: widgetWidth,
                      height: widgetHeight,
                    }}
                    className="
                    w-full h-full
                    bg-card border border-foreground/25 rounded-lg
                    transition-all duration-200 ease-in-out
                  "
                    isWidgetEditing={isEditing && editingWidgetIndex === index}
                    onIsWidgetEditingChange={(prevIsWidgetEditing: boolean) =>
                      setEditingWidgetIndex(prevIsWidgetEditing ? index : -1)
                    }
                    setting={widget.setting}
                    setSetting={(newSetting: any) =>
                      widgetManager.update(index, "setting", newSetting)
                    }
                    data={widget.data}
                    setData={(newData: any) =>
                      widgetManager.update(index, "data", newData)
                    }
                    sync={widgetManager.sync}
                  />
                </Extendable>
              </XYResizable>
            </Draggable>
          );
        })}
        <div
          className="fixed right-4 bottom-4 flex justify-center items-center gap-2"
          style={{ zIndex: DashboardElementZIndexes.editButtons }}
        >
          {hasSomeWidgetsOutOfBoundary && (
            <Button
              variant="secondary"
              className="
                flex justify-center items-center
                border border-foreground/30 rounded-full shadow-lg w-10 h-10
                transition
              "
              onClick={handleReorderWidgetsToFitInBoundary}
            >
              <WrenchIcon />
            </Button>
          )}
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                className="
                  flex justify-center items-center
                  border border-foreground/30 rounded-full shadow-lg w-10 h-10
                  transition
                "
                onClick={() => {
                  setCreateWidgetAtBottom(true);
                  setCreateWidgetDialogOpen(true);
                }}
              >
                <PlusIcon />
              </Button>
              <Button
                variant="secondary"
                className="flex justify-center items-center border border-foreground/30 rounded-full shadow-lg w-10 h-10 transition"
                onClick={() => updateDashboardWidth(-1)}
                disabled={widthTotalFrameCount <= MinDashboardWidthFrameCount}
                aria-label={t("settingsPage.preferences.dashboard.reduceWidth")}
                title={t("settingsPage.preferences.dashboard.reduceWidth")}
              >
                <ChevronsRightLeftIcon size={18} />
              </Button>
              <Button
                variant="secondary"
                className="flex justify-center items-center border border-foreground/30 rounded-full shadow-lg w-10 h-10 transition"
                onClick={() => updateDashboardWidth(1)}
                disabled={widthTotalFrameCount >= MaxDashboardWidthFrameCount}
                aria-label={t("settingsPage.preferences.dashboard.expandWidth")}
                title={t("settingsPage.preferences.dashboard.expandWidth")}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m7 7-5 5 5 5M17 7l5 5-5 5M8 12h8" />
                </svg>
              </Button>
              <Button
                variant="secondary"
                className="
                  flex justify-center items-center
                  border border-foreground/30 rounded-full shadow-lg w-10 h-10
                  transition
                "
                onClick={() => {
                  widgetManager.sync();
                  setIsEditing(false);
                }}
              >
                <CheckIcon size={18} />
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              className="
                flex justify-center items-center
                border border-foreground/30 rounded-full shadow-lg w-10 h-10
                transition
              "
              onClick={() => setIsEditing(true)}
            >
              <EditIcon size={18} />
            </Button>
          )}
        </div>
      </PlaceableBackground>
    </div>
  );
};

export default DashboardPage;
