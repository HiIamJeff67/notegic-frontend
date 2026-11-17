export const pageTitleLimit = 32;

export const pageTitle = (label: string) => {
  const trimmed = label.trim();
  if (!trimmed) return "Notegic";

  const visible =
    trimmed.length > pageTitleLimit
      ? `${trimmed.slice(0, pageTitleLimit).trimEnd()}...`
      : trimmed;
  return `${visible} | Notegic`;
};
