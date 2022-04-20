<script setup lang="ts">
import { ref, shallowRef, watch, type Ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useHyperbase } from "./useHyperbase";
import { CatWords } from "./cat-list";
import { Homoglyphs, HomoglyphsMap } from "./homoglyphs";

const props = defineProps<{
  compressor: {
    compress(data: Uint8Array): Uint8Array;
    decompress(data: Uint8Array): Uint8Array;
  };
}>();

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const urlInput = ref("");
const isUrl = computed(() => urlInput.value !== "" && urlInput.value.includes("."));
const compressedUrlBytes = ref(new Uint8Array(0));
const encodedUrl = ref("");

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

function abortableFn<T>(fn: (abortSignal: AbortSignal) => Promise<T>): () => void {
  let abortController = new AbortController();
  return () => {
    abortController.abort();

    abortController = new AbortController();
    fn(abortController.signal);
  };
}

const windowHash = window.location.hash;
if (windowHash.length > 1) {
  const decodedHash = decodeURIComponent(windowHash.slice(1));
  const decodedBytes = catDecode(decodedHash);
  window.location.replace((decodedBytes[0] ? "https://" : "http://") + decompress(decodedBytes.slice(1)));
}

async function catEncode(data: Uint8Array, abortSignal: AbortSignal): Promise<string> {
  // How many bytes starting from the end have we encoded (as words)
  let endCounter = 0;
  // How many bytes starting from the start have we encoded (as letter homoglyphs)
  let startCounter = 0;

  let words: string[] = [];
  let homoglyphCounts: number[] = [];
  while (true) {
    // We need more words
    endCounter += 1;

    // Pick a cat word based on the final byte
    const nextWord = CatWords[data[data.length - endCounter]];

    words.push(nextWord);
    homoglyphCounts.push(...getWordHomoglyphCounts(nextWord));

    // Attempt to encode the data with the given word-letter-homoglyphs
    const dataToEncode = data.slice(0, data.length - endCounter);
    let counter = 0;
    let done = true;
    const encoded = hyperbase.encode(dataToEncode, () => {
      if (counter >= homoglyphCounts.length) {
        done = false;
        return 256;
      }

      const base = homoglyphCounts[counter];
      counter += 1;
      return base;
    });

    // If encoding it worked, we have to generate the correct words with replaced letters
    if (done) {
      let encodedIndex = 0;
      // Have to reverse it so that the homoglyph counts match up
      const encodedReversed = encoded.slice().reverse();
      const encodedWords: string[] = words.map((word) => {
        let letters = [...word].map((v) => {
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
        });

        return letters.join("");
      });

      return encodedWords.join("-");
    }

    await sleep(0, abortSignal); // So that we don't hang the browser
  }
}

function getWordHomoglyphCounts(word: string) {
  return [...word]
    .map((letter) => (HomoglyphsMap.get(letter) || { lookalikes: [letter] }).lookalikes.length)
    .filter((v) => v > 1);
}

function catDecode(data: string): Uint8Array {
  // TODO: First do the "--" separator thingy
  const words = data.split("-");
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
