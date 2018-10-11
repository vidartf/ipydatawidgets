// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import ndarray = require('ndarray');

import {
  JSONToUnion, JSONToUnionArray, unionToJSON, IReceivedSerializedArray,
  ISendSerializedArray, listenToUnion, JSONToUnionTypedArray,
  unionTypedArrayToJSON, JSONToSimpleUnion, simpleUnionToJSON
} from '../../src';

import {
  DummyManager
} from './dummy-manager.spec';

import {
  createTestModel, TestModel, NullTestModel
} from './util';


describe('Union Serializers', () => {

  describe('JSONToUnionArray', () => {

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let arrayPromise = JSONToUnionArray(jsonData);

      return arrayPromise.then((array) => {
        expect(array!.data).to.be.a(Float32Array);
        expect((array!.data as Float32Array).buffer).to.be(raw_data.buffer);
        expect(array!.shape).to.eql([2, 3]);
        expect(array!.dtype).to.be('float32');

      });
    });

    it('should deserialize null to null', () => {
      return JSONToUnionArray(null).then((output) => {
        expect(output).to.be(null);
      })
    });

    it('should deserialize a widget ref to an array', () => {

      // First set up an NDArrayModel

      let widget_manager = new DummyManager();

      let model = createTestModel(TestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);

      // Model is now set up. Try to deserialize a reference to the widget:
      let jsonData = model.toJSON(undefined);
      return JSONToUnionArray(jsonData, widget_manager).then((array) => {
        // Ensure that the ref deserializes to the inner ndarray:
        expect(array!.data).to.be.a(Float32Array);
        expect((array!.data as Float32Array).buffer).to.be(model.raw_data.buffer);
        expect(array!.shape).to.eql([2, 3]);
        expect(array!.dtype).to.be('float32');
      });
    });

  });

  describe('JSONToUnion', () => {

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let arrayPromise = JSONToUnion(jsonData);

      return arrayPromise.then((array) => {
        let arr = array as ndarray;
        expect(arr.data).to.be.a(Float32Array);
        expect((arr.data as Float32Array).buffer).to.be(raw_data.buffer);
        expect(arr.shape).to.eql([2, 3]);
        expect(arr.dtype).to.be('float32');

      });
    });

    it('should deserialize null to null', () => {
      return JSONToUnionArray(null).then((output) => {
        expect(output).to.be(null);
      })
    });

    it('should deserialize a widget ref to a model ', () => {

      // First set up an NDArrayModel

      let widget_manager = new DummyManager();

      let model = createTestModel(TestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);

      // Model is now set up. Try to deserialize a reference to the widget:
      let jsonData = model.toJSON(undefined);
      return JSONToUnion(jsonData, widget_manager).then((arrayModelRaw) => {
        let arrayModel = arrayModelRaw as TestModel;
        // Ensure that the ref deserializes to a widget:
        expect(arrayModel).to.be.a(TestModel);
        let array = (arrayModel as TestModel).array;
        expect(array!.data).to.be.a(Float32Array);
        expect((array!.data as Float32Array).buffer).to.be(model.raw_data.buffer);
        expect(array!.shape).to.eql([2, 3]);
        expect(array!.dtype).to.be('float32');
      });

    });

  });

  describe('unionToJSON', () => {

    it('should serialize an ndarray', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let array = ndarray(raw_data, [2, 3]);

      let jsonData = unionToJSON(array) as ISendSerializedArray;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = unionToJSON(null);
      expect(output).to.be(null);
    });

    it('should serialize a widget', () => {
      let model = createTestModel(TestModel);

      let jsonData = unionToJSON(model);
      expect(jsonData).to.be(model.toJSON(undefined));
    });

  });

  describe('JSONToUnionTypedArray', () => {

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let arrayPromise = JSONToUnionTypedArray(jsonData);

      return arrayPromise.then((array) => {
        expect(array).to.be.a(Float32Array);
        expect((array as Float32Array).buffer).to.be(raw_data.buffer);
        expect(array!.length).to.eql(6);

      });
    });

    it('should deserialize null to null', () => {
      return JSONToUnionTypedArray(null).then((output) => {
        expect(output).to.be(null);
      })
    });

    it('should deserialize a widget ref to an array', () => {

      // First set up an NDArrayModel

      let widget_manager = new DummyManager();

      let model = createTestModel(TestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);

      // Model is now set up. Try to deserialize a reference to the widget:
      let jsonData = model.toJSON(undefined);
      return JSONToUnionTypedArray(jsonData, widget_manager).then((array) => {
        // Ensure that the ref deserializes to the inner typed array:
        expect(array).to.be.a(Float32Array);
        expect((array as Float32Array).buffer).to.be(model.raw_data.buffer);
        expect(array!.length).to.eql(6);
      });
    });

    it('should deserialize a widget ref with null array to null', () => {

      // First set up an NDArrayModel

      let widget_manager = new DummyManager();

      let model = createTestModel(NullTestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);

      // Model is now set up. Try to deserialize a reference to the widget:
      let jsonData = model.toJSON(undefined);
      return JSONToUnionTypedArray(jsonData, widget_manager).then((array) => {
        // Ensure that the ref deserializes to null:
        expect(array).to.be(null);
      });
    });

  });

  describe('unionTypedArrayToJSON', () => {

    it('should serialize a TypedArray', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);

      let jsonData = unionTypedArrayToJSON(raw_data) as ISendSerializedArray;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([6]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = unionTypedArrayToJSON(null);
      expect(output).to.be(null);
    });

    it('should serialize a widget', () => {
      let model = createTestModel(TestModel);

      let jsonData = unionTypedArrayToJSON(model);
      expect(jsonData).to.be(model.toJSON(undefined));
    });

  });

  describe('JSONToSimpleUnion', () => {

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let objPromise = JSONToSimpleUnion(jsonData);

      return objPromise.then((obj) => {
        expect(obj!.array).to.be.a(Float32Array);
        expect((obj!.array as Float32Array).buffer).to.be(raw_data.buffer);
        expect(obj!.shape).to.eql([2, 3]);

      });
    });

    it('should deserialize null to null', () => {
      return JSONToSimpleUnion(null).then((output) => {
        expect(output).to.be(null);
      })
    });

    it('should deserialize a widget ref to a simple object', () => {

      // First set up an NDArrayModel

      let widget_manager = new DummyManager();

      let model = createTestModel(TestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);

      // Model is now set up. Try to deserialize a reference to the widget:
      let jsonData = model.toJSON(undefined);
      return JSONToSimpleUnion(jsonData, widget_manager).then((obj) => {
        // Ensure that the ref deserializes to the inner ndarray:
        expect(obj!.array).to.be.a(Float32Array);
        expect((obj!.array as Float32Array).buffer).to.be(model.raw_data.buffer);
        expect(obj!.shape).to.eql([2, 3]);
      });
    });

    it('should deserialize a widget ref with null array to null', () => {

      // First set up an NDArrayModel

      let widget_manager = new DummyManager();

      let model = createTestModel(NullTestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);

      // Model is now set up. Try to deserialize a reference to the widget:
      let jsonData = model.toJSON(undefined);
      return JSONToSimpleUnion(jsonData, widget_manager).then((array) => {
        // Ensure that the ref deserializes to null:
        expect(array).to.be(null);
      });
    });

  });

  describe('simpleUnionToJSON', () => {

    it('should serialize a simple object', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let obj = {array: raw_data, shape: [2, 3]}

      let jsonData = simpleUnionToJSON(obj) as ISendSerializedArray;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = simpleUnionToJSON(null);
      expect(output).to.be(null);
    });

    it('should serialize a widget', () => {
      let model = createTestModel(TestModel);

      let jsonData = simpleUnionToJSON(model);
      expect(jsonData).to.be(model.toJSON(undefined));
    });

  });

  describe('listenToUnion', () => {

    it('should listen to widget changes', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      parent.set('array', child);
      let called = false;
      let cb = function() { called = true; };

      listenToUnion(parent, 'array', cb);
      child.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(true);
    });

    it('should stop listening to widget changes', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      parent.set('array', child);
      let called = false;
      let cb = function() { called = true; };

      let stop = listenToUnion(parent, 'array', cb);
      child.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(true);
      called = false;
      stop();
      child.set('array', new Float32Array([7, 3, 6, 6]));
      expect(called).to.be(false);
    });

    it('should stop listening when changing to array', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      parent.set('array', child);
      let called = false;
      let cb = function() { called = true; };

      listenToUnion(parent, 'array', cb);
      parent.set('array', new Float32Array([4, 5, 6]));
      child.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(false);
    });

    it('should start listening when changing to a widget', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      let called = false;
      let cb = function() { called = true; };

      listenToUnion(parent, 'array', cb);
      parent.set('array', child);
      child.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(true);
    });

    it('should not call for array/widget changes if not allChanged', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      let called = false;
      let cb = function() { called = true; };

      listenToUnion(parent, 'array', cb);
      parent.set('array', child);
      parent.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(false);
    });

    it('should call for array/widget changes if allChanged', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      let numCalled = 0;
      let cb = function() { ++numCalled; };

      listenToUnion(parent, 'array', cb, true);
      parent.set('array', child);
      parent.set('array', new Float32Array([4, 5, 6]));
      expect(numCalled).to.be(2);
    });

    it('should call for array/array changes if allChanged', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      let numCalled = 0;
      let cb = function() { ++numCalled; };

      listenToUnion(parent, 'array', cb, true);
      parent.set('array', new Float32Array([4, 5, 6]));
      parent.set('array', new Float32Array([3, 2, 6]));
      expect(numCalled).to.be(2);
    });

    it('should handle setting to/from null', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      let numCalled = 0;
      let cb = function() { ++numCalled; };

      listenToUnion(parent, 'array', cb, true);
      parent.set('array', null);
      parent.set('array', new Float32Array([3, 2, 6]));
      expect(numCalled).to.be(2);
    });

    it('should not call for anything after stop called', () => {
      let parent = createTestModel(TestModel);
      let child = createTestModel(TestModel);
      // Make parent's array be a union type pointing to another widget
      let numCalled = 0;
      let cb = function() { ++numCalled; };

      let stop = listenToUnion(parent, 'array', cb, true);
      parent.set('array', new Float32Array([4, 5, 6]));
      parent.set('array', new Float32Array([3, 2, 6]));

      // Stop here (call count 2):
      stop();
      parent.set('array', child);
      child.set('array', new Float32Array([4, 5, 6]));
      child.set('array', new Float32Array([3, 2, 6]));
      child.set('array', null);
      parent.set('array', null);
      parent.set('array', new Float32Array([3, 2, 6]));
      expect(numCalled).to.be(2);
    });

  });

});
