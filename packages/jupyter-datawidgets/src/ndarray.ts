// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DataModel
} from './base';

import {
  ISerializers, IDataWriteBack, compressed_array_serialization
} from 'jupyter-dataserializers';

import ndarray = require('ndarray');


export class NDArrayBaseModel extends DataModel {
  defaults() {
    return {...super.defaults(), ...{
      array: ndarray([]),
      compression_level: 0,
    }} as any;
  }

  getNDArray(key='array'): ndarray | null {
    return this.get(key);
  }

  static serializers: ISerializers = {
    ...DataModel.serializers,
    array: compressed_array_serialization,
  };
}


export class NDArrayModel extends NDArrayBaseModel implements IDataWriteBack {
  defaults() {
    return {...super.defaults(), ...{
      _model_name: NDArrayModel.model_name,
    }} as any;
  }

  canWriteBack(key='array'): boolean {
    return true;
  }

  setNDArray(array: ndarray | null, key='array', options?: any): void {
    this.set(key, array, options);
  }

  static serializers: ISerializers = {
    ...NDArrayBaseModel.serializers,
  };

  static model_name = 'NDArrayModel';
}
