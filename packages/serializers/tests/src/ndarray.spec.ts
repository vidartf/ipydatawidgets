// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  DummyManager
} from './dummy-manager.spec';

import {
  createTestModel, TestModel
} from './util.spec';

import {
  arrayToJSON, JSONToArray, IReceivedSerializedArray,
  IReceivedCompressedSerializedArray,
  ensureSerializableDtype, typesToArray,
  arrayToCompressedJSON, compressedJSONToArray, ISendCompressedSerializedArray
} from '../../src'

import ndarray = require('ndarray');

import pako = require("pako");


describe('ndarray', () => {

  describe('serializers', () => {

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
      let widget_manager = new DummyManager();

      let model = createTestModel(TestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);
      model.set('compression_level', 0);

      let jsonData = arrayToCompressedJSON(model.array, model)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(model.raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

    });

    it('should serialize a compressed ndarray', () => {

      // First set up a test NDArrayModel
      let widget_manager = new DummyManager();

      let model = createTestModel(TestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);
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
      let widget_manager = new DummyManager();

      let model = createTestModel(TestModel, {}, widget_manager);
      (widget_manager as any)._models[model.model_id] = Promise.resolve(model);
      model.unset('compression_level');

      let jsonData = arrayToCompressedJSON(model.array, model)!;

      expect(jsonData.buffer).to.be.a(Float32Array);
      expect((jsonData.buffer as Float32Array).buffer).to.be(model.raw_data.buffer);
      expect(jsonData.shape).to.eql([2, 3]);
      expect(jsonData.dtype).to.be('float32');

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

});
