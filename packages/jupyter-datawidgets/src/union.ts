// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase, unpack_models
} from '@jupyter-widgets/base';

import {
  NDArrayModel, IReceivedSerializedArray, ISendSerializedArray, JSONToArray, arrayToJSON
} from './ndarray';

import * as _ from 'underscore';

import ndarray = require('ndarray');

export type DataUnion = NDArrayModel | ndarray.NDArray


/**
 * Deserializes union JSON to an ndarray or a NDArrayModel, as appropriate.
 */
export
function JSONToUnion(obj: IReceivedSerializedArray | string | null, manager?: ManagerBase<any>): Promise<ndarray.NDArray | NDArrayModel | null> {
  if (typeof obj === 'string') {
    var modelPromise = unpack_models(obj, manager) as Promise<NDArrayModel>;
    return modelPromise;
  } else {
    return Promise.resolve(JSONToArray(obj, manager));
  }
}

/**
 * Deserializes union JSON to an ndarray, regardless of whether it is a widget reference or direct data.
 */
export
function JSONToUnionArray(obj: IReceivedSerializedArray | string | null, manager?: ManagerBase<any>): Promise<ndarray.NDArray | null> {
  if (typeof obj === 'string') {
    var modelPromise = unpack_models(obj, manager) as Promise<NDArrayModel>;
    return modelPromise.then((model) => {
      return model.get('array') as ndarray.NDArray;
    });
  } else {
    return Promise.resolve(JSONToArray(obj, manager));
  }
}

/**
 * Serializes a union to JSON.
 */
export
function unionToJSON(obj: DataUnion | null, widget?: WidgetModel): ISendSerializedArray | string | null {
  if (obj instanceof NDArrayModel) {
    return obj.toJSON(undefined);
  } else {
    return arrayToJSON(obj, widget);
  }
}

/**
 * Gets the array of a union.
 */
export
function getArrayFromUnion(union: DataUnion): ndarray.NDArray {
  if (union instanceof NDArrayModel) {
    return union.get('array') as ndarray.NDArray;
  }
  return union;
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
export
function listenToUnion(model: Backbone.Model,
                       unionName: string,
                       callback: (model: Backbone.Model, options: any) => any,
                       allChanges?: boolean
                      ): () => void {

  function listenToWidgetChanges(union: NDArrayModel) {
    if (union instanceof NDArrayModel) {
      // listen to changes in current model
      model.listenTo(union, 'change', callback);
      model.listenTo(union, 'childchange', callback);
    }
  }

  function onUnionChange(unionModel: Backbone.Model, value: any, subOptions: any) {
    var prev = model.previous(unionName) || [];
    var curr = value || [];

    if (prev instanceof NDArrayModel) {
      model.stopListening(prev);
    } else if (allChanges && !(curr instanceof NDArrayModel)) {
      // The union was an array, and has changed to a new array
      callback(unionModel, subOptions);
    }
    if (allChanges && (prev instanceof NDArrayModel) !== (curr instanceof NDArrayModel)) {
      // Union type has changed, call out
      callback(unionModel, subOptions);
    }
    listenToWidgetChanges(curr);
  }

  listenToWidgetChanges(model.get(unionName));

  // make sure to (un)hook listeners when property changes
  model.on('change:' + unionName, onUnionChange);

  function stopListening() {
    let curr = model.get(unionName);
    if (curr instanceof NDArrayModel) {
      model.stopListening(curr);
    }
    model.off('change:' + unionName, onUnionChange);
  }
  return stopListening;
}

export
const data_union_array_serialization = { deserialize: JSONToUnionArray, serialize: unionToJSON };

export
const data_union_serialization = { deserialize: JSONToUnion, serialize: unionToJSON };
