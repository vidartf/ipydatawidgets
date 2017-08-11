#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from traitlets import Union, Instance, Undefined

from .traits import NDArray, validate_dtype
from .widgets import NDArrayWidget


class DataUnion(Union):
    """
    Union trait of NDArray and NDArrayWidget for numpy arrays.
    """

    def __init__(self, default_value=Undefined, dtype=None, shape_constraint=None,
                 kw_array=None, kw_widget=None, **kwargs):
        self.dtype = dtype
        self.shape_constraint = shape_constraint
        kw_array = kw_array or {}
        kw_widget = kw_widget or {}
        traits = [
            NDArray(dtype=dtype, **kw_array),
            Instance(NDArrayWidget)
        ]

        super(DataUnion, self).__init__(traits, default_value=default_value, **kwargs)

        self.tag(**data_union_serialization)

    def validate(self, obj, value):
        value = super(DataUnion, self).validate(obj, value)
        if isinstance(value, NDArrayWidget) and self.dtype is not None:
            validate_dtype(value.array, self.dtype)
        if self.shape_constraint:
            if value is NDArrayWidget:
                self.shape_constraint(self, value.array)
            else:
                self.shape_constraint(self, value)
        return value

