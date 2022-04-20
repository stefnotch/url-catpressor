/*
 * Copyright 2011 Google Inc.
 * Copyright 2018 Andreas Schildbach
 *
 * From https://github.com/bitcoinj/bitcoinj/blob/master/core/src/main/java/org/bitcoinj/core/Base58.java
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Basically base-n encoding, except that the n changes all the time.
 * And n has to be less than 256 or so.
 */
export function useHyperbase(divisor: number) {
  /**
   * Encodes the given bytes as a baseN array
   * @param input the bytes to encode
   * @returns the baseN-encoded values
   */
  function encode(input: Uint8Array): number[] {
    if (input.length == 0) {
      return [];
    }
    // Count leading zeros.
    let zeros = 0;
    while (zeros < input.length && input[zeros] == 0) {
      zeros += 1;
    }
    // Convert base-256 digits to base-X digit
    input = input.slice(); // make a clone, now we can modify this "number" in place
    const upperBound = 8 * input.length; // Because 2^8 = 256 or something like that
    let encoded: number[] = Array(upperBound).fill(0); // upper bound (leading zeroes?)
    let outputStart = encoded.length; // travel from the back
    for (let inputStart = zeros; inputStart < input.length; ) {
      outputStart -= 1;
      encoded[outputStart] = divmod(input, inputStart, 256, divisor);
      if (input[inputStart] == 0) {
        inputStart += 1; // optimization - skip leading zero (after successful division?)
      }
    }
    // Preserve exactly as many leading encoded zeros in output as there were leading zeros in input.
    while (outputStart < encoded.length && encoded[outputStart] == 0) {
      outputStart += 1;
    }
    while (--zeros >= 0) {
      outputStart -= 1;
      encoded[outputStart] = 0;
    }
    // Return encoded values (including encoded leading zeros).
    return encoded.slice(outputStart, encoded.length);
  }

  /**
   * Decodes the given baseX values into the original data bytes.
   *
   * @param input the baseX-encoded values to decode
   * @return the decoded data bytes
   */
  function decode(input: number[]): Uint8Array {
    if (input.length == 0) {
      return new Uint8Array(0);
    }
    // Count leading zeros.
    let zeros = 0;
    while (zeros < input.length && input[zeros] == 0) {
      zeros += 1;
    }
    // Convert base-X digits to base-256 digits.
    let decoded = new Uint8Array(input.length);
    let outputStart = decoded.length;
    for (let inputStart = zeros; inputStart < input.length; ) {
      outputStart -= 1;
      decoded[outputStart] = divmod(input, inputStart, divisor, 256);
      if (input[inputStart] == 0) {
        inputStart += 1; // optimization - skip leading zeros
      }
    }
    // Ignore extra leading zeroes that were added during the calculation.
    while (outputStart < decoded.length && decoded[outputStart] == 0) {
      outputStart += 1;
    }
    // Return decoded data (including original number of leading zeros).
    return decoded.slice(outputStart - zeros, decoded.length);
  }

  /**
   * Divides a number, represented as an array of bytes each containing a single digit
   * in the specified base, by the given divisor. The given number is modified in-place
   * to contain the quotient, and the return value is the remainder.
   *
   * @param number the number to divide
   * @param firstDigit the index within the array of the first non-zero digit
   *        (this is used for optimization by skipping the leading zeros)
   * @param base the base in which the number's digits are represented (up to 256)
   * @param divisor the number to divide by (up to 256)
   * @return the remainder of the division operation
   */
  function divmod(
    number: { readonly length: number; [n: number]: number },
    firstDigit: number,
    base: number,
    divisor: number
  ): number {
    // this is just long division which accounts for the base of the input digits
    let remainder = 0;
    for (let i = firstDigit; i < number.length; i++) {
      let digit = number[i];
      let temp = remainder * base + digit;
      number[i] = Math.floor(temp / divisor);
      remainder = temp % divisor;
    }
    return remainder;
  }

  return {
    encode,
    decode,
  };
}

/*

function testHyperbase() {
  for (let base = 2; base < 256; base++) {
    const hb = useHyperbase(base);
    const valueLength = Math.floor(Math.random() * 100);

    const values = new Uint8Array(valueLength);
    for (let i = 0; i < valueLength; i++) {
      values[i] = Math.floor(Math.random() * 256);
    }
    const encoded = hb.encode(values);
    const decoded = hb.decode(encoded);
    if (!values.every((v, i) => v === decoded[i])) {
      console.log(`Failed to encode/decode with base ${base}`);
      console.log(valueLength);
      console.log(values);
      console.log(decoded);
      //return false;
    }
  }

  return true;
}

testHyperbase();
*/
