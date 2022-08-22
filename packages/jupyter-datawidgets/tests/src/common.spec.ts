
import {
  getArray
} from 'jupyter-dataserializers';

import {
  NDArrayModel
} from '../../src/ndarray';

import ndarray = require('ndarray');

import {
  DummyManager
} from './dummy-manager.spec';

import {
  createTestModel
} from './util.spec';


function createArrayModel(): NDArrayModel {
  let manager = new DummyManager();
  let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
  let view = new DataView(raw_data.buffer);
  let serializedState = { array: {
      buffer: view,
      shape: [2, 3],
      dtype: 'float32',
  }};
  let attributes = NDArrayModel._deserialize_state(serializedState as any, manager);
  return createTestModel(NDArrayModel, attributes);
}


describe('getArray', () => {

  it('should return the array when given an array', () => {
      let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
      let output = getArray(array);
      expect(output).to.be(array);
  });

  it('should return the inner array when given a model', () => {
      let model = createArrayModel();
      let output = getArray(model);
      expect(output).to.be(model.get('array'));
  });

});
