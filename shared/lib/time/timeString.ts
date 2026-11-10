export const timeStringToDate = (time: string): Date => {
  const [hours = "0", minutes = "0"] = time.split(":");
  return new Date(2000, 0, 1, Number(hours), Number(minutes), 0, 0);
};

export const dateToTimeString = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

export const minutesToTimeString = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60
  ).padStart(2, "0")}`;

export const timeToMinutes = (value: string) => {
  const [hours = "", minutes = ""] = value.split(":");
  const hour = Number(hours);
  const minute = Number(minutes);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
};

export const isQuietHours = (now: Date, start: string, end: string) => {
  const startMinute = timeToMinutes(start);
  const endMinute = timeToMinutes(end);
  if (startMinute === null || endMinute === null || startMinute === endMinute) {
    return false;
  }

  const currentMinute = now.getHours() * 60 + now.getMinutes();
  return startMinute < endMinute
    ? currentMinute >= startMinute && currentMinute < endMinute
    : currentMinute >= startMinute || currentMinute < endMinute;
};
