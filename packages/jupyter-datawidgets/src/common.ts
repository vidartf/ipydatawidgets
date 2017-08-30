

import {
  NDArrayModel
} from './ndarray';

import {
  DataUnion
} from './union';

import {
  ScaledArrayModel
} from './scaled';

import ndarray = require('ndarray');


/**
 * Gets the array of any array source.
 */
export
function getArray(data: DataUnion | ScaledArrayModel | null): ndarray.NDArray | null {
  if (data instanceof NDArrayModel) {
    if (data instanceof ScaledArrayModel) {
      return data.scaledData;
    }
    return data.get('array') as ndarray.NDArray;
  }
  return data;
}
