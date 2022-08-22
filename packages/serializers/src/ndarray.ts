// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, IWidgetManager, unpack_models
} from '@jupyter-widgets/base';

import {
  arraysEqual
} from './util';

import {
  compress, decompress
} from './compression';

import ndarray = require('ndarray');


export
type TypedArray = ndarray.TypedArray;
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
  if (dtype === 'array' || (dtype as string) === 'buffer' || dtype === 'generic' ||
      dtype === "bigint64" || dtype === "biguint64") {
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
function JSONToArray(obj: IReceivedSerializedArray | null, manager?: IWidgetManager): ndarray.NdArray | null {
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
function arrayToJSON(obj: ndarray.NdArray | null, widget?: WidgetModel): ISendSerializedArray | null {
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


export function compressedJSONToArray(
  obj: IReceivedCompressedSerializedArray | null,
  manager?: IWidgetManager
): ndarray.NdArray | null {
  if (obj === null) {
    return null;
  }
  let buffer: ArrayBuffer;
  if (obj.compressed_buffer !== undefined) {
    buffer = decompress(obj.compressed_buffer.buffer);
  } else {
    buffer = obj.buffer!.buffer;
  }
  // obj is {shape: list, dtype: string, array: DataView}
  // return an ndarray object
  return ndarray(new typesToArray[obj.dtype](buffer), obj.shape);
}

export function arrayToCompressedJSON(
  obj: ndarray.NdArray | null,
  widget?: WidgetModel
): SendSerializedArray | null {
  if (obj === null) {
    return null;
  }
  let dtype = ensureSerializableDtype(obj.dtype);
  const level = widget ? widget.get('compression_level') as number | undefined : 0;
  if (level !== undefined && level > 0) {
    const compressed_buffer = compress(
      (obj.data as TypedArray).buffer,
      level
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
function JSONToTypedArray(obj: IReceivedSerializedArray | null, manager?: IWidgetManager): TypedArray | null {
  if (obj === null) {
    return null;
  }
  // obj is {shape: list, dtype: string, array: DataView}
  return new typesToArray[obj.dtype](obj.buffer.buffer);
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
  return { shape: [obj.length], dtype: typedArrayToType(obj), buffer: obj };
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
function JSONToSimple(obj: IReceivedSerializedArray | null, manager?: IWidgetManager): ISimpleObject | null {
  if (obj === null) {
    return null;
  }
  // obj is {shape: list, dtype: string, array: DataView}
  return { array: new typesToArray[obj.dtype](obj.buffer.buffer), shape: obj.shape};
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
  return { shape: obj.shape, dtype: typedArrayToType(obj.array), buffer: obj.array };
}


/**
 * Serializers for to/from 1D simple object containing array and metadata.
 */
export
const simplearray_serialization = { deserialize: JSONToSimple, serialize: simpleToJSON };


/**
 * Factory for serialziers to/from a typed array with fixed shape.
 */
export function fixed_shape_serialization(shape: number[]) {

  let fixedLength = 1;
  for (let dim of shape) {
    fixedLength *= dim;
  }

  function JSONToFixedShape(obj: IReceivedSerializedArray | null, manager?: IWidgetManager): TypedArray | null {
    if (obj === null) {
      return null;
    }
    if (!arraysEqual(obj.shape, shape)) {
      throw new Error(`Incoming data unexpected shape: ${obj.shape}, expected ${shape}`);
    }
    // obj is {shape: list, dtype: string, array: DataView}
    return new typesToArray[obj.dtype](obj.buffer.buffer);
  }

  function fixedShapeToJSON(obj: TypedArray | null, widget?: WidgetModel): ISendSerializedArray | null {
    if (obj === null) {
      return null;
    }
    if (obj.length !== fixedLength) {
      throw new Error(
        `Data has wrong size for fixed shape serialization! Expected ${
          fixedLength
        } elements, got ${obj.length}.`);
    }
    // serialize to {shape: list, dtype: string, array: buffer}
    return { shape, dtype: typedArrayToType(obj), buffer: obj };
  }
  return { deserialize: JSONToFixedShape, serialize: fixedShapeToJSON };
}
