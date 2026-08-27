export type TodoSetting = {
  titleFontSize: number;
  itemFontSize: number;
  itemHeight: number;
};

export const getDefaultTodoSetting = (): TodoSetting => {
  return {
    titleFontSize: 16,
    itemFontSize: 12,
    itemHeight: 26,
  };
};
