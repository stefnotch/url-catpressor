<script setup lang="ts">
import { ref, shallowRef, watch, type Ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useHyperbase } from "./useHyperbase";
import { CatWords } from "./cat-list";
import { HomoglyphsMap, getWordHomoglyphCounts, normalizeWordHomoglyphs } from "./homoglyphs";
import { assert } from "./assert";

const props = defineProps<{
  compressor: {
    compress(data: Uint8Array): Uint8Array;
    decompress(data: Uint8Array): Uint8Array;
  };
}>();

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const hyperbase = useHyperbase();

const urlInput = ref("");
const isUrl = computed(() => urlInput.value !== "" && urlInput.value.includes("."));
const compressedUrlBytes = ref(new Uint8Array(0));
const encodedUrl = ref("");

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

function abortableFn<T>(fn: (abortSignal: AbortSignal) => Promise<T>): () => void {
  let abortController = new AbortController();
  return () => {
    abortController.abort();

    abortController = new AbortController();
    fn(abortController.signal);
  };
}

const normalizedCatWordIndices = new Map<string, number>();
CatWords.forEach((word, index) => {
  normalizedCatWordIndices.set(normalizeWordHomoglyphs(word), index);
});

const windowHash = window.location.hash;
if (windowHash.length > 1) {
  const decodedHash = decodeURIComponent(windowHash.slice(1));
  const decodedBytes = catDecode(decodedHash);
  window.location.replace((decodedBytes[0] ? "https://" : "http://") + decompress(decodedBytes.slice(1)));
}

async function catEncode(data: Uint8Array, abortSignal: AbortSignal): Promise<string> {
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
        console.log({
          toEncode,
          quickDecoded,
        });
      }

      let encodedIndex = 0;
      // Have to reverse it so that the homoglyph counts match up
      const encodedReversed = encoded.slice().reverse();
      const encodedWords: string[] = words.map((word) =>
        [...word]
          .map((v) => {
            if (encodedIndex == encodedReversed.length) {
              // Done encoding, put a cute little separator here
              return "--" + v;
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

      return encodedWords.join("-");
    }

    await sleep(0, abortSignal); // So that we don't hang the browser
  }
}

function catDecode(data: string): Uint8Array {
  // Decode final bytes (which were encoded by picking the words)
  const words = data.replace("--", "").split("-");
  const endBytes = words.map((v) => {
    const value = normalizedCatWordIndices.get(normalizeWordHomoglyphs(v));
    if (value === undefined) {
      throw new Error("Could not find word: " + v);
    }
    return value;
  });
  endBytes.reverse();

  // Decode other bytes (which were encoded by picking the letter homoglyphs)
  const homoglyphCounts: number[] = [];
  words.forEach((word) => homoglyphCounts.push(...getWordHomoglyphCounts(word)));

  // Skip the letters after the --
  const wordsWithData = data.replace(/--.*/, "").split("-");
  const antiEncodedReversed: number[] = [];
  wordsWithData.forEach((word) =>
    [...word].forEach((v) => {
      const letterHomoglyphsInfo = HomoglyphsMap.get(v);
      if (letterHomoglyphsInfo === undefined) return;

      antiEncodedReversed.push(letterHomoglyphsInfo.index);
    })
  );

  const antiEncoded = antiEncodedReversed.slice(); //.reverse();
  const antiToEncode = hyperbase.decode(antiEncoded, homoglyphCounts);
  console.log({
    endBytes,
    homoglyphCounts,
    antiEncoded,
    antiToEncode,
  });

  return concatUint8Array(antiToEncode, new Uint8Array(endBytes));
}

function compress(text: string) {
  return props.compressor.compress(textEncoder.encode(text));
}
function decompress(compressed: Uint8Array) {
  return textDecoder.decode(props.compressor.decompress(compressed));
}

// 1. List of catz
// 2. List of letter-lookalikes (with mostly every letter that appears in le cats list getting a bunch of lookalikes)

watch(
  urlInput,
  useDebounceFn(() => {
    // Technically this doesn't support all kinds of URLs, but eh
    // Strip the HTTP(s) part -> 1 bit
    const urlString = urlInput.value.replace(/^https?:\/\/|^\/\//, "");
    const compressed: Uint8Array = concatUint8Array(
      new Uint8Array([urlInput.value.startsWith("http:") ? 0 : 1]),
      compress(urlString)
    );
    compressedUrlBytes.value = compressed;
  }, 200)
);

const updateEncodedUrl = abortableFn(async (abortSignal) => {
  const url = new URL(window.location.href);
  const encoded = await catEncode(compressedUrlBytes.value, abortSignal);
  encodedUrl.value = url.toString() + "#" + encoded;
});

watch(compressedUrlBytes, () => {
  updateEncodedUrl();
});

function concatUint8Array(a: Uint8Array, b: Uint8Array) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}
</script>

<template>
  <div>
    <input type="text" v-model="urlInput" placeholder="Put your URL here" />
    <span v-if="!isUrl">Enter a valid URL</span>
    <br />
    <!-- Coder cat -->
    {{ urlInput.length }} characters compressed to {{ compressedUrlBytes.length }} bytes (=
    {{ compressedUrlBytes.length * 8 }} bits)
    <br />

    <a v-if="encodedUrl" :href="encodedUrl" target="_blank">
      {{ encodedUrl }}
    </a>
  </div>
</template>

<style></style>
