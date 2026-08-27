import CalendarWidget from "@widgets/basic/CalendarWidget/CalendarWidget";
import ClockWidget from "@widgets/basic/ClockWidget/ClockWidget";
import TodoWidget from "@widgets/basic/TodoWidget/TodoWidget";
import { PreviewWidget } from "@widgets/widget";
import { getDefaultClockSetting } from "@/components/widgets/basic/ClockWidget/setting/clockSetting";
import GuideWidget from "../guide/GuideWidget";
import VideoGuideWidget from "../guide/VideoGuideWidget";
import { getDefaultScratchPadData } from "./ScratchPadWidget/data/scratchPadData";
import ScratchPadWidget from "./ScratchPadWidget/ScratchPadWidget";
import { getDefaultScratchPadSetting } from "./ScratchPadWidget/setting/scratchPadSetting";
import { getDefaultTimerData } from "./TimerWidget/data/timerData";
import { getDefaultTimerSetting } from "./TimerWidget/setting/timerSetting";
import TimerWidget from "./TimerWidget/TimerWidget";
import { getDefaultTodoData } from "./TodoWidget/data/todoData";
import { getDefaultTodoSetting } from "./TodoWidget/setting/todoSetting";

export const BasicPreviewWidgets: Record<string, PreviewWidget> = {
  clock: {
    name: "clock",
    component: ClockWidget,
    size: {
      widthFrameCount: 1,
      heightFrameCount: 1,
    },
    minSize: {
      widthFrameCount: 1,
      heightFrameCount: 1,
    },
    maxSize: {
      widthFrameCount: 2,
      heightFrameCount: 2,
    },
    availableSizes: [
      { widthFrameCount: 1, heightFrameCount: 1 },
      { widthFrameCount: 2, heightFrameCount: 2 },
    ],
    defaultSetting: getDefaultClockSetting(),
    defaultData: {},
    isEditable: true,
  },
  timer: {
    name: "timer",
    component: TimerWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 1,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 1,
    },
    maxSize: {
      widthFrameCount: 4,
      heightFrameCount: 4,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 1 },
      { widthFrameCount: 2, heightFrameCount: 2 },
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 2 },
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 6 },
    ],
    defaultSetting: getDefaultTimerSetting(),
    defaultData: getDefaultTimerData(),
    isEditable: true,
  },
  todo: {
    name: "todo",
    component: TodoWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    maxSize: {
      widthFrameCount: 4,
      heightFrameCount: 6,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 2, heightFrameCount: 4 },
      { widthFrameCount: 2, heightFrameCount: 5 },
      { widthFrameCount: 3, heightFrameCount: 4 },
      { widthFrameCount: 3, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 6 },
    ],
    defaultSetting: getDefaultTodoSetting(),
    defaultData: getDefaultTodoData(),
    isEditable: true,
  },
  calendar: {
    name: "calendar",
    component: CalendarWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    maxSize: {
      widthFrameCount: 3,
      heightFrameCount: 4,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
    ],
    defaultSetting: {},
    defaultData: { completedSteps: {} },
    isEditable: false,
  },
  scratchPad: {
    name: "scratchPad",
    component: ScratchPadWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 2,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 2,
    },
    maxSize: {
      widthFrameCount: 4,
      heightFrameCount: 6,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 2 },
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 2, heightFrameCount: 4 },
      { widthFrameCount: 2, heightFrameCount: 5 },
      { widthFrameCount: 2, heightFrameCount: 6 },
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
      { widthFrameCount: 3, heightFrameCount: 5 },
      { widthFrameCount: 3, heightFrameCount: 6 },
      { widthFrameCount: 4, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 6 },
    ],
    defaultSetting: getDefaultScratchPadSetting(),
    defaultData: getDefaultScratchPadData(),
    isEditable: true,
  },
};

export const GuidePreviewWidgets: Record<string, PreviewWidget> = {
  guide: {
    name: "guide",
    component: GuideWidget,
    layoutMode: "full-width",
    size: { widthFrameCount: 3, heightFrameCount: 4 },
    minSize: { widthFrameCount: 2, heightFrameCount: 2 },
    maxSize: { widthFrameCount: 4, heightFrameCount: 5 },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 2 },
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 5 },
    ],
    defaultSetting: {},
    defaultData: { completedSteps: {} },
    isEditable: false,
  },
  videoGuide: {
    name: "videoGuide",
    component: VideoGuideWidget,
    layoutMode: "full-width",
    size: { widthFrameCount: 3, heightFrameCount: 3 },
    minSize: { widthFrameCount: 2, heightFrameCount: 2 },
    maxSize: { widthFrameCount: 4, heightFrameCount: 4 },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 2 },
      { widthFrameCount: 3, heightFrameCount: 2 },
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 4, heightFrameCount: 3 },
      { widthFrameCount: 4, heightFrameCount: 4 },
    ],
    defaultSetting: {},
    defaultData: { videoURL: "" },
    isEditable: false,
  },
};

export const DashboardPreviewWidgets: Record<string, PreviewWidget> = {
  ...BasicPreviewWidgets,
  ...GuidePreviewWidgets,
};
