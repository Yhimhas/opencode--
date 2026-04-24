import type { PreprocessMode } from "../config/ocr";

export interface PreprocessOptions {
  mode: PreprocessMode;
  scaleForSmallText: number;
  isSmallText?: boolean;
}

export interface PreprocessMetadata {
  mode: PreprocessMode;
  appliedSteps: string[];
}

export interface PreprocessResult {
  image: Uint8Array;
  metadata: PreprocessMetadata;
}

/**
 * 该函数定义最小可落地的预处理编排。
 * 真正图像处理可在调用方中接入 sharp/jimp/cv 等实现。
 */
export async function preprocess(
  image: Uint8Array,
  options: PreprocessOptions,
): Promise<PreprocessResult> {
  const steps: string[] = ["grayscale", "contrast:light"];

  if (options.mode === "accurate") {
    steps.push("binarization", "denoise:light");
    if (options.isSmallText) {
      steps.push(`scale:${options.scaleForSmallText}x`);
    }
  }

  // 最小版本先返回原图，并输出标准化元信息供日志和回退策略使用。
  return {
    image,
    metadata: {
      mode: options.mode,
      appliedSteps: steps,
    },
  };
}
