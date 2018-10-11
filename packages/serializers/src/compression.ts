// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Only used for typing, will be removed in transpile step
import * as PakoModuleType from 'pako';

// Polyfill webpack require.ensure.
if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require);    

let _pakoReady: Promise<typeof PakoModuleType>;
let _pako: typeof PakoModuleType;

function ensurePako(): Promise<typeof PakoModuleType> {
  if (_pakoReady) {
    return _pakoReady;
  }

  _pakoReady = new Promise((resolve, reject) => {
    require.ensure(
      ['pako'],
      // see https://webpack.js.org/api/module-methods/#require-ensure
      // this argument MUST be named `require` for the WebPack parser
      require => {
        _pako = require('pako') as typeof PakoModuleType;
        resolve(_pako);
      },
      (error: any) => {
        console.error(error);
        reject();
      },
      'pako'
    );
  });

  return _pakoReady;
}

/**
 * Compress the buffer using zlib compression.
 */
export async function compress(buffer: ArrayBuffer, level: number): Promise<Uint8Array> {
    const pako = await ensurePako();
    return pako.deflate(new Uint8Array(buffer), {level});
}

/**
 * Decompress a zlib compressed buffer.
 */
export async function decompress(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    const pako = await ensurePako();
    return pako.inflate(new Uint8Array(buffer)).buffer;
}
