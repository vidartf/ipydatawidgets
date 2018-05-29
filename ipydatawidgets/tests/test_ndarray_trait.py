#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import re

import pytest
import numpy as np

from traitlets import HasTraits, TraitError, Undefined

from ..ndarray.traits import NDArray, shape_constraints




def test_create_without_default():
    class Foo(HasTraits):
        bar = NDArray()

    foo = Foo()
    assert foo.bar is Undefined
    foo.bar = np.zeros((4, 4))
    np.testing.assert_equal(foo.bar, np.zeros((4, 4)))


def test_create_with_default():
    class Foo(HasTraits):
        bar = NDArray(np.zeros((4, 4)))

    foo = Foo()
    np.testing.assert_equal(foo.bar, np.zeros((4, 4)))


def test_create_with_coersion_default():
    class Foo(HasTraits):
        bar = NDArray([[1, 2, 3], [4, 5, 6]])

    foo = Foo()
    np.testing.assert_equal(foo.bar, np.array([[1, 2, 3], [4, 5, 6]]))


_re_dtype_warning = re.compile(
    r'Given trait value dtype "int\d\d" does not match required type "float32".*')

def test_create_with_coersion_dtype_default():
    class Foo(HasTraits):
        bar = NDArray([[1, 2, 3], [4, 5, 6]], dtype=np.float32)

    foo = Foo()
    np.testing.assert_equal(foo.bar, np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float32))


def test_accepts_simple_array_constructor():
    class Foo(HasTraits):
        bar = NDArray()

    foo = Foo(bar=np.zeros((4, 4, 3)))
    np.testing.assert_equal(foo.bar, np.zeros((4, 4, 3)))


def test_accepts_simple_array_setter():
    class Foo(HasTraits):
        bar = NDArray()

    foo = Foo()
    foo.bar = np.zeros((4, 4, 3))
    np.testing.assert_equal(foo.bar, np.zeros((4, 4, 3)))


def test_disallowed_none():
    class Foo(HasTraits):
        bar = NDArray(default_value=None)
    # Test works when overriding default:
    foo = Foo(bar=[1, 2, 3])
    assert foo.bar is not None

    # Test explicit set to None fails:
    with pytest.raises(TraitError):
        foo = Foo(bar=None)

    # Test default value None fails:
    with pytest.raises(TraitError):
        foo = Foo()
        # We need to access trait in order to validate:
        assert foo.bar is None


def test_allowed_none():
    class Foo(HasTraits):
        bar = NDArray(default_value=None, allow_none=True)
    # Test works when overriding default:
    foo = Foo(bar=[1, 2, 3])
    assert foo.bar is not None

    # Test explicit set to None:
    foo = Foo(bar=None)
    assert foo.bar is None

    # Test default value None:
    foo = Foo()
    assert foo.bar is None


def test_object_not_allowed():
    class Foo(HasTraits):
        bar = NDArray()

    foo = Foo(bar=[1, 2, 3])
    with pytest.raises(TraitError):
        foo2 = Foo(bar=[foo])

def test_dtype_coerce():
    class Foo(HasTraits):
        bar = NDArray(dtype=np.uint8)

    # Check for correct dtype conversion:
    foo = Foo(bar=[12.5, 33.2, 1, 4])
    np.testing.assert_equal(foo.bar, np.array([12, 33, 1, 4], dtype=np.uint8))

    with pytest.raises(TraitError):
        # Complex number cannot be converted:
        foo = Foo(bar=[12.5, 33.2, 1 + 2j, 4])

    # Negative numbers are reinterpreted when cast to uint:
    foo = Foo(bar=[12.5, -33.2, 1, 4])
    np.testing.assert_equal(foo.bar, np.array([12, 223, 1, 4], dtype=np.uint8))


@pytest.mark.parametrize("constraints", [
    (4, None, None),
    (None, 2, None),
    (None, None, 3),
    (4, 2, None),
    (4, None, 3),
    (None, 2, 3),
    (4, 2, 3),
])
def test_shape_constraint_successful(constraints):
    # Set up parapemtrized constraint:
    class Foo(HasTraits):
        bar = NDArray(allow_none=True).valid(shape_constraints(*constraints))

    foo = Foo()
    foo.bar = np.zeros((4, 2, 3))
    foo.bar = None


@pytest.mark.parametrize("constraints", [
    (4, None, None),
    (None, 2, None),
    (None, None, 3),
    (4, 2, None),
    (4, None, 3),
    (None, 2, 3),
    (4, 2, 3),
    (4, 2, 3, 33, 432),
    (1, 5, 3, 2),
    (5, 3, 2, 1)
])
def test_shape_constraint_fails(constraints):
    # Set up parapemtrized constraint:
    class Foo(HasTraits):
        bar = NDArray().valid(shape_constraints(*constraints))

    foo = Foo()
    assert foo.bar is Undefined
    with pytest.raises(TraitError):
        foo.bar = np.zeros((5, 3, 2))
