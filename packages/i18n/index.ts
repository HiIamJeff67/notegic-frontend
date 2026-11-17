import { EnglishCommonTranslation } from "./locales/common.en";
import { JapaneseCommonTranslation } from "./locales/common.ja";
import { KoreanCommonTranslation } from "./locales/common.ko";
import { SimpleChineseCommonTranslation } from "./locales/common.zh-CN";
import { TraditionalChineseCommonTranslation } from "./locales/common.zh-TW";
import { EnglishServerTranslation } from "./locales/server.en";
import { JapaneseServerTranslation } from "./locales/server.ja";
import { KoreanServerTranslation } from "./locales/server.ko";
import { SimpleChineseServerTranslation } from "./locales/server.zh-CN";
import { TraditionalChineseServerTranslation } from "./locales/server.zh-TW";
import { EnglishSettingsTranslation } from "./locales/settings.en";
import { JapaneseSettingsTranslation } from "./locales/settings.ja";
import { KoreanSettingsTranslation } from "./locales/settings.ko";
import { SimpleChineseSettingsTranslation } from "./locales/settings.zh-CN";
import { TraditionalChineseSettingsTranslation } from "./locales/settings.zh-TW";
import { EnglishWorkspaceTranslation } from "./locales/workspace.en";
import { JapaneseWorkspaceTranslation } from "./locales/workspace.ja";
import { KoreanWorkspaceTranslation } from "./locales/workspace.ko";
import { SimpleChineseWorkspaceTranslation } from "./locales/workspace.zh-CN";
import { TraditionalChineseWorkspaceTranslation } from "./locales/workspace.zh-TW";

export type { SupportedLanguage } from "./language";
export { isSupportedLanguage, supportedLanguages } from "./language";

export const resources = {
  en: {
    translation: {
      ...EnglishCommonTranslation,
      ...EnglishSettingsTranslation,
      server: EnglishServerTranslation,
      workspace: EnglishWorkspaceTranslation,
    },
  },
  "zh-TW": {
    translation: {
      ...TraditionalChineseCommonTranslation,
      ...TraditionalChineseSettingsTranslation,
      server: TraditionalChineseServerTranslation,
      workspace: TraditionalChineseWorkspaceTranslation,
    },
  },
  "zh-CN": {
    translation: {
      ...SimpleChineseCommonTranslation,
      ...SimpleChineseSettingsTranslation,
      server: SimpleChineseServerTranslation,
      workspace: SimpleChineseWorkspaceTranslation,
    },
  },
  ja: {
    translation: {
      ...JapaneseCommonTranslation,
      ...JapaneseSettingsTranslation,
      server: JapaneseServerTranslation,
      workspace: JapaneseWorkspaceTranslation,
    },
  },
  ko: {
    translation: {
      ...KoreanCommonTranslation,
      ...KoreanSettingsTranslation,
      server: KoreanServerTranslation,
      workspace: KoreanWorkspaceTranslation,
    },
  },
} as const;
