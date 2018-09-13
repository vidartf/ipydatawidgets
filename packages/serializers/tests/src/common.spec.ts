
import {
  getArray, IDataSource
} from '../../src';

import ndarray = require('ndarray');


class DummyDataSource implements IDataSource {
  constructor(public raw_data: Float32Array) {
    this.array = ndarray(this.raw_data, [2, 3]);
  }

  getNDArray(key?: string): ndarray {
    return this.array;
  }

  array: ndarray;
}

function createDataSource(): DummyDataSource {
  let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
  return new DummyDataSource(raw_data);
}


describe('getArray', () => {

  it('should return the array when given an array', () => {
      let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
      let output = getArray(array);
      expect(output).to.be(array);
  });

  it('should return the inner array when given a data source', () => {
      let src = createDataSource();
      let output = getArray(src);
      expect(output!.data).to.be(src.raw_data);
      expect(output!.dtype).to.be('float32');
      expect(output!.shape).to.eql([2, 3]);
  });

});
