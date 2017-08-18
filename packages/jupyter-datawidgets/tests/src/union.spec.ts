// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import ndarray = require('ndarray');

import {
  uuid
} from '@jupyter-widgets/base';

import {
  DummyManager
} from './dummy-manager.spec';

import {
  JSONToUnion, JSONToUnionArray, unionToJSON, IReceivedSerializedArray, ISendSerializedArray,
  NDArrayModel, getArrayFromUnion
} from '../../src/'


function createWidgetModel(): NDArrayModel {
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
  let attributes = NDArrayModel._deserialize_state(serializedState, widget_manager);
  return new NDArrayModel(attributes, modelOptions);
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
      let attributesPromise = NDArrayModel._deserialize_state(serializedState, widget_manager);
      return attributesPromise.then((attributes) => {
        let model = new NDArrayModel(attributes, modelOptions);
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
        let arr = array as ndarray.NDArray;
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
      let attributesPromise = NDArrayModel._deserialize_state(serializedState, widget_manager);
      return attributesPromise.then((attributes) => {
        let model = new NDArrayModel(attributes, modelOptions);
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

   describe('getArrayFromUnion', () => {

    it('should return the array when given an array', () => {
      let array = ndarray(new Float32Array([1, 2, 3, 4, 5, 10]));
      let output = getArrayFromUnion(array);
      expect(output).to.be(array);
    });

    it('should return the inner array when given a model', () => {
      let model = createWidgetModel();
      let output = getArrayFromUnion(model);
      expect(output).to.be(model.get('array'));
    });

   });

});
