

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  DataUnion
} from './union';

import ndarray = require('ndarray');


/**
 * An interface for a data source.
 */
export interface IDataSource {
  getNDArray(key?: string): ndarray | null;
}


/**
 * Type declaration for general widget serializers.
 *
 * Declared in lieu of proper interface in jupyter-widgets.
 */
export
interface ISerializers {
  [key: string]: {
    deserialize?: (value?: any, manager?: ManagerBase<any>) => any;
    serialize?: (value?: any, widget?: WidgetModel) => any;
  }
}


/**
 * Whether an object implements the data source interface.
 */
export function isDataSource(candidate: any): candidate is IDataSource {
  return candidate && typeof candidate.getNDArray === 'function';
}


/**
 * Gets the array of any array source.
 */
export function getArray(source: DataUnion | null): ndarray | null {
  if (isDataSource(source)) {
    return source.getNDArray();
  }
  return source;
}
