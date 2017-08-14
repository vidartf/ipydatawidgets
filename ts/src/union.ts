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


export
function JSONToUnion(obj: IReceivedSerializedArray | string | null, manager?: ManagerBase<any>): Promise<ndarray.NDArray | null> {
  if (typeof obj === 'string') {
    var modelPromise = unpack_models(obj, manager);
    return modelPromise.then((model) => {
      return model.get('array');
    });
  } else {
    return Promise.resolve(JSONToArray(obj, manager));
  }
}

export
function unionToJSON(obj: ndarray.NDArray | WidgetModel | null, widget?: WidgetModel): ISendSerializedArray | string | null {
  if (obj instanceof WidgetModel) {
    return obj.toJSON(undefined);
  } else {
    return arrayToJSON(obj, widget);
  }
}

export
const data_union_serialization = { deserialize: JSONToUnion, serialize: unionToJSON };
