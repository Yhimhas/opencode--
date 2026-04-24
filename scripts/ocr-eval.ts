import { defaultOcrConfig } from "../src/config/ocr";
import { runOcrWithFallback, type OcrEngine } from "../src/ocr/ocr-runner";

export interface EvalSample {
  imageId: string;
  image: Uint8Array;
  groundTruth: string;
  languageHint?: "auto" | "zh" | "zh_tra" | "jp" | "kr" | "mixed";
}

export interface EvalMetrics {
  sampleCount: number;
  averageCer: number;
  averageWer: number;
  averageElapsedMs: number;
  fallbackTriggerRate: number;
}

function levenshtein(a: string[], b: string[]): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[a.length][b.length];
}

function calcCer(predicted: string, expected: string): number {
  const refChars = Array.from(expected);
  if (refChars.length === 0) return 0;
  return levenshtein(Array.from(predicted), refChars) / refChars.length;
}

function calcWer(predicted: string, expected: string): number {
  const refWords = expected.trim().split(/\s+/).filter(Boolean);
  if (refWords.length === 0) return 0;
  const predWords = predicted.trim().split(/\s+/).filter(Boolean);
  return levenshtein(predWords, refWords) / refWords.length;
}

export async function evaluateOcr(
  engine: OcrEngine,
  samples: EvalSample[],
): Promise<EvalMetrics> {
  if (samples.length === 0) {
    throw new Error("samples cannot be empty.");
  }

  let totalCer = 0;
  let totalWer = 0;
  let totalElapsedMs = 0;
  let fallbackTriggeredCount = 0;

  for (const sample of samples) {
    const t0 = Date.now();
    const result = await runOcrWithFallback(
      engine,
      {
        imageId: sample.imageId,
        image: sample.image,
        languageHint: sample.languageHint,
      },
      defaultOcrConfig,
    );
    totalElapsedMs += Date.now() - t0;
    totalCer += calcCer(result.text, sample.groundTruth);
    totalWer += calcWer(result.text, sample.groundTruth);
    if (result.attemptCount > 1) {
      fallbackTriggeredCount += 1;
    }
  }

  return {
    sampleCount: samples.length,
    averageCer: totalCer / samples.length,
    averageWer: totalWer / samples.length,
    averageElapsedMs: totalElapsedMs / samples.length,
    fallbackTriggerRate: fallbackTriggeredCount / samples.length,
  };
}
