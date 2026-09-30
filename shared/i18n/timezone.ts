export const formatTimezone = (timezone: string, locale?: string): string => {
  try {
    return (
      new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        timeZoneName: "longGeneric",
      })
        .formatToParts(new Date())
        .find(part => part.type === "timeZoneName")?.value ?? timezone
    );
  } catch {
    return timezone;
  }
};
