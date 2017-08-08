
from ipython_genutils.py3compat import string_types
from traitlets import Union, Instance, Undefined
from ipywidgets import widget_serialization

from .traits import NDArray, validate_dtype
from .widgets import NDArrayWidget
from ..serializers import array_to_json, array_from_json


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


def data_union_to_json(value, widget):
    """Serializer for union of NDArray and NDArrayWidget"""
    if isinstance(value, NDArrayWidget):
        return widget_serialization['to_json'](value, widget)
    return array_to_json(value, widget)


def data_union_from_json(value, widget):
    """Deserializer for union of NDArray and NDArrayWidget"""
    if isinstance(value, string_types) and value.startswith('IPY_MODEL_'):
        return widget_serialization['from_json'](value, widget)
    return array_from_json(value, widget)

data_union_serialization = dict(to_json=data_union_to_json, from_json=data_union_from_json)
