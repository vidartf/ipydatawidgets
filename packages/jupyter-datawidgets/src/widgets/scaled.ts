// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase, unpack_models
} from '@jupyter-widgets/base';

import {
  ObjectHash
} from 'backbone';

import {
  LinearScaleModel
} from 'jupyter-scales';

import {
  ISerializers, getArray
} from '../common';

import {
  NDArrayModel
} from './ndarray';

import {
  TypedArray, typesToArray, IArrayLookup
} from '../array-serializers';

import {
  data_union_serialization, listenToUnion
} from '../union';


import ndarray = require('ndarray');


/**
 * Utility to create a copy of an ndarray
 *
 * @param {ndarray.NDArray} array
 * @returns {ndarray.NDArray}
 */
export
function copyArray(array: ndarray.NDArray, dtype?: keyof IArrayLookup): ndarray.NDArray {
  if (dtype === undefined) {
    return ndarray((array.data as TypedArray).slice(),
                   array.shape,
                   array.stride,
                   array.offset);
  }
  return ndarray(new typesToArray[dtype](array.data as TypedArray),
                 array.shape,
                 array.stride,
                 array.offset)
}


/**
 * Scaled array model.
 *
 * This model provides a scaled version of an array, that is
 * automatically recomputed when either the array or the scale
 * changes.
 *
 * It triggers an event 'change:scaledData' when the array is
 * recomputed. Note: 'scaledData' is a direct propetry, not a
 * model attribute. The event triggers with an argument
 * { resized: boolean}, which indicates whether the array changed
 * size. Note: When the 'resized' flag is false, the old array will
 * have been reused, otherwise a new array is allocated.
 *
 * @export
 * @class ScaledArrayModel
 * @extends {DataModel}
 */
export
class ScaledArrayModel extends NDArrayModel {
  defaults() {
    return {...super.defaults(), ...{
      array: ndarray([]),
      scale: null,
      _model_name: ScaledArrayModel.model_name,
    }} as any;
  }

  /**
   * (Re-)compute the scaledData data.
   *
   * @returns {void}
   * @memberof ScaledArrayModel
   */
  computeScaledData(): void {
    let array = getArray(this.get('array'));
    let scale = this.get('scale') as LinearScaleModel | null;
    // Handle null case immediately:
    if (array === null || scale === null) {
      let changed = this.scaledData !== null;
      this.scaledData = null;
      if (changed) {
        this.trigger('change:scaledData', {resized: true});
      }
      return;
    }
    let resized = this.arrayMismatch();
    if (resized) {
      // Allocate new array
      this.scaledData = copyArray(array, this.scaledDtype());
    }
    let data = array.data as TypedArray;
    let target = this.scaledData!.data as TypedArray;

    // Set values:
    for (let i = 0; i < data.length; ++i) {
      target[i] = scale.obj(data[i])
    }

    this.trigger('change:scaledData', {resized});
  }

  /**
   * Initialize the model
   *
   * @param {Backbone.ObjectHash} attributes
   * @param {{model_id: string; comm?: any; widget_manager: any; }} options
   * @memberof ScaledArrayModel
   */
  initialize(attributes: ObjectHash, options: {model_id: string; comm?: any; widget_manager: any; }): void {
    super.initialize(attributes, options);
    this.initPromise = Promise.resolve().then(() => {
      this.computeScaledData();
      this.setupListeners();
    });
  }

  /**
   * Sets up any relevant event listeners after the object has been initialized,
   * but before the initPromise is resolved.
   *
   * @memberof ScaledArrayModel
   */
  setupListeners(): void {
    // Listen to direct changes on our model:
    this.on('change', this.onChange, this);

    // Listen to changes within array and scale models:
    listenToUnion(this, 'array', this.onChange.bind(this));
    this.listenTo(this.get('scale'), 'change', this.onChange);
  }

  getNDArray(key='scaledData'): ndarray.NDArray | null {
    if (key === 'scaledData') {
      if (this.scaledData === null) {
        this.computeScaledData();
      }
      return this.scaledData;
    } else {
      return super.getNDArray(key);
    }
  }

  /**
   * Callback for when the source data changes.
   *
   * @param {WidgetModel} model
   * @memberof ScaledArrayModel
   */
  protected onChange(model: WidgetModel): void {
    this.computeScaledData();
  }

  /**
   * Whether the array and scaledData have a mismatch in shape or type.
   *
   * @protected
   * @returns {boolean}
   * @memberof ScaledArrayModel
   */
  protected arrayMismatch(): boolean {
    let array = getArray(this.get('array'));
    if (array === null && this.scaledData === null) {
      return false;
    }
    return array === null || this.scaledData === null ||
      JSON.stringify(array.shape) !== JSON.stringify(this.scaledData.shape) ||
      array.dtype !== this.scaledData.dtype;
  }

  protected scaledDtype(): keyof IArrayLookup | undefined {
    let array = getArray(this.get('array'));
    if (array === null) {
      return undefined;
    }
    return array.dtype;
  }

  /**
   * The scaled data array.
   *
   * @type {(ndarray.NDArray | null)}
   * @memberof ScaledArrayModel
   */
  scaledData: ndarray.NDArray | null = null;

  /**
   * A promise that resolves once the model has finished its initialization.
   *
   * @type {Promise<void>}
   * @memberof ScaledArrayModel
   */
  initPromise: Promise<void>;

  static serializers: ISerializers = {
      ...NDArrayModel.serializers,
      array: data_union_serialization,
      scale: { deserialize: unpack_models },
    };

  static model_name = 'ScaledArrayModel';
}
