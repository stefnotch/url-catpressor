<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref, shallowRef, watch, type Ref } from "vue";
import { useCompression } from "./useCompression";
import debounceFn from "debounce-fn";
import { useHyperbase } from "./useHyperbase";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const urlInput = ref("");
const compressedUrl = ref(new Uint8Array(0));

// TODO: Strip the HTTP(s) part -> 1 bit
function testHyperbase() {
  for (let base = 2; base < 256; base++) {
    const hb = useHyperbase();
    const valueLength = Math.floor(Math.random() * 100);

    const values = new Uint8Array(valueLength);
    for (let i = 0; i < valueLength; i++) {
      values[i] = Math.floor(Math.random() * 256);
    }
    let divisors: number[] = [];
    const getDivEncoding = () => {
      const d = Math.floor(Math.random() * (256 - 2)) + 2;
      divisors.push(d);
      return d;
    };
    const encoded = hb.encode(values, getDivEncoding);

    const decodingDivisors = divisors.slice();
    decodingDivisors.reverse();
    const decoded = hb.decode(encoded, decodingDivisors);

    if (!values.every((v, i) => v === decoded[i])) {
      console.log(`Failed to encode/decode with base ${base}`);
      console.log(valueLength);
      console.log(values);
      console.log(decoded);
      console.log(encoded);
    }
  }
}

testHyperbase();

useCompression().then((compression) => {
  function compress(text: string) {
    return compression.compress(textEncoder.encode(text), { quality: 11 });
  }
  function decompress(compressed: Uint8Array) {
    return textDecoder.decode(compression.decompress(compressed));
  }
  watch(
    urlInput,
    debounceFn(
      () => {
        const compressed = compress(urlInput.value);
        compressedUrl.value = compressed;
      },
      { wait: 200 }
    )
  );
});

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
      {{ urlInput.length }} characters compressed to {{ compressedUrl.length }} bytes (= {{ compressedUrl.length * 8 }} bits)
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

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }

  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
