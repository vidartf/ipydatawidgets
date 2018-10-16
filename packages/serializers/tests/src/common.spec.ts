
import {
  WidgetModel
} from '@jupyter-widgets/base';

import {
  getArray, IDataSource, setArray, IDataWriteBack, DataWidget
} from '../../src';

import {
  createTestModel
} from './testhelper.spec';

import ndarray = require('ndarray');


class DummyDataSource implements IDataSource {
  constructor(public raw_data: Float32Array) {
    this.array = ndarray(this.raw_data, [2, 3]);
  }

  getNDArray(key?: string): ndarray | null {
    return this.array;
  }

  array: ndarray | null;
}


class DummyWriteBack extends DummyDataSource implements IDataWriteBack {

  canWriteBack(key?: string): boolean {
    return this.canWrite;
  }

  setNDArray(array: ndarray | null, key?: string): void {
    this.array = array;
  }

  canWrite = true;
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


describe('setArray', () => {

  const attrKey = 'myTestKey';
  const userData = {id: 'myCustomData'};

  it('should replace the array when current is null', () => {

      // First set up a widget model with initial state
      let model = createTestModel(WidgetModel, {
        [attrKey]: null
      });

      let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
      setArray(model, attrKey, array, userData);
      expect(model.get(attrKey)).to.be(array);

  });

  it('should replace the array when current is array', () => {

    // First set up a widget model with initial state
    let model = createTestModel(WidgetModel, {
      [attrKey]: new Float32Array([4, 8, 6])
    });

    let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
    setArray(model, attrKey, array, userData);
    expect(model.get(attrKey)).to.be(array);

  });

  it('should replace the array when current does not implement write-back', () => {

    // First set up a widget model with initial state
    let model = createTestModel(WidgetModel, {
      [attrKey]: new DummyDataSource(new Float32Array([]))
    });

    let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
    setArray(model, attrKey, array, userData);
    expect(model.get(attrKey)).to.be(array);

  });

  it('should replace the array when canWriteBack returns false', () => {

    // First set up a widget model with initial state
    const current = new DummyWriteBack(new Float32Array([]));
    current.canWrite = false;

    let model = createTestModel(WidgetModel, {
      [attrKey]: current
    });

    let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
    setArray(model, attrKey, array, userData);
    expect(model.get(attrKey)).to.be(array);
    // Check no changes to current data:
    expect(current.array!.data === current.raw_data);

  });

  it('should write back when current can write back', () => {

    // First set up a widget model with initial state
    const current = new DummyWriteBack(new Float32Array([]));
    current.canWrite = true;

    let model = createTestModel(WidgetModel, {
      [attrKey]: current
    });

    let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
    setArray(model, attrKey, array, userData);
    expect(model.get(attrKey)).to.be(current);
    expect(current.array === array);

  });

});
