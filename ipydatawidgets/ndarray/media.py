#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.


from ipywidgets import DOMWidget
from traitlets import Unicode

from .._frontend import EXTENSION_SPEC_VERSION, module_name
from ..widgets import DataWidget
from .union import DataUnion, data_union_serialization
from .traits import shape_constraints


class DataImage(DataWidget, DOMWidget):
    """A data-widgets based Image widget.
    """
    _model_name = Unicode('DataImageModel').tag(sync=True)
    _view_name = Unicode('DataImageView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)

    data = DataUnion(
        [],
        dtype='uint8',
        shape_constraint=shape_constraints(None, None, 4),  # 2D RGBA
    ).tag(sync=True, **data_union_serialization)
