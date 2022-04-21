import { useHyperbase } from "./useHyperbase";
import { CatWords } from "./cat-list";
import { HomoglyphsMap, getWordHomoglyphCounts, normalizeWordHomoglyphs } from "./homoglyphs";
import { assert } from "./assert";

const normalizedCatWordIndices = new Map<string, number>();
CatWords.forEach((word, index) => {
  normalizedCatWordIndices.set(normalizeWordHomoglyphs(word), index);
});

const hyperbase = useHyperbase();

function sleep(ms: number, abortSignal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (abortSignal.aborted) {
      reject(new Error("Aborted"));
    }

    abortSignal.addEventListener("abort", () => {
      reject(new Error("Aborted"));
    });

    setTimeout(() => {
      if (!abortSignal.aborted) {
        resolve();
      }
    }, ms);
  });
}

export function getCatWordIndex(word: string) {
  const value = normalizedCatWordIndices.get(normalizeWordHomoglyphs(word));
  if (value === undefined) {
    throw new Error("Could not find word: " + word);
  }
  return value;
}

export async function catEncode(data: Uint8Array, abortSignal: AbortSignal): Promise<string> {
  // How many bytes starting from the end have we encoded (as words)
  let endCounter = 0;

  const words: string[] = [];
  const homoglyphCounts: number[] = [];
  while (true) {
    // We need more words
    endCounter += 1;

    // Pick a cat word based on the final byte
    const nextWord = CatWords[data[data.length - endCounter]];

    words.push(nextWord);
    homoglyphCounts.push(...getWordHomoglyphCounts(nextWord));

    // Attempt to encode the remaining data with the given word-letter-homoglyphs
    const toEncode = data.slice(0, data.length - endCounter);
    const divisors: number[] = [];
    let done = true;
    const encoded = hyperbase.encode(toEncode, () => {
      if (divisors.length >= homoglyphCounts.length) {
        done = false;
        return 256;
      }

      const base = homoglyphCounts[divisors.length];
      divisors.push(base);
      return base;
    });

    // If encoding it worked, we have to generate the correct words with replaced letters
    if (done) {
      console.log({
        data,
        toEncode,
        encoded,
        endCounter,
        homoglyphCounts,
        divisors,
      });
      assert(divisors.length === encoded.length, `${divisors.length} must be equal to ${encoded.length}`);
      assert(encoded.length <= homoglyphCounts.length, `${encoded.length} must be less than ${homoglyphCounts.length}`);
      {
        let quickDecoded = hyperbase.decode(encoded, divisors);
        assert(toEncode.length == quickDecoded.length, `Decoding must round-trip (length)`);
        assert(
          toEncode.every((v, i) => quickDecoded[i] == v),
          `Decoding must round-trip (bytes)`
        );
      }

      let encodedIndex = 0;
      // Have to reverse it so that the homoglyph counts match up
      const encodedReversed = encoded.slice().reverse();
      const encodedWords: string[] = words.map((word) =>
        [...word]
          .map((v) => {
            if (encodedIndex == encodedReversed.length) {
              // Done encoding, put a cute little separator here
              encodedIndex += 1;
              return "__" + v;
            } else if (encodedIndex > encodedReversed.length) {
              // Done encoding
              return v;
            } else {
              const lookalikes = (HomoglyphsMap.get(v) || { lookalikes: [v] }).lookalikes;
              if (lookalikes.length > 1) {
                // Found a letter with multiple similar letters
                const toEncode = encodedReversed[encodedIndex];
                encodedIndex += 1;
                if (toEncode >= lookalikes.length) {
                  console.error("Encoding Algorithm is broken", toEncode, lookalikes);
                }
                return lookalikes[toEncode];
              } else {
                // Cannot encode anything
                return v;
              }
            }
          })
          .join("")
      );

      return encodedWords.join("_");
    }

    await sleep(0, abortSignal); // So that we don't hang the browser
  }
}

export function concatUint8Array(a: Uint8Array, b: Uint8Array) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

export function catDecode(data: string): Uint8Array {
  // Decode final bytes (which were encoded by picking the words)
  const words = data.replace("__", "").split("_");
  const endBytes = words.map((v) => getCatWordIndex(v));
  endBytes.reverse();

  // Decode other bytes (which were encoded by picking the letter homoglyphs)
  const divisors: number[] = [];

  // Skip the letters after the --
  const wordsWithData = data.replace(/__.*/, "").split("_");
  const antiEncodedReversed: number[] = [];
  wordsWithData.forEach((word) =>
    [...word].forEach((v) => {
      const letterHomoglyphsInfo = HomoglyphsMap.get(v);
      if (letterHomoglyphsInfo === undefined) return;

      antiEncodedReversed.push(letterHomoglyphsInfo.index);
      divisors.push(letterHomoglyphsInfo.lookalikes.length);
    })
  );

  const antiEncoded = antiEncodedReversed.slice().reverse();
  const antiToEncode = hyperbase.decode(antiEncoded, divisors);
  console.log({
    endBytes,
    divisors,
    antiEncoded,
    antiToEncode,
  });

  return concatUint8Array(antiToEncode, new Uint8Array(endBytes));
}
