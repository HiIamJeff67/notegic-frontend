export type TimerStatus = "initialized" | "running" | "paused" | "ended";

export interface TimerRecord {
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  status: TimerStatus;
  timestamp: Date;
}

export type TimerData = {
  current: TimerRecord;
  history: TimerRecord[];
};

export const getDefaultTimerData = (current?: TimerRecord): TimerData => {
  return {
    current: current ?? {
      duration: {
        hours: 0,
        minutes: 30,
        seconds: 0,
      },
      status: "initialized",
      timestamp: new Date(),
    },
    history: current !== undefined ? [current] : [],
  };
};
