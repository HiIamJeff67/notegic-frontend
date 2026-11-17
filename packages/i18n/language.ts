export const supportedLanguages = ["en", "zh-TW", "zh-CN", "ja", "ko"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const isSupportedLanguage = (
  value: unknown
): value is SupportedLanguage =>
  typeof value === "string" &&
  supportedLanguages.includes(value as SupportedLanguage);
