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
  data: DataView;
}

/**
 * The serialized representation of a received, compressed array
 */
export
interface IReceivedCompressedSerializedArray {
  shape: number[];
  dtype: keyof IArrayLookup;
  data?: DataView;
  compressed_data?: DataView;
}

/**
 * The serialized representation of an array for sending
 */
export
interface ISendSerializedArray {
  shape: number[];
  dtype: keyof IArrayLookup;
  data: TypedArray | DataView;
}

/**
 * The serialized representation of a compressed array for sending
 */
export
interface ISendCompressedSerializedArray {
  shape: number[];
  dtype: keyof IArrayLookup;
  data?: TypedArray | DataView;
  compressed_data?: TypedArray | DataView;
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
  return ndarray(new typesToArray[obj.dtype](obj.data.buffer), obj.shape);
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
  return { shape: obj.shape, dtype, data: obj.data as TypedArray };
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
  if (obj.compressed_data !== undefined) {
    buffer = pako.inflate(new Uint8Array(obj.compressed_data.buffer)).buffer;
  } else {
    buffer = obj.data!.buffer;
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
    const compressed_data = pako.deflate(
      new Uint8Array((obj.data as TypedArray).buffer),
      { level }
    );
    // serialize to {shape: list, dtype: string, array: buffer}
    return { shape: obj.shape, dtype, compressed_data };
  }
  // serialize to {shape: list, dtype: string, array: buffer}
  return { shape: obj.shape, dtype, data: obj.data as TypedArray };

}

export
const compressed_array_serialization = {
  deserialize: compressedJSONToArray,
  serialize: arrayToCompressedJSON
};


export
function typedArrayToType(array: TypedArray): keyof IArrayLookup {
  if (array instanceof Int8Array) {
    return 'int8';
  } else if (array instanceof Int16Array) {
    return 'int16';
  } else if (array instanceof Int32Array) {
    return 'int32';
  } else if (array instanceof Uint8Array) {
    return 'uint8';
  } else if (array instanceof Uint8ClampedArray) {
    return 'uint8';
  } else if (array instanceof Uint16Array) {
    return 'uint16';
  } else if (array instanceof Uint32Array) {
    return 'uint32';
  } else if (array instanceof Float32Array) {
    return 'float32';
  } else if (array instanceof Float64Array) {
    return 'float64';
  } else {
    throw new Error(`Unknown TypedArray type: ${array}`);
  }
};



/**
 * Deserialize from JSON to a typed array. Discards shape information.
 *
 * @param obj The deserialized JSON to convert
 * @param manager The owning widget manager
 *
 * @returns A new typed array.
 */
export
function JSONToTypedArray(obj: IReceivedSerializedArray | null, manager?: ManagerBase<any>): TypedArray | null {
  if (obj === null) {
    return null;
  }
  // obj is {shape: list, dtype: string, array: DataView}
  return new typesToArray[obj.dtype](obj.data.buffer);
}


/**
 * Serialize to JSON from a typed array.
 *
 * @param obj The typed array to convert
 * @param manager The owning widget model
 *
 * @returns The JSON object representing the typed array.
 */
export
function typedArrayToJSON(obj: TypedArray | null, widget?: WidgetModel): ISendSerializedArray | null {
  if (obj === null) {
    return null;
  }
  // serialize to {shape: list, dtype: string, array: buffer}
  return { shape: [obj.length], dtype: typedArrayToType(obj), data: obj };
}


/**
 * Serializers for to/from 1D typed array
 */
export
const typedarray_serialization = { deserialize: JSONToTypedArray, serialize: typedArrayToJSON };



export
interface ISimpleObject {
  array: TypedArray;
  shape: number[];
}


/**
 * Deserialize from JSON to a simple object with shape and typed array.
 *
 * @param obj The deserialized JSON to convert
 * @param manager The owning widget manager
 *
 * @returns A new object containg the data.
 */
export
function JSONToSimple(obj: IReceivedSerializedArray | null, manager?: ManagerBase<any>): ISimpleObject | null {
  if (obj === null) {
    return null;
  }
  // obj is {shape: list, dtype: string, array: DataView}
  return { array: new typesToArray[obj.dtype](obj.data.buffer), shape: obj.shape};
}


/**
 * Serialize to JSON from a simple object.
 *
 * @param obj The simple object to convert
 * @param manager The owning widget model
 *
 * @returns The JSON object representing the simple object.
 */
export
function simpleToJSON(obj: ISimpleObject | null, widget?: WidgetModel): ISendSerializedArray | null {
  if (obj === null) {
    return null;
  }
  // serialize to {shape: list, dtype: string, array: buffer}
  return { shape: obj.shape, dtype: typedArrayToType(obj.array), data: obj.array };
}


/**
 * Serializers for to/from 1D simple object containing array and metadata.
 */
export
const simplearray_serialization = { deserialize: JSONToSimple, serialize: simpleToJSON };

