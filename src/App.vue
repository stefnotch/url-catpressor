<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref, shallowRef, watch, type Ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useCompression } from "./useCompression";
import { useHyperbase } from "./useHyperbase";
import { CatWords } from "./cat-list";
import { Homoglyphs } from "./homoglyphs";

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

useCompression().then((compression) => {
  const windowHash = window.location.hash;
  if (windowHash.length > 1) {
    const decodedHash = decodeURIComponent(windowHash.slice(1));
    const decodedBytes = catDecode(decodedHash);
    window.location.replace((decodedBytes[0] ? "https://" : "http://") + decompress(decodedBytes.slice(1)));
  }

  async function catEncode(data: Uint8Array, abortSignal: AbortSignal): Promise<string> {
    // hyperbase.encode()
    // How many bytes starting from the end have we encoded (as words)
    let endCounter = 0;
    // How many bytes starting from the start have we encoded (as letter homoglyphs)
    let startCounter = 0;

    let words: string[] = [];
    while (startCounter + endCounter < data.length) {
      // We need more words
      endCounter += 1;
      // Pick a cat word based on the final byte
      const nextWord = CatWords[data[data.length - endCounter]];

      words.push(nextWord);

      await sleep(0, abortSignal); // So that we don't hang the browser
    }

    return words.join("-");
  }

  function catDecode(data: string): Uint8Array {
    const words = data.split("-");
  }

  function compress(text: string) {
    return compression.compress(textEncoder.encode(text), { quality: 11 });
  }
  function decompress(compressed: Uint8Array) {
    return textDecoder.decode(compression.decompress(compressed));
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
});

function concatUint8Array(a: Uint8Array, b: Uint8Array) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}

const splashTexts = [
  "OwO",
  "UwU",
  "Cats would swipe right",
  "🐈",
  "🐱",
  "☕",
  "Unicode needs more cat emojis",
  "MeowingInsanely!",
  "Hug your cat :3",
  "(=^･ω･^=)",
  "(=^･ω･^=) 🐟",
  "（Φ ω Φ）",
  "Squish that cat",
  "Nyanyanyan!",
  "Blep",
];
</script>

<template>
  <header>
    <!-- Needs to move and needs a cute font-->
    <h1>Catpressor</h1>
    <!--Top right corner^ or text below, depending on le length-->

    <div class="wrapper">
      <input type="text" v-model="urlInput" placeholder="Put your URL here" />
      <span v-if="!isUrl">Enter a valid URL</span>
      <br />
      {{ urlInput.length }} characters compressed to {{ compressedUrlBytes.length }} bytes (=
      {{ compressedUrlBytes.length * 8 }} bits)
      <br />

      <a v-if="encodedUrl" :href="encodedUrl" target="_blank">
        {{ encodedUrl }}
      </a>
    </div>
  </header>

  <main>lorem ipsum</main>
</template>

<style>
@import "./assets/base.css";

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}
</style>
