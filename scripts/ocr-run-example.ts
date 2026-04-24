import { runOcrWithFallback } from "../src/ocr/ocr-runner";
import { createTesseractEngine } from "../src/ocr/tesseract-engine";

/**
 * 最小调用示例：
 * 1) 读取图片字节
 * 2) 调用 runOcrWithFallback
 * 3) 打印识别结果并释放引擎
 */
async function main(): Promise<void> {
  // 在真实项目中请替换为实际图片来源（文件、上传、对象存储等）。
  const fakeImageBytes = new Uint8Array();

  const engine = await createTesseractEngine();
  try {
    const result = await runOcrWithFallback(engine, {
      imageId: "demo-image-001",
      image: fakeImageBytes,
      languageHint: "zh",
      isSmallText: true,
    });

    console.log(
      JSON.stringify(
        {
          text: result.text,
          confidence: result.confidence,
          usedLangs: result.usedLangs,
          usedPreprocess: result.usedPreprocess,
          attemptCount: result.attemptCount,
        },
        null,
        2,
      ),
    );
  } finally {
    await engine.close();
  }
}

void main();
