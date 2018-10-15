// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  DataUnion
} from './union';

import ndarray = require('ndarray');


/**
 * Type declaration for general widget serializers.
 *
 * Declared in lieu of proper interface in jupyter-widgets.
 */
export interface ISerializers {
  [key: string]: {
    deserialize?: (value?: any, manager?: ManagerBase<any>) => any;
    serialize?: (value?: any, widget?: WidgetModel) => any;
  }
}


/**
 * An interface for a data source.
 */
export interface IDataSource {
  getNDArray(key?: string): ndarray | null;
}


/**
 * An interface for a data widget that can be written back to.
 *
 * Widgets that sync the data back and forth between the kernel and
 * frontend should implement this, while widgets that generate the
 * data from a process without a reverse can choose not to.
 */
export interface IDataWriteBack {
  setNDArray(array: ndarray | null, key?: string, options?: any): void;

  canWriteBack(key?: string): boolean;
}

/**
 * A widget that might expose IDataSource and/or IDataSink.
 */
export type DataWidget = WidgetModel & IDataSource & Partial<IDataWriteBack>


/**
 * Whether an object implements the data source interface.
 */
export function isDataSource(candidate: any): candidate is IDataSource {
  return candidate && typeof candidate.getNDArray === 'function';
}


/**
 * Whether an object implements the data source interface.
 */
export function isDataWriteBack(candidate: any): candidate is IDataWriteBack {
  return candidate && typeof candidate.setNDArray === 'function';
}


/**
 * Gets the array of any array source.
 */
export function getArray(
  source: ndarray<number> | IDataSource | null,
  key?: string
): ndarray | null {

  if (isDataSource(source)) {
    return source.getNDArray(key);
  }
  return source;

}


/**
 * Sets the union attribute of a widget to an array, in place.
 *
 * If current value of the attribute is a data sink, (i.e. implements the
 * setNDArray method), it will set its data. Otherwise it will set
 * the attribute value to the array.
 *
 * Note: If you never want to overwrite the data of a widget reference,
 * instead just call `widget.set(key, array)` directly.
 */
export function setArray(
  widget: WidgetModel,
  key: string,
  array: ndarray | null,
  options?: any
): void {

  const current = widget.get(key);
  if (isDataWriteBack(current) && current.canWriteBack()) {
    current.setNDArray(array, key, options);
  } else {
    widget.set(key, array, options);
  }

}
