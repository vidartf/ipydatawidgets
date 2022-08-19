// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IWidgetManager, WidgetModel, unpack_models
} from '@jupyter-widgets/base';

import {
  IReceivedSerializedArray, ISendSerializedArray, JSONToArray, arrayToJSON,
  JSONToTypedArray, typedArrayToJSON, JSONToSimple, simpleToJSON, TypedArray,
  ISimpleObject
} from './ndarray';

// This is OK, as long as we only use it for type declarations
import {
  DataWidget, getArray
} from './common';

import ndarray = require('ndarray');


/**
 * Union type declaration of an NDArrayModel and a raw ndarray.
 */
export type DataUnion = DataWidget | ndarray.NdArray;


/**
 * Deserializes union JSON to an ndarray or a NDArrayModel, as appropriate.
 */
export async function JSONToUnion(
  obj: IReceivedSerializedArray | string | null,
  manager?: IWidgetManager
): Promise<ndarray.NdArray | DataWidget | null> {

  if (typeof obj === 'string') {
    const modelPromise = unpack_models(obj, manager!) as Promise<DataWidget>;
    return modelPromise;
  } else {
    return Promise.resolve(JSONToArray(obj, manager));
  }

}

/**
 * Deserializes union JSON to an ndarray, regardless of whether it is a widget reference or direct data.
 */
export async function JSONToUnionArray(
  obj: IReceivedSerializedArray | string | null,
  manager?: IWidgetManager
): Promise<ndarray.NdArray | null> {

  return getArray(await JSONToUnion(obj, manager));

}

/**
 * Serializes a union to JSON.
 */
export function unionToJSON(
  obj: DataUnion | null,
  widget?: WidgetModel
): ISendSerializedArray | string | null {

  if (obj instanceof WidgetModel) {
    return obj.toJSON(undefined);
  } else {
    return arrayToJSON(obj as ndarray.NdArray | null, widget);
  }

}

/**
 * Sets up backbone events for listening to union changes.
 *
 * The callback will be called when:
 *  - The model is a widget, and its data changes
 *
 * Specify `allChanges` as truthy to also cover these cases:
 *  - The union changes from a widget to an array or vice-versa
 *  - The union is an array and its content changes
 *
 * To stop listening, call the return value.
 */
export function listenToUnion(
  model: WidgetModel,
  unionName: string,
  callback: (model: WidgetModel, options: any) => any,
  allChanges?: boolean
): () => void {

  function listenToWidgetChanges(union: DataUnion) {
    if (union instanceof WidgetModel) {
      // listen to changes in current model
      model.listenTo(union, 'change', callback);
    }
  }

  function onUnionChange(unionModel: WidgetModel, value: any, subOptions: any) {
    const prev = model.previous(unionName) || [];
    const curr = value || [];

    if (prev instanceof WidgetModel) {
      model.stopListening(prev);
    } else if (allChanges && !(curr instanceof WidgetModel)) {
      // The union was an array, and has changed to a new array
      callback(unionModel, subOptions);
    }
    if (allChanges && (prev instanceof WidgetModel) !== (curr instanceof WidgetModel)) {
      // Union type has changed, call out
      callback(unionModel, subOptions);
    }
    listenToWidgetChanges(curr);
  }

  listenToWidgetChanges(model.get(unionName));

  // make sure to (un)hook listeners when property changes
  model.on('change:' + unionName, onUnionChange);

  function stopListening() {
    const curr = model.get(unionName);
    if (curr instanceof WidgetModel) {
      model.stopListening(curr);
    }
    model.off('change:' + unionName, onUnionChange);
  }

  return stopListening;

}


export const data_union_array_serialization = {
  deserialize: JSONToUnionArray,
  serialize: unionToJSON
};

export const data_union_serialization = {
  deserialize: JSONToUnion,
  serialize: unionToJSON
};


/**
 * Deserializes union JSON to an ndarray, regardless of whether it is a widget reference or direct data.
 */
export function JSONToUnionTypedArray(
  obj: IReceivedSerializedArray | string | null,
  manager?: IWidgetManager
): Promise<TypedArray | null> {

  if (typeof obj === 'string') {
    const modelPromise = unpack_models(obj, manager!) as Promise<DataWidget>;
    return modelPromise.then((model) => {
      const array = model.getNDArray();
      if (array === null) {
        return array;
      }
      return array.data as TypedArray;
    });
  } else {
    return Promise.resolve(JSONToTypedArray(obj, manager));
  }

}


export const data_union_typedarray_serialization = {
  deserialize: JSONToUnionTypedArray,
  serialize: typedArrayToJSON
};


/**
 * Deserializes union JSON to an ndarray, regardless of whether it is a widget reference or direct data.
 */
export function JSONToSimpleUnion(
  obj: IReceivedSerializedArray | string | null,
  manager?: IWidgetManager
): Promise<ISimpleObject | null> {

  if (typeof obj === 'string') {
    const modelPromise = unpack_models(obj, manager!) as Promise<DataWidget>;
    return modelPromise.then((model) => {
      const array = model.getNDArray();
      if (array === null) {
        return null;
      }
      return {array: array.data as TypedArray, shape: array.shape};
    });
  } else {
    return Promise.resolve(JSONToSimple(obj, manager));
  }

}


export const data_union_simple_serialization = {
  deserialize: JSONToSimpleUnion,
  serialize: simpleToJSON
};
