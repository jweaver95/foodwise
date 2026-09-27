import { cleanPanelText } from "@/lib/panelText";

export async function readIngredientPanel(image: string): Promise<{
  text: string;
  confidence: number;
}> {
  const { createWorker, PSM } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });
    const result = await worker.recognize(image);
    return {
      text: cleanPanelText(result.data.text),
      confidence: result.data.confidence,
    };
  } finally {
    await worker.terminate();
  }
}
