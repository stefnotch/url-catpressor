import * as brotliPromise from "brotli-wasm";

export async function useCompression() {
  const wasm = await brotliPromise.default;
  return {
    compress: (buf: Uint8Array, options?: any) => wasm.compress(buf, options),
    decompress: (buf: Uint8Array) => wasm.decompress(buf),
  };
}
