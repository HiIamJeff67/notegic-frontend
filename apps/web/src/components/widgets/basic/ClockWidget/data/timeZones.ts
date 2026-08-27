export type TimeZone = {
  index: number;
  displayName: string;
  locale: string;
  offset: number;
};

export const TimeZones: TimeZone[] = [
  // --- Americas ---
  {
    index: 0,
    displayName: "Los Angeles",
    locale: "America/Los_Angeles",
    offset: -8,
  },
  {
    index: 1,
    displayName: "Los Angeles",
    locale: "America/Chicago",
    offset: -6,
  },
  { index: 2, displayName: "New York", locale: "America/New_York", offset: -5 },
  { index: 3, displayName: "Toronto", locale: "America/Toronto", offset: -5 },
  {
    index: 4,
    displayName: "Sao Paulo",
    locale: "America/Sao_Paulo",
    offset: -3,
  },
  {
    index: 5,
    displayName: "Buenos_Aires",
    locale: "America/Buenos_Aires",
    offset: -3,
  },

  // --- Europe & Africa ---
  { index: 6, displayName: "UTC", locale: "UTC", offset: 0 },
  { index: 7, displayName: "London", locale: "Europe/London", offset: 0 },
  { index: 8, displayName: "Paris", locale: "Europe/Paris", offset: 1 },
  { index: 9, displayName: "Frankfurt", locale: "Europe/Frankfurt", offset: 1 },
  { index: 10, displayName: "Zurich", locale: "Europe/Zurich", offset: 1 },
  { index: 11, displayName: "Berlin", locale: "Europe/Berlin", offset: 1 },
  {
    index: 12,
    displayName: "Johannesburg",
    locale: "Africa/Johannesburg",
    offset: 2,
  },
  { index: 13, displayName: "Moscow", locale: "Europe/Moscow", offset: 3 },

  // --- Middle East & Asia ---
  { index: 14, displayName: "Dubai", locale: "Asia/Dubai", offset: 4 },
  { index: 15, displayName: "Kolkata", locale: "Asia/Kolkata", offset: 5.5 }, // 印度為半小時時差
  { index: 16, displayName: "Bangkok", locale: "Asia/Bangkok", offset: 7 },
  { index: 17, displayName: "Jakarta", locale: "Asia/Jakarta", offset: 7 },
  { index: 18, displayName: "Hong Kong", locale: "Asia/Hong_Kong", offset: 8 },
  { index: 19, displayName: "Singapore", locale: "Asia/Singapore", offset: 8 },
  { index: 20, displayName: "Shanghai", locale: "Asia/Shanghai", offset: 8 },
  { index: 21, displayName: "Taipei", locale: "Asia/Taipei", offset: 8 },
  { index: 22, displayName: "Tokyo", locale: "Asia/Tokyo", offset: 9 },
  { index: 23, displayName: "Seoul", locale: "Asia/Seoul", offset: 9 },

  // --- Oceania ---
  { index: 24, displayName: "Sydney", locale: "Australia/Sydney", offset: 10 },
  {
    index: 25,
    displayName: "Melbourne",
    locale: "Australia/Melbourne",
    offset: 10,
  },
  {
    index: 26,
    displayName: "Auckland",
    locale: "Pacific/Auckland",
    offset: 12,
  },
];
