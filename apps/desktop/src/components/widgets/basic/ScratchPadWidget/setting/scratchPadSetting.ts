export type ScratchPadSetting = {
  fontSize: number;
};

export const getDefaultScratchPadSetting = (): ScratchPadSetting => {
  return {
    fontSize: 12,
  };
};
