<script setup lang="ts">
import { ref, shallowRef, watch, type Ref } from "vue";
import { useCompression } from "./useCompression";
import Compressor from "./Compressor.vue";

const compressor = shallowRef<{
  compress(data: Uint8Array): Uint8Array;
  decompress(data: Uint8Array): Uint8Array;
} | null>(null);

useCompression().then(
  (c) =>
    (compressor.value = {
      compress: (data) => c.compress(data, { quality: 11 }),
      decompress: c.decompress,
    })
);

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
      <Compressor v-if="compressor" :compressor="compressor"></Compressor>
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
