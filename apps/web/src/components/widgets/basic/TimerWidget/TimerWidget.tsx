import { clamp } from "@shared/util/math";
import {
  getDefaultTimerData,
  TimerData,
  TimerRecord,
} from "@widgets/basic/TimerWidget/data/timerData";
import {
  getDefaultTimerSetting,
  TimerSetting,
} from "@widgets/basic/TimerWidget/setting/timerSetting";
import { WidgetProps } from "@widgets/widget";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useAnyTypeState } from "@/hooks/useAnyTypeState";
import EditTimerWidgetDialog from "./EditTimerWidgetDialog";

const getDurationMs = (duration: TimerRecord["duration"]) => {
  return (
    duration.hours * 3600000 +
    duration.minutes * 60000 +
    duration.seconds * 1000
  );
};

const formatTime = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

const TimerWidget = ({
  className,
  style,
  isWidgetEditing,
  onIsWidgetEditingChange,
  setting: rawSetting,
  setSetting: setRawSetting,
  data: rawData,
  setData: setRawData,
  sync,
}: WidgetProps) => {
  const { t } = useTranslation();
  const [setting, setSetting] = useAnyTypeState<TimerSetting>(
    [rawSetting, setRawSetting],
    getDefaultTimerSetting()
  );
  const [data, setData] = useAnyTypeState<TimerData>(
    [rawData, setRawData],
    getDefaultTimerData()
  );

  const [status, setStatus] = useState(data.current?.status || "initialized");
  const [endTime, setEndTime] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    getDurationMs(
      data.current?.duration || getDefaultTimerData().current.duration
    )
  );
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [editDuration, setEditDuration] = useState(data.current.duration);

  const saveDuration = () => {
    setData(prev => ({
      ...prev,
      current: { ...prev.current, duration: editDuration },
    }));
    setRemainingMs(getDurationMs(editDuration));
    setIsEditingDuration(false);
    sync();
  };

  const start = (duration: TimerRecord["duration"]) => {
    const ms = getDurationMs(duration);
    setRemainingMs(ms);
    setEndTime(Date.now() + ms);
    setStatus("running");

    const newRecord: TimerRecord = {
      duration,
      status: "running",
      timestamp: new Date(),
    };

    setData(prev => {
      const filteredHistory = prev.history.filter(
        h =>
          h.duration.hours !== duration.hours ||
          h.duration.minutes !== duration.minutes ||
          h.duration.seconds !== duration.seconds
      );

      return {
        ...prev,
        current: newRecord,
        history: [newRecord, ...filteredHistory].slice(0, 10),
      };
    });
  };

  const pause = () => {
    setStatus("paused");
    setData(prev => ({
      ...prev,
      current: { ...prev.current, status: "paused" },
    }));
  };

  const resume = () => {
    setEndTime(Date.now() + remainingMs);
    setStatus("running");
    setData(prev => ({
      ...prev,
      current: { ...prev.current, status: "running" },
    }));
  };

  const reset = () => {
    const ms = getDurationMs(data.current.duration);
    setRemainingMs(ms);
    setStatus("initialized");
    setData(prev => ({
      ...prev,
      current: { ...prev.current, status: "initialized" },
    }));
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (status === "running" && endTime !== null) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, endTime - now);

        setRemainingMs(timeLeft);

        if (timeLeft === 0) {
          setStatus("ended");
          setData(prev => ({
            ...prev,
            current: { ...prev.current, status: "ended" },
          }));
        }
      }, 100);
    }

    return () => clearInterval(intervalId);
  }, [status, endTime, setData]);

  return (
    <div
      className={`
        flex flex-col justify-around items-center
        w-full h-full p-6
        overflow-hidden bg-background rounded-lg ${className}
      `}
      style={style}
    >
      <EditTimerWidgetDialog
        open={isWidgetEditing}
        onOpenChange={onIsWidgetEditingChange}
        setting={setting}
        setSetting={setSetting}
      />

      {isEditingDuration ? (
        <div className="flex gap-2 items-center justify-center font-bold text-xl">
          <Input
            type="number"
            min={0}
            max={99}
            placeholder="0"
            value={clamp(editDuration.hours, 0, 99).toString() || ""}
            onChange={e =>
              setEditDuration({
                ...editDuration,
                hours: clamp(Number(e.target.value), 0, 99),
              })
            }
            className="w-16 p-1 text-center bg-muted rounded-md border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span>:</span>
          <Input
            type="number"
            min={0}
            max={59}
            placeholder="0"
            value={clamp(editDuration.minutes, 0, 59).toString() || ""}
            onChange={e =>
              setEditDuration({
                ...editDuration,
                minutes: clamp(Number(e.target.value), 0, 59),
              })
            }
            className="w-16 p-1 text-center bg-muted rounded-md border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span>:</span>
          <Input
            type="number"
            min={0}
            max={59}
            placeholder="0"
            value={clamp(editDuration.seconds, 0, 59).toString() || ""}
            onChange={e =>
              setEditDuration({
                ...editDuration,
                seconds: clamp(Number(e.target.value), 0, 59),
              })
            }
            className="w-16 p-1 text-center bg-muted rounded-md border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      ) : (
        <div
          className="w-full font-bold tabular-nums text-center"
          style={{ fontSize: `${setting.counterFontSize}px` }}
        >
          {formatTime(remainingMs)}
        </div>
      )}

      {!setting.isSilence &&
        (isEditingDuration ? (
          <div className="w-full flex justify-center items-center gap-2 mt-2">
            <button
              onClick={saveDuration}
              className="px-4 py-1 bg-primary text-primary-foreground rounded-md hover:opacity-90"
              style={{ fontSize: `${setting.buttonSize ?? 16}px` }}
            >
              {t("workspace.widgets.save")}
            </button>
            <button
              onClick={() => setIsEditingDuration(false)}
              className="px-4 py-1 bg-muted text-foreground border border-foreground/20 rounded-md hover:opacity-90"
              style={{ fontSize: `${setting.buttonSize ?? 16}px` }}
            >
              {t("workspace.widgets.cancel")}
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-center items-center gap-2 mt-2">
            {status === "initialized" && (
              <>
                <button
                  onClick={() => start(data.current.duration)}
                  className="px-4 py-1 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                  style={{ fontSize: `${setting.buttonSize ?? 16}px` }}
                >
                  {t("workspace.widgets.start")}
                </button>
                <button
                  onClick={() => {
                    setEditDuration(data.current.duration);
                    setIsEditingDuration(true);
                  }}
                  className="px-4 py-1 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
                  style={{ fontSize: `${setting.buttonSize ?? 16}px` }}
                >
                  {t("workspace.widgets.edit")}
                </button>
              </>
            )}
            {status === "running" && (
              <button
                onClick={pause}
                className="px-4 py-1 bg-yellow-500 text-white rounded-md hover:opacity-90"
                style={{ fontSize: `${setting.buttonSize ?? 16}px` }}
              >
                {t("workspace.widgets.pause")}
              </button>
            )}
            {status === "paused" && (
              <button
                onClick={resume}
                className="px-4 py-1 bg-green-500 text-white rounded-md hover:opacity-90"
                style={{ fontSize: `${setting.buttonSize ?? 16}px` }}
              >
                {t("workspace.widgets.resume")}
              </button>
            )}
            {(status === "running" ||
              status === "paused" ||
              status === "ended") && (
              <button
                onClick={reset}
                className="px-4 py-1 bg-gray-500 text-white rounded-md hover:opacity-90"
                style={{ fontSize: `${setting.buttonSize ?? 16}px` }}
              >
                {t("workspace.widgets.reset")}
              </button>
            )}
          </div>
        ))}
    </div>
  );
};

export default TimerWidget;
