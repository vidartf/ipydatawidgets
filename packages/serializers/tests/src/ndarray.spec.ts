// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  uuid
} from '@jupyter-widgets/base';

import {
  arrayToJSON, JSONToArray, IReceivedSerializedArray,
  ensureSerializableDtype, typesToArray
} from '../../src'

import ndarray = require('ndarray');


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
