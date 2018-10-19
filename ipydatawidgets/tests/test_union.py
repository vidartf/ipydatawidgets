#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

import numpy as np
from traitlets import HasTraits, TraitError, observe
from ipywidgets import Widget

from ..ndarray.traits import shape_constraints
from ..ndarray.union import DataUnion, get_union_array
from ..ndarray.widgets import NDArrayWidget, NDArraySource


def test_dataunion_mixed_use():
    class Foo(HasTraits):
        bar = DataUnion()

    raw_data = np.array([range(5), range(5, 10)], dtype=np.float32)
    data_copy = np.copy(raw_data)
    foo = Foo(bar=raw_data)

    assert foo.bar is raw_data

    w = NDArrayWidget(raw_data)
    foo.bar = w

    assert foo.bar is w
    assert foo.bar.array is raw_data

    # Check that data has not been changed (no dtype/shape coercion here)
    np.testing.assert_equal(raw_data, data_copy)


def test_dataunion_array_dtype_coercion():
    class Foo(HasTraits):
        bar = DataUnion(dtype=np.uint8)

    raw_data = 100 * np.random.random((4, 4))
    with pytest.warns(UserWarning) as warnings:
        foo = Foo(bar=raw_data)
        assert len(warnings) == 1
        assert 'Given trait value dtype "float64" does not match required type "uint8"' in str(warnings[0].message)

    assert not np.array_equiv(foo.bar, raw_data)
    assert np.array_equiv(foo.bar, raw_data.astype(np.uint8))


def test_dataunion_widget_dtype_errors():
    class Foo(HasTraits):
        bar = DataUnion(dtype=np.uint8)

    raw_data = 100 * np.random.random((4, 4))
    w = NDArrayWidget(raw_data)
    # Should fail for a widget with the wrong dtype
    with pytest.raises(TraitError):
        foo = Foo(bar=w)

    # Check that it succeeds for widget of correct type:
    w.array = raw_data.astype(np.uint8)
    foo = Foo(bar=w)

def test_dataunion_array_shape_constraints():
    class Foo(HasTraits):
        bar = DataUnion(shape_constraint=shape_constraints(None, None, 3))

    raw_data = np.ones((4, 4))
    with pytest.raises(TraitError):
        foo = Foo(bar=raw_data)

def test_dataunion_widget_shape_constraints():
    class Foo(HasTraits):
        bar = DataUnion(shape_constraint=shape_constraints(None, None, 3))

    raw_data = np.ones((4, 4))
    w = NDArrayWidget(raw_data)
    with pytest.raises(TraitError):
        foo = Foo(bar=w)


def test_dataunion_constricts_widget_data():
    class Foo(HasTraits):
        bar = DataUnion(shape_constraint=shape_constraints(None, None, 3))

    ok_data = np.ones((4, 2, 3))
    bad_data = np.ones((4, 4))
    w = NDArrayWidget(ok_data)
    foo = Foo(bar=w)
    with pytest.raises(TraitError):
        w.array = bad_data
    foo.bar = ok_data
    w.array = bad_data  # Should now be OK!


def test_dataunion_widget_change_notified(mock_comm):
    ns = {'counter': 0}
    class Foo(Widget):
        bar = DataUnion().tag(sync=True)

        @observe('bar')
        def on_bar_change(self, change):
            ns['counter'] += 1

    raw_data = np.ones((4, 4))
    raw_data2 = np.ones((4, 4, 2))
    w = NDArrayWidget(raw_data)

    foo = Foo(bar=w)
    foo.comm = mock_comm
    assert ns['counter'] == 1
    w.array = raw_data2
    assert ns['counter'] == 2
    foo.bar = raw_data
    assert ns['counter'] == 3
    # Check that it did not send state for widget array update:
    assert len(mock_comm.log_send) == 2

    foo = Foo(bar=raw_data)
    assert ns['counter'] == 4
    foo.bar = w
    assert ns['counter'] == 5


def test_get_union_array_with_array():
    class Foo(Widget):
        bar = DataUnion()
    raw_data = np.ones((4, 4))
    foo = Foo(bar=raw_data)
    assert get_union_array(foo.bar) is raw_data


def test_get_union_array_with_widget():
    class Foo(Widget):
        bar = DataUnion()
    raw_data = np.ones((4, 4))
    foo = Foo(bar=NDArrayWidget(raw_data))
    assert get_union_array(foo.bar) is raw_data


def test_source_validation():
    class Source(NDArraySource):
        def _get_dtype(self):
            return 'uint8'

        def _get_shape(self):
            return [2, 3]

    w = Source()

    class Foo(Widget):
        bar = DataUnion(
            dtype='uint8',
            shape_constraint=shape_constraints(2, 3)
        )

    foo = Foo(bar=w)
