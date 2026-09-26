export const timeStringToDate = (time: string): Date => {
  const [hours = "0", minutes = "0"] = time.split(":");
  return new Date(2000, 0, 1, Number(hours), Number(minutes), 0, 0);
};

export const dateToTimeString = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
