// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  DataModel
} from './base';

import {
  ISerializers
} from '../common';

import {
  array_serialization
} from '../array-serializers';

import ndarray = require('ndarray');


export
class NDArrayModel extends DataModel {
  defaults() {
    return {...super.defaults(), ...{
      array: ndarray([]),
      _model_name: NDArrayModel.model_name,
    }} as any;
  }

  getNDArray(key='array'): ndarray.NDArray | null {
    return this.get(key);
  }

  static serializers: ISerializers = {
      ...DataModel.serializers,
      array: array_serialization,
    };

  static model_name = 'NDArrayModel';
}
