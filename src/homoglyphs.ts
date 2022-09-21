// https://www.unicode.org/Public/security/14.0.0/confusablesSummary.txt
/*
doc = await fetch("https://www.unicode.org/Public/security/14.0.0/confusablesSummary.txt").then(r => r.text())

doc.split("\n#\t")
.filter(v => /^[a-zA-Z]\t|^[^\t]+\t[a-zA-Z]\t/u.test(v))
.map(v => v.split("\n")[0].split("\t"))
*/

import homoglyphsJsonString from "./homoglyphs.txt?raw";

/**
 * Similar characters, minus those that don't render on my Windows 10 machine
 */
export const Homoglyphs = [["🐱", "😸", "😹", "😺", "😻", "😼"]];

JSON.parse(homoglyphsJsonString).forEach((v: string[]) => {
  Homoglyphs.push(
    v.filter((c) => {
      const codePoint = c.codePointAt(0);
      if (codePoint === undefined) {
        return false;
      }
      // Fraktur
      if (120068 <= codePoint && codePoint <= 120119) {
        return false;
      }
      // Bold Fraktur
      if (120172 <= codePoint && codePoint <= 120223) {
        return false;
      }
      if ([...c].length > 1) {
        console.warn(c);
      }
      return true;
    })
  );
});

export const HomoglyphsMap = new Map<string, { index: number; lookalikes: readonly string[] }>();

Homoglyphs.forEach((v) => {
  v.forEach((lookalike, i) => {
    if (HomoglyphsMap.has(lookalike)) {
      console.warn(`Duplicate lookalike: ${lookalike}`);
    }
    HomoglyphsMap.set(lookalike, { index: i, lookalikes: v });
  });
});

export function getWordHomoglyphCounts(word: string): readonly number[] {
  return [...word]
    .map((letter) => (HomoglyphsMap.get(letter) || { lookalikes: [letter] }).lookalikes.length)
    .filter((v) => v > 1);
}

export function normalizeWordHomoglyphs(word: string) {
  return [...word].map((letter) => (HomoglyphsMap.get(letter) || { lookalikes: [letter] }).lookalikes[0]).join("");
}
