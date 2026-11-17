export type TimerSetting = {
  counterFontSize: number;
  buttonSize: number;
  isSilence: boolean;
};

export const getDefaultTimerSetting = (): TimerSetting => {
  return {
    counterFontSize: 16,
    buttonSize: 12,
    isSilence: false,
  };
};
