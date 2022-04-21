<script setup lang="ts">
import { ref, shallowRef, watch, type Ref, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
// @ts-ignore
import party from "party-js";
import { concatUint8Array, catEncode } from "./cat-encoding";

const props = defineProps<{
  compressor: {
    compress(data: Uint8Array): Uint8Array;
    decompress(data: Uint8Array): Uint8Array;
  };
  url: String;
}>();

const textEncoder = new TextEncoder();

const compressedUrlBytes = ref(new Uint8Array(0));
const encodedUrl = ref("");
const finalUrlElement = ref<HTMLElement | null>(null);

function abortableFn<T>(fn: (abortSignal: AbortSignal) => Promise<T>): () => void {
  let abortController = new AbortController();
  return () => {
    abortController.abort();

    abortController = new AbortController();
    fn(abortController.signal);
  };
}

function compress(text: string) {
  return props.compressor.compress(textEncoder.encode(text));
}

// 1. List of catz
// 2. List of letter-lookalikes (with mostly every letter that appears in le cats list getting a bunch of lookalikes)

watch(
  () => props.url,
  useDebounceFn(() => {
    // Technically this doesn't support all kinds of URLs, but eh
    // Strip the HTTP(s) part -> 1 bit
    const urlString = props.url.replace(/^https?:\/\/|^\/\//, "");
    const compressed: Uint8Array = concatUint8Array(
      new Uint8Array([props.url.startsWith("http:") ? 0 : 1]),
      compress(urlString)
    );
    compressedUrlBytes.value = compressed;
  }, 250),
  { immediate: true }
);

const updateEncodedUrl = abortableFn(async (abortSignal) => {
  if (compressedUrlBytes.value.length === 0) return;
  const url = new URL(window.location.href);
  const encoded = await catEncode(compressedUrlBytes.value, abortSignal);
  encodedUrl.value = url.toString() + "#" + encoded;

  const urlElement = finalUrlElement.value;
  if (urlElement) {
    party.confetti(urlElement, {
      count: party.variation.range(20, 40),
    });
  }
});

watch(
  compressedUrlBytes,
  () => {
    updateEncodedUrl();
  },
  { immediate: true }
);

const isCopying = ref(false);
const showCopiedPopup = ref(false);
const showCopiedPopupStopTimeout = ref(() => {});

function copyUrl() {
  isCopying.value = true;
  setTimeout(() => {
    isCopying.value = false;
  }, 200);
  setTimeout(() => {
    showCopiedPopupStopTimeout.value();
    showCopiedPopup.value = true;
    const timeoutId = setTimeout(() => {
      showCopiedPopup.value = false;
    }, 2800);
    showCopiedPopupStopTimeout.value = () => {
      clearTimeout(timeoutId);
    };
  }, 200);
  navigator.clipboard.writeText(encodedUrl.value);
}
</script>

<template>
  <div>
    <!--
    <details>
      <summary>Coder cat lives here</summary>
      <a href="https://github.com/google/brotli" target="_blank"> Bread-li: </a>
      {{ props.url.length }} characters compressed to {{ compressedUrlBytes.length }} bytes (=
      {{ compressedUrlBytes.length * 8 }} bits)
      <br>
      Url: 
      <a v-if="encodedUrl" :href="encodedUrl" target="_blank">
        {{ encodedUrl }}
      </a>
    </details>
-->
    <br />
    <hr />
    <br />

    <div class="url-container" :class="{ 'copy-animation': isCopying }" ref="finalUrlElement" @click="copyUrl">
      <span class="url">
        {{ encodedUrl }}
      </span>
      <span class="copy-button">Copy</span>
    </div>
    <div class="copied-popup" v-show="showCopiedPopup">^ Copied to clipboard</div>
  </div>
</template>

<style scoped>
details:hover {
  cursor: pointer;
}
details {
  font-size: 0.8rem;
  font-family: "Courier New", Courier, monospace;
  border-bottom: 1px solid black;
}
.url-container:hover {
  cursor: copy;
}
.url-container {
  display: flex;
  justify-content: space-between;

  border-radius: 8px;
  overflow: clip;
  border: 2px solid #d38031;
  user-select: all;
}

.url {
  margin: 8px;
}
.url:hover {
  background: #d37f313e;
}

.copied-popup {
  animation: show-copied-popup 0.5s ease-in-out both;
}

.copy-button {
  user-select: none;
  display: flex;
  padding: 8px;
  align-items: center;
  cursor: pointer;

  background: #d38031;
  color: white;
}
.copy-animation {
  animation: push-button 0.2s 1 linear;
}

@keyframes push-button {
  0% {
    transform: scale(100%);
  }
  50% {
    transform: scale(93%);
  }
  100% {
    transform: scale(100%);
  }
}

@keyframes show-copied-popup {
  0% {
    opacity: 0;
    transform: translateX(0px);
  }
  100% {
    opacity: 1;
    transform: translateX(20px);
  }
}
</style>
