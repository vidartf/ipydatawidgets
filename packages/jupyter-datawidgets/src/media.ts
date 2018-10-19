// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel, DOMWidgetView
} from '@jupyter-widgets/base';

import {
  ISerializers, data_union_serialization, getArray,
  listenToUnion
} from 'jupyter-dataserializers';

import {
  version
} from './version';

import ndarray = require('ndarray');


/**
 * Model for the the data widgets based image widget.
 */
export class DataImageModel extends DOMWidgetModel {

  defaults() {
    return {...super.defaults(), ...{
      _model_name: DataImageModel.model_module,
      _model_module_version: DataImageModel.model_module_version,
      _model_module: DataImageModel.model_module,
      _view_name: DataImageModel.view_name,
      _view_module: DataImageModel.view_module,
      _view_module_version: DataImageModel.view_module_version,

      data: ndarray([]),
    }};
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    data: data_union_serialization,
  };

  static model_name = 'DataImageModel';
  static model_module = 'jupyter-datawidgets';
  static model_module_version = version;
  static view_name = 'DataImageView';
  static view_module = 'jupyter-datawidgets';
  static view_module_version = version;

}


/**
 * View for the the data widgets based image widget.
 */
export class DataImageView extends DOMWidgetView {
  initialize(parameters: any) {
    super.initialize(parameters);
    listenToUnion(this.model, 'data', this.update.bind(this), true);
  }

  /**
   * Called when view is rendered.
   */
  render() {
    super.render();
    this.pWidget.addClass('jupyter-widgets');
    this.pWidget.addClass('widget-image');
    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update() {

    let data = getArray(this.model.get('data'));
    let url;

    if (data === null || data.data.length === 0) {
      url = '';
      this.el.setAttribute('width', '0');
      this.el.setAttribute('height', '0');
    } else {
      if (data.shape.length !== 3 || data.shape[2] !== 4) {
        throw new Error(`DataImage data has invalid shape: ${JSON.stringify(data.shape)}`);
      }
      if (this.canvas === null) {
        this.canvas = document.createElement('canvas');
      }

      this.el.setAttribute('width', `${data.shape[0]}`);
      this.el.setAttribute('height', `${data.shape[1]}`);
      this.canvas.setAttribute('width', `${data.shape[0]}`);
      this.canvas.setAttribute('height', `${data.shape[1]}`);

      const ctx = this.canvas.getContext('2d')!;
      const imageData = new ImageData(
        new Uint8ClampedArray(data.data as Uint8Array),
        data.shape[0],
        data.shape[1]
      );
      ctx.putImageData(imageData, 0, 0);
      url = this.canvas.toDataURL();
    }

    this.el.src = url;

    return super.update();
  }

  remove() {
    if (this.canvas !== null) {
      this.canvas = null;
    }
    super.remove();
  }

  /**
   * The default tag name.
   *
   * #### Notes
   * This is a read-only attribute.
   */
  get tagName() {
    // We can't make this an attribute with a default value
    // since it would be set after it is needed in the
    // constructor.
    return 'img';
  }


  el: HTMLImageElement;
  canvas: HTMLCanvasElement | null = null;
}