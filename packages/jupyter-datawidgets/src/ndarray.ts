// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  DataModel
} from './base';

import {
  ISerializers, compressed_array_serialization
} from 'jupyter-dataserializers';

import ndarray = require('ndarray');


export
class NDArrayModel extends DataModel {
  defaults() {
    return {...super.defaults(), ...{
      array: ndarray([]),
      compression_level: 0,
      _model_name: NDArrayModel.model_name,
    }} as any;
  }

  getNDArray(key='array'): ndarray | null {
    return this.get(key);
  }

  static serializers: ISerializers = {
      ...DataModel.serializers,
      array: compressed_array_serialization,
    };

  static model_name = 'NDArrayModel';
}
