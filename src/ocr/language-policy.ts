import type { LanguageHint, OcrConfig } from "../config/ocr";

export interface LanguageSelectionInput {
  languageHint?: LanguageHint;
  textHint?: string;
}

const japanesePattern = /[\u3040-\u30ff]/;
const koreanPattern = /[\uac00-\ud7af]/;
const traditionalChinesePattern = /[\u3400-\u4dbf]/;

export function selectPrimaryLanguages(
  input: LanguageSelectionInput,
  config: OcrConfig,
): string {
  if (!config.enableLanguageHint) {
    return config.defaultLanguages;
  }

  const hint = input.languageHint;
  if (hint && hint !== "auto") {
    return config.languageProfiles[hint];
  }

  const textHint = input.textHint ?? "";
  if (japanesePattern.test(textHint)) {
    return config.languageProfiles.jp;
  }
  if (koreanPattern.test(textHint)) {
    return config.languageProfiles.kr;
  }
  if (traditionalChinesePattern.test(textHint)) {
    return config.languageProfiles.zh_tra;
  }

  return config.defaultLanguages;
}

export function buildFallbackLanguages(
  primaryLanguages: string,
  config: OcrConfig,
): string[] {
  return config.backupLanguages.filter((langs) => langs !== primaryLanguages);
}
