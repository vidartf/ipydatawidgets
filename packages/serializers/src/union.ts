// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase, unpack_models
} from '@jupyter-widgets/base';

import {
  IReceivedSerializedArray, ISendSerializedArray, JSONToArray, arrayToJSON
} from './ndarray';

// This is OK, as long as we only use it for type declarations
import {
  IDataSource
} from './common';

import ndarray = require('ndarray');


/**
 * Union type declaration of an NDArrayModel and a raw ndarray.
 */
export
type DataUnion = IDataSource | ndarray


/**
 * Deserializes union JSON to an ndarray or a NDArrayModel, as appropriate.
 */
export
function JSONToUnion(obj: IReceivedSerializedArray | string | null, manager?: ManagerBase<any>): Promise<ndarray | IDataSource | null> {
  if (typeof obj === 'string') {
    var modelPromise = unpack_models(obj, manager) as Promise<IDataSource>;
    return modelPromise;
  } else {
    return Promise.resolve(JSONToArray(obj, manager));
  }
}

/**
 * Deserializes union JSON to an ndarray, regardless of whether it is a widget reference or direct data.
 */
export
function JSONToUnionArray(obj: IReceivedSerializedArray | string | null, manager?: ManagerBase<any>): Promise<ndarray | null> {
  if (typeof obj === 'string') {
    var modelPromise = unpack_models(obj, manager) as Promise<IDataSource>;
    return modelPromise.then((model) => {
      return model.getNDArray();
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
  if (obj instanceof WidgetModel) {
    return obj.toJSON(undefined);
  } else {
    return arrayToJSON(obj as ndarray | null, widget);
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
export
function listenToUnion(model: Backbone.Model,
                       unionName: string,
                       callback: (model: Backbone.Model, options: any) => any,
                       allChanges?: boolean
                      ): () => void {

  function listenToWidgetChanges(union: DataUnion) {
    if (union instanceof WidgetModel) {
      // listen to changes in current model
      model.listenTo(union, 'change', callback);
    }
  }

  function onUnionChange(unionModel: WidgetModel, value: any, subOptions: any) {
    var prev = model.previous(unionName) || [];
    var curr = value || [];

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
    let curr = model.get(unionName);
    if (curr instanceof WidgetModel) {
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
