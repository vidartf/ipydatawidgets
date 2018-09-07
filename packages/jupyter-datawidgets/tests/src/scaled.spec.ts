// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  uuid
} from '@jupyter-widgets/base';

import {
  LinearScaleModel
} from 'jupyter-scales';

import {
  JSONToArray
} from 'jupyter-dataserializers';

import {
  copyArray, ScaledArrayModel
} from '../../src/scaled';

import {
  DummyManager
} from './dummy-manager.spec';

import {
  createTestModel
} from './util.spec';

import ndarray = require('ndarray');


class TestModel extends ScaledArrayModel {
  public arrayMismatch() {
    return super.arrayMismatch();
  }

  public scaledDtype() {
    return super.scaledDtype();
  }
}


function createWidgetModel(): ScaledArrayModel {
  let id = uuid();
  let widget_manager = new DummyManager();
  let modelOptions = {
      widget_manager: widget_manager,
      model_id: id,
  }

  let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
  let view = new DataView(raw_data.buffer);
  let scale = createTestModel(LinearScaleModel, {
      domain: [0, 10],
      range: [-10, -5],
    }, widget_manager);
  let attributes = {
    scale,
    array: JSONToArray({
      data: view,
      shape: [2, 3],
      dtype: 'float32',
    }, widget_manager)
  };
  return new ScaledArrayModel(attributes, modelOptions);
}

describe('ScaledArrayModel', () => {

  it('should be creatable', () => {
    let widget_manager = new DummyManager();
    let modelOptions = {
      widget_manager: widget_manager,
      model_id: uuid(),
    }
    let serializedState = {};
    let model = new ScaledArrayModel(serializedState, modelOptions);

    return model.initPromise.then(() => {
      expect(model).to.be.an(ScaledArrayModel);
      expect(model.scaledData).to.be(null);
    });
  });

  it('should compute scaled data when initialized with scale and data', () => {
    let model = createWidgetModel();

    return model.initPromise.then(() => {
      expect(model).to.be.an(ScaledArrayModel);
      expect(model.scaledData!.data).to.eql(new Float32Array([1, 2, 3, 4, 5, 10]));
    });
  });

  it('should resize when setting scale to null', () => {
    let model = createWidgetModel();

    return model.initPromise.then(() => {
      let triggered = false;
      let resized = false;
      model.on('change:scaledData', (options: any) => {
        triggered = true;
        resized = options.resized;
      });
      model.set('scale', null);
      expect(model).to.be.an(ScaledArrayModel);
      expect(triggered).to.be(true);
      expect(resized).to.be(true);
      expect(model.scaledData).to.be(null);
    });
  });

  it('should resize when changing from null', () => {
    let model = createWidgetModel();

    return model.initPromise.then(() => {
      let array = model.get('array') as ndarray;
      model.set('array', null);
      let triggered = false;
      let resized = false;
      model.on('change:scaledData', (options: any) => {
        triggered = true;
        resized = options.resized;
      });
      model.set('array', array);
      expect(model).to.be.an(ScaledArrayModel);
      expect(triggered).to.be(true);
      expect(resized).to.be(true);
      expect(model.scaledData!.data).to.eql(new Float32Array([-9.5, -9, -8.5, -8, -7.5, -5]));
    });
  });

  it('should resize when changing dtype', () => {
    let model = createWidgetModel();

    return model.initPromise.then(() => {
      let array = ndarray(new Float64Array([1, 2, 3, 4, 5, 10]));
      let triggered = false;
      let resized = false;
      model.on('change:scaledData', (options: any) => {
        triggered = true;
        resized = options.resized;
      });
      model.set('array', array);
      expect(model).to.be.an(ScaledArrayModel);
      expect(triggered).to.be(true);
      expect(resized).to.be(true);
      expect(model.scaledData!.data).to.be.a(Float64Array);
      expect(model.scaledData!.data).to.eql(new Float64Array([-9.5, -9, -8.5, -8, -7.5, -5]));
    });
  });

  it('should not resize when still incomplete', () => {
    let model = createWidgetModel();

    return model.initPromise.then(() => {
      let array = model.get('array') as ndarray;
      model.set({array: null, scale: null});
      let triggered = false;
      model.on('change:scaledData', (options: any) => {
        triggered = true;
      });
      model.set('array', array);
      expect(model).to.be.an(ScaledArrayModel);
      expect(triggered).to.be(false);
    });
  });

  it('should write in-place when only content changed', () => {
    let model = createWidgetModel();

    return model.initPromise.then(() => {
      let array = model.get('array') as ndarray;
      array = copyArray(array);
      (array.data as Float32Array)[5] = 0;
      let triggered = false;
      let resized = false;
      model.on('change:scaledData', (options: any) => {
        triggered = true;
        resized = options.resized;
      });
      model.set('array', array);
      expect(model).to.be.an(ScaledArrayModel);
      expect(triggered).to.be(true);
      expect(resized).to.be(false);
      expect(model.scaledData!.data).to.eql(new Float32Array([-9.5, -9, -8.5, -8, -7.5, -10]));
    });
  });

  describe('arrayMismatch', () => {

    it('should be false when both are null', () => {
      let model = createTestModel(TestModel, {
        array: null,
        scale: null,
      });

      return model.initPromise.then(() => {
        expect(model.arrayMismatch()).to.be(false);
      });
    });

    it('should be false when all match', () => {
      let scale = createTestModel(LinearScaleModel, {
        domain: [0, 10],
        range: [-10, -5],
      });
      let model = createTestModel(TestModel, {
        array: ndarray(new Float32Array([1, 2, 3, 4, 5, 10])),
        scale: scale,
      });

      return model.initPromise.then(() => {
        expect(model.arrayMismatch()).to.be(false);
      });
    });

  });

  describe('scaledDtype', () => {

    it('should be undefined when array is null', () => {
      let model = createTestModel(TestModel, {
        array: null,
        scale: null,
      });

      return model.initPromise.then(() => {
        expect(model.scaledDtype()).to.be(undefined);
      });
    });

  });

  describe('getNDArray', () => {

    const model = createWidgetModel();

    it('should return the scaled array', () => {
      expect(model.getNDArray()).to.be(model.scaledData);
      expect(model.getNDArray('scaledData')).to.be(model.scaledData);
    });

    it('should be able to retrieve the source array', () => {
      expect(model.getNDArray('array')).to.be(model.get('array'));
    });

    it('should fail for an incorrcet key', () => {
      expect(model.getNDArray).withArgs('invalid_key').to.throwError();
    });

    it('should recalculate data if invalidated', () => {
      model.scaledData = null;
      let result = model.getNDArray();
      expect(result).to.be(model.scaledData);
      expect(result).to.not.be(null);
    });

  });

});


describe('copyArray', () => {
  const raw_data = new Float32Array([1.4, 2.6, 3.4, 4.4, 5.6, 10.1]);
  const source = ndarray(raw_data, [2, 3]);

  it('should create a copy', () => {
    let copy = copyArray(source);
    expect(copy.data).to.not.be(raw_data);
    expect(copy.data).to.eql(raw_data);
    expect(copy.shape).to.not.be(source.shape);
    expect(copy.shape).to.eql(source.shape);
    expect(copy.stride).to.not.be(source.stride);
    expect(copy.stride).to.eql(source.stride);
  });

  it('should convert dtype when argument given', () => {
    let copy = copyArray(source, 'uint8');
    expect(copy.data).to.eql(new Uint8Array([1, 2, 3, 4, 5, 10]));
  });

  it('should give an error for buffer dtype', () => {
    expect(copyArray).withArgs(source, 'buffer').to.throwError(/Cannot copy.*/);
  });

  it('should give an error for generic dtype', () => {
    expect(copyArray).withArgs(source, 'generic').to.throwError(/Cannot copy.*/);
  });

  it('should give an error for array dtype', () => {
    expect(copyArray).withArgs(source, 'array').to.throwError(/Cannot copy.*/);
  });

  it('should give an error for invalid dtype', () => {
    expect(copyArray).withArgs(source, 'invalid').to.throwError();
  });

});
