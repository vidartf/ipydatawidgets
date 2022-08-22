#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from ipykernel.comm import Comm
from ipywidgets import Widget

class DummyComm(Comm):
    comm_id = 'a-b-c-d'
    kernel = 'Truthy'

    def __init__(self, *args, **kwargs):
        self.log_open = []
        self.log_send = []
        self.log_close = []
        super(DummyComm, self).__init__(*args, **kwargs)

    def open(self, *args, **kwargs):
        self.log_open.append((args, kwargs))

    def send(self, *args, **kwargs):
        self.log_send.append((args, kwargs))

    def close(self, *args, **kwargs):
        self.log_close.append((args, kwargs))

_widget_attrs = {}
undefined = object()


@pytest.fixture
def mock_comm():
    _widget_attrs['_comm_default'] = getattr(Widget, '_comm_default', undefined)
    Widget._comm_default = lambda self: DummyComm()
    display_attr = "_ipython_display_" if hasattr(Widget, "_ipython_display_") else "_repr_mimebundle_"
    _widget_attrs[display_attr] = getattr(Widget, display_attr)
    def raise_not_implemented(*args, **kwargs):
        raise NotImplementedError()
    setattr(Widget, display_attr, raise_not_implemented)

    yield DummyComm()

    for attr, value in _widget_attrs.items():
        if value is undefined:
            delattr(Widget, attr)
        else:
            setattr(Widget, attr, value)
