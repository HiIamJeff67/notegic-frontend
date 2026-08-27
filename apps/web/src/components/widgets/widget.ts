import {
  FrameCountPosition,
  FrameCountSize,
  Position,
  Size,
} from "@shared/types/cord";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";
import { CSSProperties } from "react";

export interface WidgetProps {
  className?: string;
  style?: CSSProperties;
  isWidgetEditing: boolean;
  onIsWidgetEditingChange: (isEditing: boolean) => void;
  setting: Record<string, any>;
  setSetting: (newSetting: Record<string, any>) => void;
  data: Record<string, any>;
  setData: (newData: Record<string, any>) => void;
  sync: (syncWidgets?: Widget[]) => void;
}

export type WidgetLayoutMode = "grid" | "full-width";

export type Widget = {
  id: UUID;
  name: string;
  component: React.ComponentType<WidgetProps>;
  position: FrameCountPosition;
  size: FrameCountSize;
  minSize: FrameCountSize;
  maxSize: FrameCountSize;
  // The attribute of `availableSizes` should be sorted
  // (related to the distance of { widthFrameCount: 0, heightFrameCount: 0 })
  // in ascending order by default
  availableSizes: FrameCountSize[];
  setting: Record<string, any>;
  data: Record<string, any>;
  isEditable: boolean;
  layoutMode?: WidgetLayoutMode;
};

export type PreviewWidget = {
  name: string;
  component: React.ComponentType<any>;
  size: FrameCountSize;
  minSize: FrameCountSize;
  maxSize: FrameCountSize;
  availableSizes: FrameCountSize[];
  defaultSetting: Record<string, any>;
  defaultData: Record<string, any>;
  isEditable: boolean;
  layoutMode?: WidgetLayoutMode;
};

export const getWidgetWidthFrameCount = (
  widget: Pick<Widget, "layoutMode" | "size">,
  widthTotalFrameCount: number
) =>
  widget.layoutMode === "full-width"
    ? widthTotalFrameCount
    : widget.size.widthFrameCount;

export const toWidget = (
  previewWidget: PreviewWidget,
  position: FrameCountPosition,
  id: UUID = generateUUID()
): Widget => {
  return {
    ...previewWidget,
    id: id,
    position: position,
    setting: previewWidget.defaultSetting,
    data: previewWidget.defaultData,
  } as Widget;
};

export const getPositionValue = (
  frameCount: number,
  frameSize: number,
  frameGap: number
) => {
  return frameCount * frameSize + frameGap;
};

export const getPositionValues = (
  position: FrameCountPosition,
  frameSize: number,
  frameGap: number
): Position => {
  return {
    left: getPositionValue(position.leftFrameCount, frameSize, frameGap),
    top: getPositionValue(position.topFrameCount, frameSize, frameGap),
  };
};

export const getSizeValue = (
  frameCount: number,
  frameSize: number,
  frameGap: number
) => {
  return frameCount * frameSize - frameGap;
};

export const getSizeValues = (
  size: FrameCountSize,
  frameSize: number,
  frameGap: number
): Size => {
  return {
    width: getSizeValue(size.widthFrameCount, frameSize, frameGap),
    height: getSizeValue(size.heightFrameCount, frameSize, frameGap),
  };
};

export const AccountPreviewWidgets: Record<string, PreviewWidget> = {};
