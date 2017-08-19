#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

import numpy as np
from traitlets import HasTraits, TraitError

from ..ndarray.traits import shape_constraints, validate_dtype
from ..ndarray.union import DataUnion
from ..ndarray.widgets import NDArrayWidget, ConstrainedNDArrayWidget


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
