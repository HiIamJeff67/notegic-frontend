import { EnglishCommonTranslation } from "./locales/common.en";
import { JapaneseCommonTranslation } from "./locales/common.ja";
import { KoreanCommonTranslation } from "./locales/common.ko";
import { SimpleChineseCommonTranslation } from "./locales/common.zh-CN";
import { TraditionalChineseCommonTranslation } from "./locales/common.zh-TW";
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

export { isSupportedLanguage, supportedLanguages } from "./language";
export type { SupportedLanguage } from "./language";

export const resources = {
  en: {
    translation: {
      ...EnglishCommonTranslation,
      ...EnglishSettingsTranslation,
      workspace: EnglishWorkspaceTranslation,
    },
  },
  "zh-TW": {
    translation: {
      ...TraditionalChineseCommonTranslation,
      ...TraditionalChineseSettingsTranslation,
      workspace: TraditionalChineseWorkspaceTranslation,
    },
  },
  "zh-CN": {
    translation: {
      ...SimpleChineseCommonTranslation,
      ...SimpleChineseSettingsTranslation,
      workspace: SimpleChineseWorkspaceTranslation,
    },
  },
  ja: {
    translation: {
      ...JapaneseCommonTranslation,
      ...JapaneseSettingsTranslation,
      workspace: JapaneseWorkspaceTranslation,
    },
  },
  ko: {
    translation: {
      ...KoreanCommonTranslation,
      ...KoreanSettingsTranslation,
      workspace: KoreanWorkspaceTranslation,
    },
  },
} as const;
