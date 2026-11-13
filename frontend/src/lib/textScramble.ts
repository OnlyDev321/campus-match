const latinLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const hangulLetters = "가나다라마바사아자차카타파하";
const letter = new RegExp("^\\p{L}", "u");
const hangul = new RegExp("^\\p{Script=Hangul}", "u");

/** Tách theo ký tự hoàn chỉnh, giữ nguyên dấu tiếng Việt và âm tiết tiếng Hàn. */
export function textGraphemes(text: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment);
  }
  return Array.from(text.normalize("NFC"));
}

/** Chỉ xáo chữ; giữ nguyên khoảng trắng, số, dấu câu và giá trị người dùng được chèn vào câu. */
export function scrambleText(text: string, protectedValues: readonly (string | number)[] = []): string {
  const ranges: [number, number][] = [];
  for (const value of protectedValues) {
    const token = String(value);
    if (!token) continue;
    let from = 0;
    while (from < text.length) {
      const start = text.indexOf(token, from);
      if (start < 0) break;
      ranges.push([start, start + token.length]);
      from = start + token.length;
    }
  }

  let offset = 0;
  return textGraphemes(text).map((character) => {
    const start = offset;
    offset += character.length;
    if (!letter.test(character) || ranges.some(([a, b]) => start < b && offset > a)) return character;
    const alphabet = hangul.test(character) ? hangulLetters : latinLetters;
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }).join("");
}
