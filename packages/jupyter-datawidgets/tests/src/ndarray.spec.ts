// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  uuid
} from '@jupyter-widgets/base';

import {
  arrayToJSON, JSONToArray, IReceivedSerializedArray,
  isDataWriteBack
} from 'jupyter-dataserializers'

import {
  NDArrayModel
} from '../../src/'

import {
  DummyManager
} from './dummy-manager.spec';

import ndarray = require('ndarray');


describe('NDArray', () => {

  describe('NDArrayModel', () => {

    it('should be creatable', () => {
      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let serializedState = {};
      let model = new NDArrayModel(serializedState, modelOptions);

      expect(model).to.be.an(NDArrayModel);
      let array = model.get('array');
      expect(array.data.length).to.be(0);
    });

    describe('getNDArray', () => {

      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let serializedState = {};
      let model = new NDArrayModel(serializedState, modelOptions);

      it('should return the inner array', () => {
        expect(model.getNDArray()).to.eql(model.get('array'));
        expect(model.getNDArray('array')).to.eql(model.get('array'));
      });

      it('should fail for an incorrcet key', () => {
        expect(model.getNDArray).withArgs('invalid_key').to.throwError();
      });

    });

    describe('IDataWriteBack', () => {

      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let serializedState = {};
      let model = new NDArrayModel(serializedState, modelOptions);

      it('isDataWriteBack should return true', () => {
        expect(isDataWriteBack(model)).to.be(true);
      });

      describe('canWriteBack', () => {

        it('should return true for default key', () => {
          expect(model.canWriteBack()).to.be(true);
        });

        it('should return true for key "array"', () => {
          expect(model.canWriteBack('array')).to.be(true);
        });

        it('should return false for other keys', () => {
          expect(model.canWriteBack('foo')).to.be(false);
        });

      });

      describe('setNDArray', () => {

        it('should set an array on the model', () => {
          const model = new NDArrayModel(serializedState, modelOptions);
          const array = ndarray(new Float32Array([]));
          model.setNDArray(array)
          expect(model.get('array')).to.be(array);
        });

      });

    });

    describe('change', () => {

      it('should detect a change to the array', () => {
        let widget_manager = new DummyManager();
        let modelOptions = {
          widget_manager: widget_manager,
          model_id: uuid(),
        }
        const origData = new Float32Array([1, 2, 3, 4, 5, 10]);
        let serializedState = {myAttr: origData};
        let model = new NDArrayModel(serializedState, modelOptions);

        const newData = new Float32Array([6, 4, 2])
        model.set({myAttr: newData});

        expect(model.changed).to.eql({'myAttr': newData});

      });

    });

  });

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

});
