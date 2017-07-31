"""
Array trait types and helpers
"""

import numpy as np
from traitlets import TraitError, Undefined
from ..trait_types import Validators


class NDArray(Validators):
    """A numpy array trait type."""

    info_text = 'a numpy array'
    dtype = None

    def __init__(self, default_value=Undefined, allow_none=False, dtype=None, **kwargs):
        self.dtype = dtype
        if default_value is Undefined:
            default_value = np.array(0, dtype=self.dtype)
        elif default_value is not None:
            default_value = np.asarray(default_value, dtype=self.dtype)
        super(NDArray, self).__init__(default_value=default_value, allow_none=allow_none, **kwargs)

    def validate(self, obj, value):
        if value is None and not self.allow_none:
            self.error(obj, value)
        try:
            value = np.asarray(value, dtype=self.dtype)
        except (ValueError, TypeError) as e:
            raise TraitError(e)
        return super(NDArray, self).validate(obj, value)

    def set(self, obj, value):
        new_value = self._validate(obj, value)
        old_value = obj._trait_values.get(self.name, self.default_value)
        obj._trait_values[self.name] = new_value
        if not np.array_equal(old_value, new_value):
            obj._notify_trait(self.name, old_value, new_value)

    def make_dynamic_default(self):
        if self.default_value is None:
            return self.default_value
        else:
            return np.copy(self.default_value)


def shape_constraints(*args):
    """Example: shape_constraints(None,3) insists that the shape looks like (*,3)"""

    def validator(trait, value):
        if trait.allow_none:
            print(value)
        if len(value.shape) != len(args):
            raise TraitError('%s shape expected to have %s components, but got %s components' % (
                trait.name, len(args), (value, type(value))))
        for i, constraint in enumerate(args):
            if constraint is not None:
                if value.shape[i] != constraint:
                    raise TraitError(
                        'Dimension %i is supposed to be size %d, but got dimension %d' % (
                            i, constraint, value.shape[i]))
        return value
    return validator
