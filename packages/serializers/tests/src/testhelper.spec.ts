// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  uuid, WidgetModel
} from '@jupyter-widgets/base';

import {
  DummyManager
} from './dummy-manager.spec';

import {
  IDataSource, ISerializers
} from '../../src';

import ndarray = require('ndarray');


export
interface ModelConstructor<T> {
  new (attributes?: any, options?: any): T;
}


export
class NullTestModel extends WidgetModel implements IDataSource {
  getNDArray(key?: string): ndarray.NdArray | null {
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
      _model_name: 'TestModel',
      _model_module: 'jupyter-datawidgets',
    }
  }

  getNDArray(key?: string): ndarray.NdArray | null {
    return this.array;
  }

  raw_data: Float32Array;
  array: ndarray.NdArray;
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

  const model = new constructor(attributes, modelOptions);
  model.name = model.get('_model_name');
  model.module = model.get('_model_module');
  model.widget_manager.register_model(model.model_id, Promise.resolve(model));
  return model;
}


export function createModelWithSerializers(
  serializers: ISerializers,
  classes?: {[key: string]: ModelConstructor<WidgetModel>}
): TestModel {
  class SubModel extends TestModel {
    defaults() {
      return {
        ...super.defaults(),
        _model_name: 'SubModel',
      };
    }
    static serializers = {
      ...TestModel.serializers,
      ...serializers,
    }
  }
  const manager = new DummyManager();
  if (classes) {
    manager.testClasses = {
      ...manager.testClasses,
      ...classes,
    };
  }
  manager.testClasses['SubModel'] = SubModel;
  const model = createTestModel(SubModel, undefined, manager);
  return model;
}
