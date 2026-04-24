import { createWorker } from "tesseract.js";
import type { OcrAttemptResult, OcrEngine } from "./ocr-runner";

export interface TesseractEngineOptions {
  cachePath?: string;
  logger?: (message: unknown) => void;
}

function normalizeConfidence(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  if (value > 1) {
    return Math.max(0, Math.min(1, value / 100));
  }
  return Math.max(0, Math.min(1, value));
}

export interface ClosableOcrEngine extends OcrEngine {
  close(): Promise<void>;
}

/**
 * 真实 OCR 引擎适配器（tesseract.js）。
 * - 与 runOcrWithFallback 的 OcrEngine 接口对齐
 * - 自动按 langs 复用/切换 worker 语言
 */
export async function createTesseractEngine(
  options: TesseractEngineOptions = {},
): Promise<ClosableOcrEngine> {
  let currentLangs = "";
  const worker = await createWorker(currentLangs || "eng", 1, {
    cachePath: options.cachePath,
    logger: options.logger,
  });

  async function ensureLanguage(langs: string): Promise<void> {
    if (!langs || langs === currentLangs) {
      return;
    }

    await worker.reinitialize(langs);
    currentLangs = langs;
  }

  return {
    async recognize(params: { image: Uint8Array; langs: string }): Promise<OcrAttemptResult> {
      await ensureLanguage(params.langs);
      const result = await worker.recognize(params.image);
      const text = result.data?.text ?? "";
      const confidence = normalizeConfidence(result.data?.confidence);
      return { text, confidence };
    },
    async close(): Promise<void> {
      await worker.terminate();
    },
  };
}
