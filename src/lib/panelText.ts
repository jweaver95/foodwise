/** Turn a raw OCR dump into a single ingredient-list string. */
export function cleanPanelText(raw: string): string {
  const flattened = raw.replace(/\r/g, "\n");
  const marker = flattened.search(/ingredients?\b/i);
  const body = marker >= 0 ? flattened.slice(marker) : flattened;
  const withoutHeader = body.replace(/^ingredients?\s*:?\s*/i, "");

  const lines = withoutHeader
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !isNutritionLine(line));

  const joiner = withoutHeader.includes(",") ? " " : ", ";
  return lines
    .join(joiner)
    .replace(/\s+/g, " ")
    .replace(/\s*[,;]\s*/g, ", ")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/^,\s*|,\s*$/g, "")
    .trim();
}

function isNutritionLine(line: string): boolean {
  return /^(nutrition facts|calories|serving size|amount per|% daily value|daily value)\b/i.test(
    line,
  );
}

export function panelReadingQuality(
  text: string,
  confidence: number,
): "empty" | "uncertain" | "ok" {
  const letters = text.replace(/[^a-z]/gi, "");
  const parts = text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /[a-z]/i.test(part));

  if (letters.length < 8 || parts.length === 0) return "empty";
  if (confidence < 55 || parts.length < 2 || letters.length < 16) return "uncertain";
  return "ok";
}
