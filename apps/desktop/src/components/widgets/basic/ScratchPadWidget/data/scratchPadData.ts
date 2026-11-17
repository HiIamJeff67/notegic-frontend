export type ScratchPadData = {
  content: string;
};

export const getDefaultScratchPadData = (content?: string): ScratchPadData => {
  return {
    content: content ?? "",
  };
};
