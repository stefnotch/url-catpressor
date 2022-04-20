<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref, shallowRef, watch, type Ref } from "vue";
import { useCompression } from "./useCompression";
import debounceFn from "debounce-fn";
import { useHyperbase } from "./useHyperbase";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const urlInput = ref("");
const compressedUrlBytes = ref(new Uint8Array(0));

useCompression().then((compression) => {
  const windowHash = window.location.hash;
  if (windowHash.length > 1) {
    const decodedHash = decodeURIComponent(windowHash.slice(1));
    // const decompressedHash = decompress()

    window.location.replace(decodedHash);
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
    debounceFn(
      () => {
        // Technically this doesn't support all kinds of URLs, but eh
        // Strip the HTTP(s) part -> 1 bit
        const urlString = urlInput.value.replace(/^https?:\/\/|^\/\//, "");
        const compressed: Uint8Array = concatUint8Array(
          new Uint8Array([urlInput.value.startsWith("http:") ? 0 : 1]),
          compress(urlString)
        );
        compressedUrlBytes.value = compressed;
      },
      { wait: 200 }
    )
  );
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
      <br />
      {{ urlInput.length }} characters compressed to {{ compressedUrlBytes.length }} bytes (=
      {{ compressedUrlBytes.length * 8 }} bits)
    </div>
  </header>

  <main>x</main>
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
