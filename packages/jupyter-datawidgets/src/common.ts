

import {
  WidgetModel, ManagerBase
} from '@jupyter-widgets/base';

import {
  DataUnion
} from './union';

import ndarray = require('ndarray');


/**
 * An interface for a datasource.
 */
export
interface IDataSource {
  getNDArray(key?: string): ndarray.NDArray | null;
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
export
function isDataSource(data: any): data is IDataSource {
  return data && typeof data.getNDArray === 'function';
}


/**
 * Gets the array of any array source.
 */
export
function getArray(data: DataUnion | IDataSource | null): ndarray.NDArray | null {
  if (isDataSource(data)) {
    return data.getNDArray();
  }
  return data;
}
