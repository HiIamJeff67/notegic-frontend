import {
  ClockStyle,
  ClockStyles,
} from "@widgets/basic/ClockWidget/data/clockStyles";
import { TimeZone, TimeZones } from "@widgets/basic/ClockWidget/data/timeZones";

export type ClockSetting = {
  selectedTimeZone: TimeZone;
  selectedClockStyle: ClockStyle;
  enableTimer: boolean;
  timerFontSize: number;
  timerInterval: number;
  enableLocale: boolean;
  localeFontSize: number;
};

export const getDefaultClockSetting = (): ClockSetting => {
  return {
    selectedTimeZone: TimeZones[0],
    selectedClockStyle: ClockStyles[0],
    enableTimer: true,
    timerFontSize: 10,
    timerInterval: 1000,
    enableLocale: true,
    localeFontSize: 10,
  };
};
