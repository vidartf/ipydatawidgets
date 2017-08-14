#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from ipywidgets.widgets.tests.utils import DummyComm

@pytest.fixture
def mock_comm():
    return DummyComm()
