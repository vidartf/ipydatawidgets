// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import expect = require('expect.js');

import {
  uuid
} from '@jupyter-widgets/base';

import {
  DataImageModel, DataImageView
} from '../../src/'

import {
  DummyManager
} from './dummy-manager.spec';

import ndarray = require('ndarray');


describe('DataImage', () => {

  describe('DataImageModel', () => {

    it('should be creatable', () => {
      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let serializedState = {};
      let model = new DataImageModel(serializedState, modelOptions as any);

      expect(model).to.be.an(DataImageModel);
      let data = model.get('data');
      expect(data.data.length).to.be(0);
    });

  });

  describe('DataImageView', () => {

    it('should be creatable', () => {
      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let serializedState = {};
      let model = new DataImageModel(serializedState, modelOptions as any);

      let view = new DataImageView({model});

      expect(view).to.be.an(DataImageView);
      view.render();
      expect(view.el.tagName.toLowerCase()).to.be('img');
      expect(view.el.getAttribute('width')).to.be('0');
      expect(view.el.getAttribute('height')).to.be('0');
      view.remove();
    });

    it('should be creatable with data', () => {
      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let deserializedState = {
        data: ndarray(new Uint8Array([
          0, 0, 0, 0,
          255, 0, 0, 128,
          0, 255, 0, 128,
          255, 255, 255, 255,
        ]), [2, 2, 4]),
      };
      let model = new DataImageModel(deserializedState, modelOptions as any);

      let view = new DataImageView({model});

      expect(view).to.be.an(DataImageView);
      view.render();
      expect(view.el.tagName.toLowerCase()).to.be('img');
      expect(view.el.getAttribute('width')).to.be('2');
      expect(view.el.getAttribute('height')).to.be('2');

      view.remove();
    });

    it('should be updateable', () => {
      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let deserializedState = {
        data: ndarray(new Uint8Array([
          0, 0, 0, 0,
          255, 0, 0, 128,
          0, 255, 0, 128,
          255, 255, 255, 255,
        ]), [2, 2, 4]),
      };
      let model = new DataImageModel(deserializedState, modelOptions as any);

      let view = new DataImageView({model});

      expect(view).to.be.an(DataImageView);
      view.render();
      expect(view.el.tagName.toLowerCase()).to.be('img');
      expect(view.el.getAttribute('width')).to.be('2');
      expect(view.el.getAttribute('height')).to.be('2');

      model.set('data', ndarray(new Uint8Array([
        0, 0, 0, 0,
        255, 255, 255, 255,
      ]), [1, 2, 4]));

      view.remove();
    });

    it('should be throw an error for invalid data', () => {
      let widget_manager = new DummyManager();
      let modelOptions = {
        widget_manager: widget_manager,
        model_id: uuid(),
      }
      let deserializedState = {
        data: ndarray(new Uint8Array([
          0, 0, 0,
          255, 0, 0,
          0, 255, 0,
          255, 255, 255,
        ]), [2, 2, 3]),
      };
      let model = new DataImageModel(deserializedState, modelOptions as any);

      let view = new DataImageView({model});

      expect(view).to.be.an(DataImageView);
      expect(view.render.bind(view)).withArgs().to.throwError(
        /DataImage data has invalid shape: /
      );

      expect(model.set.bind(model)).withArgs('data', ndarray(new Uint8Array([
        0, 0, 0, 0,
      ]), [4])).to.throwError(
        /DataImage data has invalid shape: \[4\]/
      );

      view.remove();
    });

  });

});
