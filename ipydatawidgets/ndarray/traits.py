#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Array trait types and helpers
"""

import numpy as np
from traitlets import TraitError, Undefined
from ..trait_types import Validators


def validate_dtype(value, dtype):
    try:
        return np.asarray(value, dtype=dtype)
    except (ValueError, TypeError) as e:
        raise TraitError(e)


class NDArray(Validators):
    """A numpy array trait type."""

    info_text = 'a numpy array'
    dtype = None

    def __init__(self, default_value=Undefined, dtype=None, **kwargs):
        self.dtype = dtype
        super(NDArray, self).__init__(default_value=default_value, **kwargs)

    def validate(self, obj, value):
        if value is None and not self.allow_none:
            self.error(obj, value)
        if value is None or value is Undefined:
            return super(NDArray, self).validate(obj, value)
        # Note: This call also coerces to a numpy array:
        value = validate_dtype(value, self.dtype)
        if value.dtype.hasobject:
            raise TraitError('Object dtype not supported')
        return super(NDArray, self).validate(obj, value)

    def set(self, obj, value):
        new_value = self._validate(obj, value)
        old_value = obj._trait_values.get(self.name, self.default_value)
        obj._trait_values[self.name] = new_value
        if not np.array_equal(old_value, new_value):
            obj._notify_trait(self.name, old_value, new_value)

    def make_dynamic_default(self):
        if self.default_value is None or self.default_value is Undefined:
            return self.default_value
        else:
            return np.copy(self.default_value)


def shape_constraints(*args):
    """Example: shape_constraints(None,3) insists that the shape looks like (*,3)"""

    def validator(trait, value):
        if value is None or value is Undefined:
            return value
        if len(value.shape) != len(args):
            raise TraitError('%s shape expected to have %s components, but got %s components' % (
                trait.name, len(args), value.shape))
        for i, constraint in enumerate(args):
            if constraint is not None:
                if value.shape[i] != constraint:
                    raise TraitError(
                        'Dimension %i is supposed to be size %d, but got dimension %d' % (
                            i, constraint, value.shape[i]))
        return value
    return validator
