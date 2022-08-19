// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');
import { ManagerBase } from '@jupyter-widgets/base-manager';

import {
  createTestModel, TestModel, createModelWithSerializers
} from './testhelper.spec';

import {
  arrayToJSON, JSONToArray, IReceivedSerializedArray,
  IReceivedCompressedSerializedArray,
  ensureSerializableDtype, typesToArray,
  arrayToCompressedJSON, compressedJSONToArray, ISendCompressedSerializedArray,
  JSONToTypedArray, typedArrayToJSON, JSONToSimple,
  simpleToJSON, typedArrayToType, fixed_shape_serialization,
  array_serialization, compressed_array_serialization,
  typedarray_serialization, simplearray_serialization
} from '../../src'

import ndarray = require('ndarray');

import pako = require("pako");


describe('ndarray', () => {

  describe('standard serializers', () => {

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let array = JSONToArray(jsonData)!;

      expect(array.data).to.be.a(Float32Array);
      expect((array.data as Float32Array).buffer).to.be(raw_data.buffer);
      expect(array.shape).to.eql([2, 3]);
      expect(array.dtype).to.be('float32');

    });

    it('should deserialize null to null', () => {
      let output = JSONToArray(null);
      expect(output).to.be(null);
    });

    it('should serialize an ndarray', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let array = ndarray(raw_data, [2, 3]);

      let jsonData = arrayToJSON(array)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = arrayToJSON(null);
      expect(output).to.be(null);
    });

    it('should give back original when roundtripped', async () => {
      // Round-trip through widget machienery to ensure compliance
      const model = createModelWithSerializers({array: array_serialization});
      model.set('array', model.array);
      const manager = model.widget_manager as ManagerBase;
      const state = await manager.get_state();
      await manager.clear_state();
      const remodels = await manager.set_state(state);
      expect(remodels.length).to.be(1);
      expect(remodels[0].attributes).to.eql(model.attributes);
    });

  });


  describe('compressed serializers', () => {

    it('should deserialize a non-compressed array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let array = compressedJSONToArray(jsonData)!;

      expect(array.data).to.be.a(Float32Array);
      expect((array.data as Float32Array).buffer).to.be(raw_data.buffer);
      expect(array.shape).to.eql([2, 3]);
      expect(array.dtype).to.be('float32');

    });

    it('should deserialize a compressed array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      const level = 6;
      let view = new DataView(pako.deflate(raw_data.buffer as any, { level }).buffer);
      let jsonData = {
        compressed_buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedCompressedSerializedArray;

      let array = compressedJSONToArray(jsonData)!;

      expect(array.data).to.be.a(Float32Array);
      // Not .to.be here, as run through compression loop:
      expect((array.data as Float32Array).buffer).to.not.be(raw_data.buffer);
      expect((array.data as Float32Array).buffer).to.eql(raw_data.buffer);
      expect(array.shape).to.eql([2, 3]);
      expect(array.dtype).to.be('float32');

    });

    it('should deserialize null to null', () => {
      let output = compressedJSONToArray(null);
      expect(output).to.be(null);
    });

    it('should serialize an uncompressed ndarray', () => {

      // First set up a test NDArrayModel
      let model = createTestModel(TestModel);
      model.set('compression_level', 0);

      let jsonData = arrayToCompressedJSON(model.array, model)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(model.raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize a compressed ndarray', () => {

      // First set up a test NDArrayModel
      let model = createTestModel(TestModel);
      model.set('compression_level', 6);

      let jsonData = arrayToCompressedJSON(model.array, model) as ISendCompressedSerializedArray;

      expect(jsonData.buffer).to.be(undefined);
      expect(jsonData.compressed_buffer).to.be.a(Uint8Array);
      // Not .to.be here, as run through compression loop:
      expect(jsonData.compressed_buffer!.buffer).to.not.be(model.raw_data.buffer);
      expect(jsonData.compressed_buffer).to.not.eql(
        new Uint8Array(model.raw_data.buffer));
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = arrayToCompressedJSON(null);
      expect(output).to.be(null);
    });

    it('should not compress when model not given', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let array = ndarray(raw_data, [2, 3]);

      let jsonData = arrayToCompressedJSON(array)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should not compress a model without compression_level', () => {

      // First set up a test NDArrayModel
      let model = createTestModel(TestModel);
      model.unset('compression_level');

      let jsonData = arrayToCompressedJSON(model.array, model)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(model.raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should give back original when roundtripped', async () => {
      // Round-trip through widget machienery to ensure compliance
      const model = createModelWithSerializers({array: compressed_array_serialization});
      model.set('array', model.array);
      const manager = model.widget_manager as ManagerBase;
      const state = await manager.get_state();
      await manager.clear_state();
      const remodels = await manager.set_state(state);
      expect(remodels.length).to.be(1);
      expect(remodels[0].attributes).to.eql(model.attributes);
    });

  });
  describe('TypedArray serializers', () => {

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let array = JSONToTypedArray(jsonData)!;

      expect(array).to.be.a(Float32Array);
      expect((array as Float32Array).buffer).to.be(raw_data.buffer);
      expect(array.length).to.eql(6);

    });

    it('should deserialize null to null', () => {
      let output = JSONToTypedArray(null);
      expect(output).to.be(null);
    });

    it('should serialize an ndarray', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);

      let jsonData = typedArrayToJSON(raw_data)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([6]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = typedArrayToJSON(null);
      expect(output).to.be(null);
    });

    it('should give back original when roundtripped', async () => {
      // Round-trip through widget machienery to ensure compliance
      const model = createModelWithSerializers({array: typedarray_serialization});
      model.set('array', model.array.data);
      const manager = model.widget_manager as ManagerBase;
      const state = await manager.get_state();
      await manager.clear_state();
      const remodels = await manager.set_state(state);
      expect(remodels.length).to.be(1);
      expect(remodels[0].attributes).to.eql(model.attributes);
    });

  });

  describe('simple serializers', () => {

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 3],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let obj = JSONToSimple(jsonData)!;

      expect(obj.array).to.be.a(Float32Array);
      expect((obj.array as Float32Array).buffer).to.be(raw_data.buffer);
      expect(obj.shape).to.eql([2, 3]);

    });

    it('should deserialize null to null', () => {
      let output = JSONToSimple(null);
      expect(output).to.be(null);
    });

    it('should serialize an ndarray', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let obj = {array: raw_data, shape: [2, 3]}

      let jsonData = simpleToJSON(obj)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = simpleToJSON(null);
      expect(output).to.be(null);
    });

    it('should give back original when roundtripped', async () => {
      // Round-trip through widget machienery to ensure compliance
      const model = createModelWithSerializers({array: simplearray_serialization});
      model.set('array', {array: model.array.data, shape: model.array.shape});
      const manager = model.widget_manager as ManagerBase;
      const state = await manager.get_state();
      await manager.clear_state();
      const remodels = await manager.set_state(state);
      expect(remodels.length).to.be(1);
      expect(remodels[0].attributes).to.eql(model.attributes);
    });

  });

  describe('fixed shape serializers', () => {

    const serializer = fixed_shape_serialization([3, 2]);

    it('should deserialize an array', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [3, 2],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      let obj = serializer.deserialize(jsonData)!;

      expect(obj).to.be.a(Float32Array);
      expect(obj.buffer).to.be(raw_data.buffer);

    });

    it('should deserialize null to null', () => {
      let output = serializer.deserialize(null);
      expect(output).to.be(null);
    });

    it('should throw an error for invalid shape on deserialize', () => {

      let raw_data = new Float32Array([1, 2, 3, 4]);
      let view = new DataView(raw_data.buffer);
      let jsonData = {
        buffer: view,
        shape: [2, 2],
        dtype: 'float32',
      } as IReceivedSerializedArray;

      expect(serializer.deserialize).withArgs(jsonData).to.throwError(
        /^Incoming data unexpected shape.*/);
    });

    it('should serialize an ndarray', () => {

      let raw_data = new Float32Array([1, 2, 3, 4, 5, 10]);

      let jsonData = serializer.serialize(raw_data)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(raw_data.buffer);
      expect(jsonData.shape).to.eql([3, 2]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize null to null', () => {
      let output = serializer.serialize(null);
      expect(output).to.be(null);
    });

    it('should throw an error for invalid shape on serialize', () => {

      let raw_data = new Float32Array([1, 2, 3, 4]);

      expect(serializer.serialize).withArgs(raw_data).to.throwError(
        /^Data has wrong size for fixed shape serialization!.*/);
    });

    it('should give back original when roundtripped', async () => {
      // Round-trip through widget machienery to ensure compliance
      const model = createModelWithSerializers({array: serializer});
      model.set('array', model.raw_data);
      const manager = model.widget_manager as ManagerBase;
      const state = await manager.get_state();
      await manager.clear_state();
      const remodels = await manager.set_state(state);
      expect(remodels.length).to.be(1);
      expect(remodels[0].attributes).to.eql(model.attributes);
    });

  });

  describe('ensureSerializableDtype', () => {

    it('should raise an error for array dtype', () => {
      expect(ensureSerializableDtype)
        .withArgs('array').to.throwException(/Cannot serialize.*/);
    });

    it('should raise an error for buffer dtype', () => {
      expect(ensureSerializableDtype)
        .withArgs('buffer').to.throwException(/Cannot serialize.*/);
    });

    it('should raise an error for generic dtype', () => {
      expect(ensureSerializableDtype)
        .withArgs('generic').to.throwException(/Cannot serialize.*/);
    });

    it('should return uint8 for uint8_clamped', () => {
      expect(ensureSerializableDtype('uint8_clamped')).to.be('uint8');
    });

    it('should return uchanged value for everything else', () => {
      for (let k in typesToArray) {
        if (k === 'uint8_clamped') {
          continue;
        }
        expect(ensureSerializableDtype(k as any)).to.be(k);
      }
    });

  });

  describe('typedArrayToType', () => {

    it('should handle int8', () => {
      expect(typedArrayToType(new Int8Array(0))).to.be('int8');
    });

    it('should handle uint8', () => {
      expect(typedArrayToType(new Uint8Array(0))).to.be('uint8');
    });

    it('should handle int16', () => {
      expect(typedArrayToType(new Int16Array(0))).to.be('int16');
    });

    it('should handle uint16', () => {
      expect(typedArrayToType(new Uint16Array(0))).to.be('uint16');
    });

    it('should handle int32', () => {
      expect(typedArrayToType(new Int32Array(0))).to.be('int32');
    });

    it('should handle uint32', () => {
      expect(typedArrayToType(new Uint32Array(0))).to.be('uint32');
    });

    it('should handle float32', () => {
      expect(typedArrayToType(new Float32Array(0))).to.be('float32');
    });

    it('should handle float64', () => {
      expect(typedArrayToType(new Float64Array(0))).to.be('float64');
    });

    it('should return uint8 for clamped array', () => {
      expect(typedArrayToType(new Uint8ClampedArray(0))).to.be('uint8');
    });

    it('should raise an error for unknown types', () => {
      expect(typedArrayToType)
        .withArgs([]).to.throwException(/Unknown TypedArray type.*/);
    });

  });

});
