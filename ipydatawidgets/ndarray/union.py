#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from functools import partial

from traitlets import Union, Instance, Undefined, TraitError

from .serializers import data_union_serialization
from .traits import NDArray
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

        self._registered_validators = {}

    def instance_init(self, inst):
        inst.observe(self._on_instance_value_change, self.name)

    def _on_instance_value_change(self, change):
        inst = change['owner']
        if isinstance(change['old'], NDArrayWidget):
            f = self._registered_validators.get(inst, None)
            if f is not None:
                change['old']._instance_validators.remove(f)
        if isinstance(change['new'], NDArrayWidget):
            # We can validate directly, since our validator accepts arrays also:
            f = partial(self._valdiate_child, inst)
            self._registered_validators[inst] = f
            change['new']._instance_validators.add(f)

    def _valdiate_child(self, obj, value):
        try:
            return self.validate(obj, value)
        except TraitError as e:
            raise TraitError('Widget data is constrained by its use in %r.' % obj)

    def validate(self, obj, value):
        value = super(DataUnion, self).validate(obj, value)
        if isinstance(value, NDArrayWidget) and self.dtype is not None:
            if value.array.dtype != self.dtype:
                raise TraitError('dtypes must match exactly when passing a NDArrayWidget to '
                                 'a dtype constrained DataUnion')
        if self.shape_constraint:
            if isinstance(value, NDArrayWidget):
                self.shape_constraint(self, value.array)
            else:
                self.shape_constraint(self, value)
        return value
