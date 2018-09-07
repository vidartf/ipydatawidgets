
import {
  LinearScaleModel
} from 'jupyter-scales';

import {
  DataUnion, getArray
} from 'jupyter-dataserializers';

import {
  NDArrayModel
} from '../../src/ndarray';

import {
  ScaledArrayModel
} from '../../src/scaled';

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
    data: view,
    shape: [2, 3],
    dtype: 'float32',
  }};
  let attributes = NDArrayModel._deserialize_state(serializedState, manager);
  return createTestModel(NDArrayModel, attributes);
}

function createScaledModel(): Promise<NDArrayModel> {
  let manager = new DummyManager();

  let scaleState = {
    domain: [0, 1],
    range: [0, 2],
  }
  let scale = createTestModel(LinearScaleModel, scaleState, manager);
  (manager as any)._models[scale.model_id] = Promise.resolve(scale);

  let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
  let view = new DataView(raw_data.buffer);
  let serializedState = {
    array: {
      data: view,
      shape: [2, 3],
      dtype: 'float32',
    },
    scale: `IPY_MODEL_${scale.model_id}`,
  };
  let attributesPromise = ScaledArrayModel._deserialize_state(serializedState, manager);
  return attributesPromise.then((attributes) => {
    let model = createTestModel(ScaledArrayModel, attributes);
    (manager as any)._models[model.model_id] = Promise.resolve(model);
    return model;
  });
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

    it('should return the computed array when given a scaled model', () => {
        let modelPromise = createScaledModel();
        return modelPromise.then(model => {
          let output = getArray(model)!;
          let inputArray = model.get('array');
          expect(output.shape).to.eql(inputArray.shape);
          expect(output.data).to.eql(new Float32Array([2, 4, 6, 8, 10, 20]));
        });
    });

});
