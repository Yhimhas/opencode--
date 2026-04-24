export type LanguageHint = "auto" | "zh" | "zh_tra" | "jp" | "kr" | "mixed";

export type PreprocessMode = "fast" | "accurate";

export interface OcrConfig {
  defaultLanguages: string;
  backupLanguages: string[];
  languageProfiles: Record<Exclude<LanguageHint, "auto">, string>;
  enableLanguageHint: boolean;
  preprocessMode: PreprocessMode;
  scaleForSmallText: number;
  confidenceThreshold: number;
  maxAttempts: number;
  enableFallback: boolean;
}

export const defaultOcrConfig: OcrConfig = {
  defaultLanguages: "chi_sim+eng",
  backupLanguages: ["chi_tra+eng", "jpn+eng", "kor+eng"],
  languageProfiles: {
    zh: "chi_sim+eng",
    zh_tra: "chi_tra+eng",
    jp: "jpn+eng",
    kr: "kor+eng",
    mixed: "chi_sim+eng",
  },
  enableLanguageHint: true,
  preprocessMode: "fast",
  scaleForSmallText: 1.5,
  confidenceThreshold: 0.75,
  maxAttempts: 3,
  enableFallback: true,
};
