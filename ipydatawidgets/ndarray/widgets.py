#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Data widgets for numpy arrays.
"""

from contextlib import contextmanager

from ipywidgets import register
from traitlets import Unicode, Set, Undefined, Int, validate
import numpy as np
import six

from ..widgets import DataWidget
from .traits import NDArray
from .serializers import compressed_array_serialization


class NDArrayBase(DataWidget):
    """A common base class for NDArray-based widgets
    """

    @property
    def shape(self):
        return self._get_shape()

    @property
    def dtype(self):
        return self._get_dtype()

    def _get_shape(self):
        raise NotImplementedError()

    def _get_dtype(self):
        raise NotImplementedError()


@register
class NDArraySource(NDArrayBase):
    """Base class for widgets that supplies an ndarray in the front-end only.
    """
    pass


@register
class NDArrayWidget(NDArrayBase):
    """A widget representing an arbitrary array.

    This is useful when several widgets might share the
    same array. This would allow better synchronization.

    More specific subtypes can be used instead to allow for implied
    types and dimensionality checks.
    """
    _model_name = Unicode('NDArrayModel').tag(sync=True)

    _segments_to_send = Set()

    array = NDArray().tag(sync=True, **compressed_array_serialization)

    compression_level = Int(0,
        help='If above 0, compress the data with zlib during serialization. '
        'Note: It is often more efficient to turn on compression on the '
        'notebook application level than to use this option.').tag(sync=True)

    def __init__(self, array=Undefined, **kwargs):
        self._instance_validators = set()
        super(NDArrayWidget, self).__init__(array=array, **kwargs)

    def _get_shape(self):
        return self.array.shape

    def _get_dtype(self):
        return self.array.dtype

    @validate('array')
    def _validate_array(self, proposal):
        """Validate array against external validators (instance only)

        This allows others to add constraints on the array of this
        widget dynamically. Internal use is so that a constrained
        DataUnion can validate the array of a widget set to itself.
        """
        value = proposal['value']
        for validator in self._instance_validators:
            value = validator(value)
        return value

    def notify_changed(self):
        """Use this to mark that the array is changed.

        This will cause the array to be synced as it normally would
        after a change, and is useful when the array has been modified
        in-place.

        This respects hold_trait_notifications and hold_sync.
        """
        self._notify_trait('array', self.array, self.array)

    def sync_segment(self, segments):
        """Sync a segments of contiguous memory.

        By only syncing a segment of the array, a full transmission of the
        updated array is avoided. However, this does put the responsibility
        of ensuring the correct sync state on the caller.

        This respects hold_sync, so several segments can be stacked with
        multiple calls when holding the sync.

        Parameters
        ----------
        segments : iterable of two-tuples
            An iterable collection of segments represented by (start, stop) tuples.
        """
        if self._holding_sync:
            self._segments_to_send.add(*segments)
        else:
            self.send_segment(segments)

    def send_segment(self, segments):
        """Send segments to the front-end.

        Note: This does not respect hold_sync. If that is wanted, use
        sync_segment instead.

        Parameters
        ----------
        segments : iterable of two-tuples
            An iterable collection of segments represented by (start, stop) tuples.
        """
        starts = []
        buffers = []
        raveled = np.ravel(self.array, order='C')
        length = len(raveled)
        for s in segments:
            starts.append(s[0] if s[0] >= 0 else length - s[0])
            buffers.append(np.ascontiguousarray(raveled[s[0]:s[1]]))

        msg = {'method': 'update_array_segment', 'name': 'array', 'starts': starts}
        self._send(msg, buffers)

    @contextmanager
    def hold_sync(self):
        with super(NDArrayWidget, self).hold_sync():
            try:
                yield
            finally:
                if self._segments_to_send:
                    self.send_segment(self._segments_to_send)
                    self._segments_to_send.clear()


# Signature SHOULD be create_constrained_arraywidget(*validators, dtype=None),
# but this is not supported by Python 2.7. For Python 3, we try to be
# helpful by overriding the signature below.
def create_constrained_arraywidget(*validators, **kwargs):
    """Returns a subclass of NDArrayWidget with a constrained array.

    Accepts keyword argument 'dtype' in addition to any valdiators.
    """
    dtype = kwargs.pop('dtype', None)
    return type('ConstrainedNDArrayWidget', (NDArrayWidget,), {
        'array': NDArray(dtype=dtype).tag(
            sync=True,
            **compressed_array_serialization
        ).valid(*validators)
    })




if six.PY3:
    from inspect import Signature, Parameter
    create_constrained_arraywidget.__signature__ = Signature(parameters=(
        Parameter('validators', Parameter.VAR_POSITIONAL),
        Parameter('dtype', Parameter.KEYWORD_ONLY, default=None),
    ))


def ConstrainedNDArrayWidget(*validators, **kwargs):
    import warnings
    warnings.warn('ConstrainedNDArrayWidget is deprecated, '
                  'use create_constrained_arraywidget instead')
    return create_constrained_arraywidget(*validators, **kwargs)
