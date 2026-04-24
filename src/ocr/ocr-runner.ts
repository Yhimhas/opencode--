import { defaultOcrConfig, type LanguageHint, type OcrConfig } from "../config/ocr";
import { buildFallbackLanguages, selectPrimaryLanguages } from "./language-policy";
import { preprocess } from "./preprocess";

export interface OcrRunInput {
  imageId: string;
  image: Uint8Array;
  languageHint?: LanguageHint;
  textHint?: string;
  isSmallText?: boolean;
}

export interface OcrAttemptResult {
  text: string;
  confidence: number;
}

export interface OcrEngine {
  recognize(params: { image: Uint8Array; langs: string }): Promise<OcrAttemptResult>;
}

export interface OcrRunResult {
  text: string;
  confidence: number;
  usedLangs: string;
  usedPreprocess: "fast" | "accurate";
  attemptCount: number;
}

interface AttemptTrace {
  langs: string;
  mode: "fast" | "accurate";
  confidence: number;
  elapsedMs: number;
}

function logAttempt(imageId: string, trace: AttemptTrace, fallbackTriggered: boolean): void {
  console.info(
    JSON.stringify({
      scope: "ocr",
      imageId,
      langs: trace.langs,
      mode: trace.mode,
      confidence: trace.confidence,
      elapsedMs: trace.elapsedMs,
      fallbackTriggered,
    }),
  );
}

export async function runOcrWithFallback(
  engine: OcrEngine,
  input: OcrRunInput,
  config: OcrConfig = defaultOcrConfig,
): Promise<OcrRunResult> {
  const primaryLangs = selectPrimaryLanguages(
    { languageHint: input.languageHint, textHint: input.textHint },
    config,
  );
  const fallbackLangs = buildFallbackLanguages(primaryLangs, config);
  const attempts: { langs: string; mode: "fast" | "accurate" }[] = [
    { langs: primaryLangs, mode: "fast" },
    { langs: primaryLangs, mode: "accurate" },
    { langs: fallbackLangs[0] ?? primaryLangs, mode: "accurate" },
  ].slice(0, config.maxAttempts);

  let best: OcrRunResult | undefined;
  for (let i = 0; i < attempts.length; i += 1) {
    const attempt = attempts[i];
    if (!config.enableFallback && i > 0) break;

    const t0 = Date.now();
    const preprocessed = await preprocess(input.image, {
      mode: attempt.mode,
      isSmallText: input.isSmallText,
      scaleForSmallText: config.scaleForSmallText,
    });
    const result = await engine.recognize({
      image: preprocessed.image,
      langs: attempt.langs,
    });
    const elapsedMs = Date.now() - t0;

    const current: OcrRunResult = {
      text: result.text,
      confidence: result.confidence,
      usedLangs: attempt.langs,
      usedPreprocess: attempt.mode,
      attemptCount: i + 1,
    };

    if (!best || current.confidence > best.confidence) {
      best = current;
    }

    logAttempt(
      input.imageId,
      {
        langs: attempt.langs,
        mode: attempt.mode,
        confidence: result.confidence,
        elapsedMs,
      },
      i > 0,
    );

    if (result.confidence >= config.confidenceThreshold) {
      return current;
    }
  }

  if (!best) {
    throw new Error("OCR failed: no attempts were executed.");
  }

  return best;
}
