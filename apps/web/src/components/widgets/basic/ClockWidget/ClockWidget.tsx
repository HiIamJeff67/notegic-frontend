import { TimeZones } from "@widgets/basic/ClockWidget/data/timeZones";
import {
  ClockSetting,
  getDefaultClockSetting,
} from "@widgets/basic/ClockWidget/setting/clockSetting";
import { WidgetProps } from "@widgets/widget";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnyTypeState } from "@/hooks/useAnyTypeState";
import { formatTimezoneDisplayName } from "@shared/i18n/workspace";
import EditClockWidgetDialog from "./EditClockWidgetDialog";

const ClockWidget = ({
  className,
  style,
  isWidgetEditing,
  onIsWidgetEditingChange,
  setting: rawSetting,
  setSetting: setRawSetting,
}: WidgetProps) => {
  const { i18n } = useTranslation();
  const [time, setTime] = useState(() => new Date());
  const [setting, setSetting] = useAnyTypeState<ClockSetting>(
    [rawSetting, setRawSetting],
    getDefaultClockSetting()
  );

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), setting.timerInterval);
    return () => clearInterval(timer);
  }, []);

  const targetTime = useMemo(() => {
    const timeZone = TimeZones.find(
      tz => tz.locale === setting.selectedTimeZone.locale
    );
    if (!timeZone) return time;

    const utcTime = time.getTime() + time.getTimezoneOffset() * 60000;
    return new Date(utcTime + timeZone.offset * 3600000);
  }, [time, setting]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full h-full p-2 ${className}`}
      style={style}
    >
      <EditClockWidgetDialog
        open={isWidgetEditing}
        onOpenChange={onIsWidgetEditingChange}
        setting={setting}
        setSetting={setSetting}
      />
      <div className="flex-1 w-full flex items-center justify-center min-h-0 min-w-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <circle
            cx="50"
            cy="50"
            r="48"
            strokeWidth="2"
            className={setting.selectedClockStyle.properties.face}
          />
          {setting.selectedClockStyle.name === "classic" &&
            Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="6"
                x2="50"
                y2="10"
                className="stroke-foreground"
                strokeWidth="2"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="25"
            className={setting.selectedClockStyle.properties.hour}
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${(targetTime.getHours() % 12) * 30 + targetTime.getMinutes() * 0.5} 50 50)`}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            className={setting.selectedClockStyle.properties.minute}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${targetTime.getMinutes() * 6 + targetTime.getSeconds() * 0.1} 50 50)`}
          />
          <line
            x1="50"
            y1="55"
            x2="50"
            y2="10"
            className={setting.selectedClockStyle.properties.second}
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${targetTime.getSeconds() * 6} 50 50)`}
          />
          <circle
            cx="50"
            cy="50"
            r="3"
            className={setting.selectedClockStyle.properties.center}
          />
        </svg>
      </div>

      {(setting.enableTimer || setting.enableLocale) && (
        <div className="mt-1 text-[10px] sm:text-xs font-mono text-foreground/80 flex flex-col items-center shrink-0">
          {setting.enableTimer && (
            <span
              className="font-semibold tracking-wider"
              style={{ fontSize: setting.timerFontSize }}
            >
              {targetTime.toLocaleTimeString(i18n.resolvedLanguage, {
                hour12: false,
              })}
            </span>
          )}
          {setting.enableLocale && (
            <span className="opacity-80 flex flex-wrap justify-center items-center gap-1">
              <span
                className="text-foreground font-bold whitespace-nowrap"
                style={{ fontSize: setting.localeFontSize }}
              >
                {formatTimezoneDisplayName(
                  setting.selectedTimeZone.locale,
                  i18n.resolvedLanguage
                )}
              </span>
              <span
                className="text-muted-foreground whitespace-nowrap"
                style={{ fontSize: setting.localeFontSize }}
              >
                (UTC{setting.selectedTimeZone.offset >= 0 ? "+" : ""}
                {setting.selectedTimeZone.offset})
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ClockWidget;
