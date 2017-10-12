// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ObjectHash
} from 'backbone';

import {
  WidgetModel
} from '@jupyter-widgets/base';

import {
  ISerializers, IDataSource
} from 'jupyter-dataserializers';

import {
  version
} from './version';

import ndarray = require('ndarray');



export
abstract class DataModel extends WidgetModel implements IDataSource {
  defaults(): any {
    return {...super.defaults(), ...{
      _model_module: DataModel.model_module,
      _model_module_version: DataModel.model_module_version,
      _view_name: DataModel.view_name,
      _view_module: DataModel.view_module!,
      _view_module_version: DataModel.view_module_version,
    }};
  }

  abstract getNDArray(key?: string): ndarray | null;

  static serializers: ISerializers = {
    ...WidgetModel.serializers,
  }

  static model_module = 'jupyter-datawidgets';
  static model_module_version = version;
  static view_name = null;
  static view_module = null;
  static view_module_version = '';
}
