// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import ndarray = require('ndarray');

import {
  uuid
} from '@jupyter-widgets/base';

import {
  JSONToUnion, JSONToUnionArray, unionToJSON, IReceivedSerializedArray,
  ISendSerializedArray, listenToUnion
} from 'jupyter-dataserializers'

import {
  DummyManager
} from './dummy-manager.spec';

import {
  createTestModel
} from './util.spec';

import {
  NDArrayModel
} from '../../src/'


function createWidgetModel(): NDArrayModel {
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

      let id = uuid();
      let widget_manager = new DummyManager();
      let modelOptions = {
          widget_manager: widget_manager,
          model_id: id,
      }

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let serializedState = { array: {
          buffer: view,
          shape: [2, 3],
          dtype: 'float32',
      }};
      let attributesPromise = NDArrayModel._deserialize_state(serializedState as any, widget_manager);
      return attributesPromise.then((attributes) => {
        let model = new NDArrayModel(attributes, modelOptions as any);
        (widget_manager as any)._models[id] = Promise.resolve(model);

        // Model is now set up. Try to deserialize a reference to the widget:
        let jsonData = model.toJSON(undefined);
        return JSONToUnionArray(jsonData, widget_manager)
      }).then((array) => {
        // Ensure that the ref deseriealizes to the inner ndarray:
        expect(array!.data).to.be.a(Float32Array);
        expect((array!.data as Float32Array).buffer).to.be(raw_data.buffer);
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
        let arr = array as ndarray.NdArray;
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

      let id = uuid();
      let widget_manager = new DummyManager();
      let modelOptions = {
          widget_manager: widget_manager,
          model_id: id,
      }

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let serializedState = { array: {
          buffer: view,
          shape: [2, 3],
          dtype: 'float32',
      }};
      let attributesPromise = NDArrayModel._deserialize_state(serializedState as any, widget_manager);
      return attributesPromise.then((attributes) => {
        let model = new NDArrayModel(attributes, modelOptions as any);
        (widget_manager as any)._models[id] = Promise.resolve(model);

        // Model is now set up. Try to deserialize a reference to the widget:
        let jsonData = model.toJSON(undefined);
        return JSONToUnion(jsonData, widget_manager)
      }).then((arrayModelRaw) => {
        let arrayModel = arrayModelRaw as NDArrayModel;
        // Ensure that the ref deseriealizes to a widget:
        expect(arrayModel).to.be.a(NDArrayModel);
        let array = arrayModel.get('array');
        expect(array!.data).to.be.a(Float32Array);
        expect((array!.data as Float32Array).buffer).to.be(raw_data.buffer);
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
      let model = createWidgetModel();

      let jsonData = unionToJSON(model);
      expect(jsonData).to.be(model.toJSON(undefined));
    });

  });

  describe('listenToUnion', () => {

    it('should listen to widget changes', () => {
      let parent = createWidgetModel();
      let child = createWidgetModel();
      // Make parent's array be a union type pointing to another widget
      parent.set('array', child);
      let called = false;
      let cb = function() { called = true; };

      listenToUnion(parent, 'array', cb);
      child.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(true);
    });

    it('should stop listening to widget changes', () => {
      let parent = createWidgetModel();
      let child = createWidgetModel();
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
      let parent = createWidgetModel();
      let child = createWidgetModel();
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
      let parent = createWidgetModel();
      let child = createWidgetModel();
      // Make parent's array be a union type pointing to another widget
      let called = false;
      let cb = function() { called = true; };

      listenToUnion(parent, 'array', cb);
      parent.set('array', child);
      child.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(true);
    });

    it('should not call for array/widget changes if not allChanged', () => {
      let parent = createWidgetModel();
      let child = createWidgetModel();
      // Make parent's array be a union type pointing to another widget
      let called = false;
      let cb = function() { called = true; };

      listenToUnion(parent, 'array', cb);
      parent.set('array', child);
      parent.set('array', new Float32Array([4, 5, 6]));
      expect(called).to.be(false);
    });

    it('should call for array/widget changes if allChanged', () => {
      let parent = createWidgetModel();
      let child = createWidgetModel();
      // Make parent's array be a union type pointing to another widget
      let numCalled = 0;
      let cb = function() { ++numCalled; };

      listenToUnion(parent, 'array', cb, true);
      parent.set('array', child);
      parent.set('array', new Float32Array([4, 5, 6]));
      expect(numCalled).to.be(2);
    });

    it('should call for array/array changes if allChanged', () => {
      let parent = createWidgetModel();
      let child = createWidgetModel();
      // Make parent's array be a union type pointing to another widget
      let numCalled = 0;
      let cb = function() { ++numCalled; };

      listenToUnion(parent, 'array', cb, true);
      parent.set('array', new Float32Array([4, 5, 6]));
      parent.set('array', new Float32Array([3, 2, 6]));
      expect(numCalled).to.be(2);
    });

    it('should handle setting to/from null', () => {
      let parent = createWidgetModel();
      let child = createWidgetModel();
      // Make parent's array be a union type pointing to another widget
      let numCalled = 0;
      let cb = function() { ++numCalled; };

      listenToUnion(parent, 'array', cb, true);
      parent.set('array', null);
      parent.set('array', new Float32Array([3, 2, 6]));
      expect(numCalled).to.be(2);
    });

    it('should not call for anything after stop called', () => {
      let parent = createWidgetModel();
      let child = createWidgetModel();
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
