export type GuideData = {
  completedSteps: Record<string, boolean>;
};

export const getDefaultGuideData = (): GuideData => ({
  completedSteps: {},
});
