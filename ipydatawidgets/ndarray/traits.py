#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Array trait types and helpers
"""

import warnings

import numpy as np
from traitlets import TraitError, Undefined
from traittypes import Array, SciType


class NDArray(Array):
    """A numpy array trait type."""

    def __init__(self, default_value=Undefined, dtype=None, **kwargs):
        super(NDArray, self).__init__(default_value=default_value, dtype=dtype, **kwargs)

    def validate(self, obj, value):
        value = super(NDArray, self).validate(obj, value)
        if value is None or value is Undefined:
            return value
        if value.dtype.hasobject:
            raise TraitError('Object dtype not supported')
        return value


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
