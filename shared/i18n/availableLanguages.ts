import { Language } from "@shared/api/interfaces/enums";

export interface LanguageData {
  key: Language;
  nativeName: string;
  code: string;
}

// since the support languages are not large, we can just build their map here
export const LanguageKeyMap: Record<Language, LanguageData> = {
  English: {
    key: Language.English,
    nativeName: "English",
    code: "en",
  },
  TraditionalChinese: {
    key: Language.TraditionalChinese,
    nativeName: "繁體中文",
    code: "zh-TW",
  },
  SimpleChinese: {
    key: Language.SimpleChinese,
    nativeName: "简体中文",
    code: "zh-CN",
  },
  Japanese: {
    key: Language.Japanese,
    nativeName: "日本語",
    code: "ja",
  },
  Korean: {
    key: Language.Korean,
    nativeName: "한국어",
    code: "ko",
  },
};

export const AllLanguageData = Object.values(LanguageKeyMap);
