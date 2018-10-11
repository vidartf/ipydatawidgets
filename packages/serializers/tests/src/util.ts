// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  uuid, WidgetModel
} from '@jupyter-widgets/base';

import {
  DummyManager
} from './dummy-manager.spec';

import {
  IDataSource
} from '../../src';

import ndarray = require('ndarray');


export
interface ModelConstructor<T> {
    new (attributes?: any, options?: any): T;
}


export
class NullTestModel extends WidgetModel implements IDataSource {
  getNDArray(key?: string): ndarray | null {
    return null;
  }
}


export
class TestModel extends WidgetModel implements IDataSource {
  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
    this.array = ndarray(this.raw_data, [2, 3]);
  }

  defaults() {
    return {
      ...super.defaults(),
      compression_level: 0,
    }
  }

  getNDArray(key?: string): ndarray | null {
    return this.array;
  }

  raw_data: Float32Array;
  array: ndarray;
}


export
function createTestModel<T extends WidgetModel>(
    constructor: ModelConstructor<T>,
    attributes?: any,
    widget_manager?: DummyManager,
    ): T {
  let id = uuid();
  let modelOptions = {
      widget_manager: widget_manager || new DummyManager(),
      model_id: id,
  }

  return new constructor(attributes, modelOptions);
}
