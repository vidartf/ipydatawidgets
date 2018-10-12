// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import pako = require('pako');

/**
 * Compress the buffer using zlib compression.
 */
export function compress(buffer: ArrayBuffer, level: number): Uint8Array {
    return pako.deflate(new Uint8Array(buffer), {level});
}

/**
 * Decompress a zlib compressed buffer.
 */
export function decompress(buffer: ArrayBuffer): ArrayBuffer {
    return pako.inflate(new Uint8Array(buffer)).buffer;
}
