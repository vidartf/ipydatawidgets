// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  uuid, WidgetModel
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


async function createWidgetModel(): Promise<ScaledArrayModel> {
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
      buffer: view,
      shape: [2, 3],
      dtype: 'float32',
    }, widget_manager)
  };
  const model = new ScaledArrayModel(attributes, modelOptions);
  await model.initPromise;
  return model;
}

describe('ScaledArrayModel', () => {

  it('should be creatable', async () => {
    let widget_manager = new DummyManager();
    let modelOptions = {
      widget_manager: widget_manager,
      model_id: uuid(),
    }
    let serializedState = {};
    let model = new ScaledArrayModel(serializedState, modelOptions);
    await model.initPromise;

    expect(model).to.be.an(ScaledArrayModel);
    expect(model.scaledData).to.be(null);
  });

  it('should compute scaled data when initialized with scale and data', async () => {
    let model = await createWidgetModel();
    expect(model).to.be.an(ScaledArrayModel);
    expect(model.scaledData!.data).to.eql(new Float32Array([
      -9.5, -9, -8.5, -8, -7.5, -5
    ]));
  });

  it('should resize when setting scale to null', async () => {
    let model = await createWidgetModel();

    let triggered = false;
    let resized = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
      resized = options.resized;
    });
    model.set('scale', null);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(true);
    expect(resized).to.be(true);
    expect(model.scaledData).to.be(null);
  });

  it('should resize when changing from null', async () => {
    let model = await createWidgetModel();

    let array = model.get('array') as ndarray;
    model.set('array', null);
    let triggered = false;
    let resized = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
      resized = options.resized;
    });
    model.set('array', array);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(true);
    expect(resized).to.be(true);
    expect(model.scaledData!.data).to.eql(new Float32Array([-9.5, -9, -8.5, -8, -7.5, -5]));

  });

  it('should resize when changing dtype', async () => {
    let model = await createWidgetModel();

    let array = ndarray(new Float64Array([1, 2, 3, 4, 5, 10]));
    let triggered = false;
    let resized = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
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

  it('should not resize when still incomplete', async () => {
    let model = await createWidgetModel();

    let array = model.get('array') as ndarray;
    model.set({array: null, scale: null});
    let triggered = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
    });
    model.set('array', array);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(false);

  });

  it('should write in-place when only content changed', async () => {
    let model = await createWidgetModel();

    let array = model.get('array') as ndarray;
    array = copyArray(array);
    (array.data as Float32Array)[5] = 0;
    let triggered = false;
    let resized = false;
    model.on('change:scaledData', (model: WidgetModel, value: ndarray | null, options: any) => {
      triggered = true;
      resized = options.resized;
    });
    model.set('array', array);
    expect(model).to.be.an(ScaledArrayModel);
    expect(triggered).to.be(true);
    expect(resized).to.be(false);
    expect(model.scaledData!.data).to.eql(new Float32Array([-9.5, -9, -8.5, -8, -7.5, -10]));

  });

  describe('arrayMismatch', () => {

    it('should be false when both are null', async () => {
      let model = createTestModel(TestModel, {
        array: null,
        scale: null,
      });
      await model.initPromise;

      expect(model.arrayMismatch()).to.be(false);
    });

    it('should be false when all match', async () => {
      let scale = createTestModel(LinearScaleModel, {
        domain: [0, 10],
        range: [-10, -5],
      });
      let model = createTestModel(TestModel, {
        array: ndarray(new Float32Array([1, 2, 3, 4, 5, 10])),
        scale: scale,
      });
      await model.initPromise;

      expect(model.arrayMismatch()).to.be(false);
    });

  });

  describe('scaledDtype', () => {

    it('should be undefined when array is null', async () => {
      let model = createTestModel(TestModel, {
        array: null,
        scale: null,
      });
      await model.initPromise;

      expect(model.scaledDtype()).to.be(undefined);
    });

  });

  describe('getNDArray', async () => {

    const model = await createWidgetModel();

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

  describe('IDataWriteBack', () => {

    describe('canWriteBack', () => {

      let model: ScaledArrayModel;

      beforeEach(async () => {
        model = await createWidgetModel();
      });

      afterEach(() => {
        model.close();
      });

      it('should return true for key "array"', () => {
        expect(model.canWriteBack('array')).to.be(true);
      });

      it('should return false for "scaledData" if scale is null', () => {
        model.set('scale', null);
        expect(model.canWriteBack()).to.be(false);
      });

      it('should return false for "scaledData" if scale does not have invert', () => {
        const scale = model.get('scale');
        scale.obj.invert = undefined;
        expect(model.canWriteBack()).to.be(false);
      });

      it('should return true for "scaledData" if scale has invert', () => {
        expect(model.canWriteBack()).to.be(true);
      });

      it('should return false for other keys', () => {
        expect(model.canWriteBack('foo')).to.be(false);
      });

    });

    describe('setNDArray', () => {

      let model: ScaledArrayModel;

      beforeEach(async () => {
        model = await createWidgetModel();
      });

      afterEach(() => {
        model.close();
      });

      it('should set the array on the model for key "array"', () => {
        const array = ndarray(new Float32Array([8, 6, 4]));
        model.setNDArray(array, 'array');
        expect(model.getNDArray('array')).to.be(array);
        // Should also recompute scaledData when setting array:
        const scaled = model.getNDArray('scaledData')!;
        expect(scaled.data).to.eql(new Float32Array([-6, -7, -8]));
      });

      it('should set both to null with null input and default key', () => {
        model.setNDArray(null);
        expect(model.getNDArray('array')).to.be(null);
        expect(model.getNDArray()).to.be(null);
      });

      it('should set both to null if scale is null with default key', () => {
        const array = ndarray(new Float32Array([8, 6, 4]));
        model.set('scale', null);
        model.setNDArray(array);
        expect(model.getNDArray('array')).to.be(null);
        expect(model.getNDArray()).to.be(null);
      });

      it('should set both arrays as expected', () => {
        const array = ndarray(new Float32Array([-6, -7, -8]));
        model.setNDArray(array);
        expect(model.getNDArray('array')!.data).to.eql(new Float32Array([8, 6, 4]));
        expect(model.getNDArray()!.data).to.eql(array.data);
      });

      it('should set the array on the model for other keys', () => {
        const array = ndarray(new Float32Array([8, 6, 4]));
        model.setNDArray(array, 'foobar');
        expect(model.getNDArray('foobar')).to.be(array);
      });

      it('should pass the options to change event', () => {
        let condA = false;
        let condB = false;
        model.once('change:array', (model: WidgetModel, value: ndarray | null, options?: any) => {
          if (options.foo === 'bar') {
            condA = true;
          } else {
            throw new Error(`options.foo !== 'bar'. options: ${JSON.stringify(options)}`);
          }
        });
        model.once('change:scaledData', (model: WidgetModel, value: ndarray | null, options?: any) => {
          if (options.foo === 'bar') {
            condB = true;
          } else {
            throw new Error(`options.foo !== 'bar'. options: ${JSON.stringify(options)}`);
          }
        });
        const array = ndarray(new Float32Array([8, 6, 4]));
        const options = {foo: 'bar'};
        model.setNDArray(array, 'scaledData', options);
        expect(condA).to.be(true);
        expect(condB).to.be(true);
      });

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
