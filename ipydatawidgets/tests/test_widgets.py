#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

import numpy as np
from traitlets import TraitError, Undefined

from ..ndarray.traits import shape_constraints
from ..ndarray.widgets import NDArrayWidget, ConstrainedNDArrayWidget


def test_datawidget_creation_blank():
    with pytest.raises(TraitError):
        w = NDArrayWidget()


def test_datawidget_creation_blank_comm(mock_comm):
    w = NDArrayWidget(comm=mock_comm)
    assert w.array is Undefined


def test_datawidget_creation():
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    assert w.array is data


def test_constrained_datawidget():
    ColorImage = ConstrainedNDArrayWidget(shape_constraints(None, None, 3), dtype=np.uint8)
    with pytest.raises(TraitError):
        ColorImage(np.zeros((4, 4)))
    w = ColorImage(np.zeros((4, 4, 3)))
    np.testing.assert_equal(w.array, np.zeros((4, 4, 3), dtype=np.uint8))
