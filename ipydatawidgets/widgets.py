#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Common base widgets for ipydatawidgets.
"""

from ipywidgets import Widget
from traitlets import Unicode

from ._frontend import module_name, EXTENSION_SPEC_VERSION


class DataWidget(Widget):
    """An abstract widget class representing data.
    """
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
