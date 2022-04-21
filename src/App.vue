<script setup lang="ts">
import { computed, ref, shallowRef, watch, type Ref } from "vue";
import { useCompression } from "./useCompression";
import Compressor from "./Compressor.vue";
import CatpressorLogo from "./assets/CatpressorLogo.vue";

const compressor = shallowRef<{
  compress(data: Uint8Array): Uint8Array;
  decompress(data: Uint8Array): Uint8Array;
} | null>(null);

const urlInput = ref("");
const isUrl = computed(() => urlInput.value !== "" && urlInput.value.includes("."));

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
    <!-- Needs to move-->
    <CatpressorLogo class="logo" />
    <!--Top right corner^ or text below, depending on le length-->
  </header>

  <main>
    <div class="wrapper">
      <div class="input-wrapper">
        <input type="text" v-model="urlInput" placeholder="Put your URL here" />
        <div class="status-text">
          <span v-if="!urlInput">OwO</span>
          <span v-else-if="!isUrl">owo</span>
          <span v-else>UwU</span>
        </div>
      </div>
      <div class="compress">
        <Compressor v-if="compressor && isUrl" :compressor="compressor" :url="urlInput"></Compressor>
      </div>
    </div>
  </main>
</template>

<style>
@import "./assets/base.css";
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
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

<style scoped>
header {
  display: flex;
  justify-content: space-around;
  overflow: hidden;
}
.logo {
  animation: jelly-cat 1.6s ease 0.5s 1 normal forwards;
}
.input-wrapper {
  display: flex;
  font-size: 1.2rem;
}
input {
  flex: 1;
  padding: 8px;
  margin-left: 8px;
  margin-right: 8px;
  border-radius: 8px;
  border: 2px solid rgb(121, 81, 6);
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  font-size: 1.2rem;
}
.status-text {
  padding-top: 8px;
}
.wrapper {
  display: flex;
  flex-direction: column;
}
.compress {
  display: flex;
  flex-direction: column;
  align-self: center;
  width: 80%;
}

/** Thank you https://webcode.tools/generators/css/keyframe-animation */
@keyframes jelly-cat {
  0% {
    transform: scale3d(1, 1, 1);
  }

  30% {
    transform: scale3d(1.25, 0.75, 1);
  }

  40% {
    transform: scale3d(0.75, 1.25, 1);
  }

  50% {
    transform: scale3d(1.15, 0.85, 1);
  }

  65% {
    transform: scale3d(0.95, 1.05, 1);
  }

  75% {
    transform: scale3d(1.05, 0.95, 1);
  }

  100% {
    transform: scale3d(1, 1, 1);
  }
}
</style>
