// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  uuid, WidgetModel
} from '@jupyter-widgets/base';

import {
  DummyManager
} from './dummy-manager.spec';

export
interface ModelConstructor<T> {
    new (attributes?: any, options?: any): T;
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
