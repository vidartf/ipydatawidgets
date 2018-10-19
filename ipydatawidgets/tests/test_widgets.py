#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

import numpy as np
from traitlets import TraitError, Undefined

from ..ndarray.traits import shape_constraints
from ..ndarray.widgets import (
    NDArrayWidget,  NDArraySource,
    create_constrained_arraywidget, ConstrainedNDArrayWidget,
)


def test_datawidget_creation_blank():
    with pytest.raises(TraitError):
        w = NDArrayWidget()


def test_datawidget_creation_blank_comm(mock_comm):
    # The mock comm delays serialization, so error is avoided
    # (the array serialization of undefined cause error)
    w = NDArrayWidget(comm=mock_comm)
    assert w.array is Undefined


def test_datawidget_creation():
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    assert w.array is data


def test_datawidget_dtype_property():
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    assert w.dtype == data.dtype
    assert w.shape == data.shape


def test_constrained_datawidget():
    ColorImage = create_constrained_arraywidget(shape_constraints(None, None, 3), dtype=np.uint8)
    with pytest.warns(UserWarning) as warnings:
        with pytest.raises(TraitError):
            ColorImage(np.zeros((4, 4)))
        w = ColorImage(np.zeros((4, 4, 3)))
        for warn in warnings:
            assert 'Given trait value dtype "float64" does not match required type "uint8"' in str(warn.message)
    np.testing.assert_equal(w.array, np.zeros((4, 4, 3), dtype=np.uint8))


def test_constrained_datawidget_deprecated():
    with pytest.warns(UserWarning) as warnings:
        ColorImage = ConstrainedNDArrayWidget(shape_constraints(None, None, 3), dtype=np.uint8)
        assert len(warnings) > 0
        for warn in warnings:
            assert 'ConstrainedNDArrayWidget is deprecated' in str(warn.message)
    with pytest.warns(UserWarning) as warnings:
        with pytest.raises(TraitError):
            ColorImage(np.zeros((4, 4)))
        w = ColorImage(np.zeros((4, 4, 3)))
        for warn in warnings:
            assert 'Given trait value dtype "float64" does not match required type "uint8"' in str(warn.message)
    np.testing.assert_equal(w.array, np.zeros((4, 4, 3), dtype=np.uint8))


def test_notification(mock_comm):
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    w.comm = mock_comm
    w.array = np.ones((2, 4, 2))

    assert len(mock_comm.log_send) == 1


def test_manual_notification(mock_comm):
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    w.comm = mock_comm
    w.notify_changed()

    assert len(mock_comm.log_send) == 1


def test_sync_segment(mock_comm):
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    w.comm = mock_comm

    data.ravel()[:4] = 1
    w.sync_segment([(0, 4)])

    assert len(mock_comm.log_send) == 1
    buffers = mock_comm.log_send[0][1]['buffers']
    assert len(buffers) == 1
    np.testing.assert_equal(buffers[0], memoryview(data.ravel()[:4]))


def test_hold_sync(mock_comm):
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    w.comm = mock_comm

    other_data = np.ones((4, 2))

    with w.hold_sync():
        w.array = other_data
        assert len(mock_comm.log_send) == 0
    assert len(mock_comm.log_send) == 1


def test_hold_sync_segment(mock_comm):
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    w.comm = mock_comm

    with w.hold_sync():
        data.ravel()[:4] = 1
        w.sync_segment([(0, 4)])
        assert len(mock_comm.log_send) == 0

    # Hold sync might trigger an empty sync message after:
    assert 1 <= len(mock_comm.log_send) <= 2
    buffers = mock_comm.log_send[0][1]['buffers']
    assert len(buffers) == 1
    np.testing.assert_equal(buffers[0], memoryview(data.ravel()[:4]))


def test_source_must_implement_shape():
    w = NDArraySource()
    with pytest.raises(NotImplementedError):
        w.shape
    with pytest.raises(NotImplementedError):
        w.dtype
