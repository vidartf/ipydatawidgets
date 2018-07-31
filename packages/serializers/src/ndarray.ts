// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  ISerializers
} from './common';

import ndarray = require('ndarray');

import pako = require("pako");


export
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
export
type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Uint8ClampedArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;

export
interface IArrayLookup {
    int8: Int8Array,
    int16: Int16Array,
    int32: Int32Array,
    uint8: Uint8Array,
    uint16: Uint16Array,
    uint32: Uint32Array,
    float32: Float32Array,
    float64: Float64Array
};

/**
 * The serialized representation of a received array
 */
export
interface IReceivedSerializedArray {
  shape: number[];
  dtype: keyof IArrayLookup;
  buffer: DataView;
}

/**
 * The serialized representation of a received, compressed array
 */
export
interface IReceivedCompressedSerializedArray {
  shape: number[];
  dtype: keyof IArrayLookup;
  buffer?: DataView;
  compressed_buffer?: DataView;
}

/**
 * The serialized representation of an array for sending
 */
export
interface ISendSerializedArray {
  shape: number[];
  dtype: keyof IArrayLookup;
  buffer: TypedArray | DataView;
}

/**
 * The serialized representation of a compressed array for sending
 */
export
interface ISendCompressedSerializedArray {
  shape: number[];
  dtype: keyof IArrayLookup;
  buffer?: TypedArray | DataView;
  compressed_buffer?: TypedArray | DataView;
}

export type SendSerializedArray = ISendSerializedArray | ISendCompressedSerializedArray;


export
function ensureSerializableDtype(dtype: ndarray.DataType): keyof IArrayLookup {
  if (dtype === 'array' || dtype === 'buffer' || dtype === 'generic') {
    throw new Error(`Cannot serialize ndarray with dtype: ${dtype}.`);
  } else if (dtype === 'uint8_clamped') {
    dtype = 'uint8';
  }
  return dtype;
}


/**
 * Deserialize from JSON to an ndarray object.
 *
 * @param obj The deserialized JSON to convert
 * @param manager The owning widget manager
 *
 * @returns A new ndarray object.
 */
export
function JSONToArray(obj: IReceivedSerializedArray | null, manager?: ManagerBase<any>): ndarray | null {
  if (obj === null) {
    return null;
  }
  // obj is {shape: list, dtype: string, array: DataView}
  // return an ndarray object
  return ndarray(new typesToArray[obj.dtype](obj.buffer.buffer), obj.shape);
}


/**
 * Serialize to JSON from an ndarray object.
 *
 * @param obj The ndarray object to convert
 * @param manager The owning widget model
 *
 * @returns The JSON object representing the ndarray.
 */
export
function arrayToJSON(obj: ndarray | null, widget?: WidgetModel): ISendSerializedArray | null {
  if (obj === null) {
    return null;
  }
  let dtype = ensureSerializableDtype(obj.dtype);
  // serialize to {shape: list, dtype: string, array: buffer}
  return { shape: obj.shape, dtype, buffer: obj.data as TypedArray };
}

/**
 * Serializers for to/from ndarrays
 */
export
const array_serialization = { deserialize: JSONToArray, serialize: arrayToJSON };

export
const typesToArray = {
    int8: Int8Array,
    int16: Int16Array,
    int32: Int32Array,
    uint8: Uint8Array,
    uint8_clamped: Uint8ClampedArray,
    uint16: Uint16Array,
    uint32: Uint32Array,
    float32: Float32Array,
    float64: Float64Array
}


export
function compressedJSONToArray(obj: IReceivedCompressedSerializedArray | null, manager?: ManagerBase<any>): ndarray | null {
  if (obj === null) {
    return null;
  }
  let buffer;
  if (obj.compressed_buffer !== undefined) {
    buffer = pako.inflate(new Uint8Array(obj.compressed_buffer.buffer)).buffer;
  } else {
    buffer = obj.buffer!.buffer;
  }
  // obj is {shape: list, dtype: string, array: DataView}
  // return an ndarray object
  return ndarray(new typesToArray[obj.dtype](buffer), obj.shape);
}

export
function arrayToCompressedJSON(obj: ndarray | null, widget?: WidgetModel): SendSerializedArray | null {
  if (obj === null) {
    return null;
  }
  let dtype = ensureSerializableDtype(obj.dtype);
  const level = widget ? widget.get('compression_level') : 0;
  if (level !== undefined && level > 0) {
    const compressed_buffer = pako.deflate(
      new Uint8Array((obj.data as TypedArray).buffer),
      { level }
    );
    // serialize to {shape: list, dtype: string, array: buffer}
    return { shape: obj.shape, dtype, compressed_buffer };
  }
  // serialize to {shape: list, dtype: string, array: buffer}
  return { shape: obj.shape, dtype, buffer: obj.data as TypedArray };

}

export
const compressed_array_serialization = {
  deserialize: compressedJSONToArray,
  serialize: arrayToCompressedJSON
};
