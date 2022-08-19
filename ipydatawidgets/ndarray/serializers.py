#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
Simple serialization for numpy arrays

NB! Parts of this originally file copied verbatim from pythreejs:

Copyright (c) 2013, Jason Grout
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.

* Neither the name of the PyThreeJS development team nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
"""

import warnings

import numpy as np
import zlib

from traitlets import Undefined, TraitError
from ipywidgets import widget_serialization, Widget

# Format:
# {'dtype': string, 'shape': tuple, 'array': memoryview}

def array_to_json(value, widget):
    """Array JSON serializer."""
    if value is None:
        return None
    if value is Undefined:
        raise TraitError('Cannot serialize undefined array!')
    # Workaround added to deal with slices: FIXME: what's the best place to put this?
    if isinstance(value, np.ndarray):
        if str(value.dtype) in ('int64', 'uint64'):
            warnings.warn('Cannot serialize (u)int64 data, Javascript does not support it. '
                          'Casting to (u)int32.')
            value = value.astype(str(value.dtype).replace('64', '32'), order='C')
        elif not value.flags['C_CONTIGUOUS']:
            value = np.ascontiguousarray(value)
    return {
        'shape': value.shape,
        'dtype': str(value.dtype),
        #'buffer': memoryview(value) # maybe should do array.tobytes(order='C') to copy
        'buffer': memoryview(value)
    }


def array_from_json(value, widget):
    """Array JSON de-serializer."""
    if value is None:
        return None
    # may need to copy the array if the underlying buffer is readonly
    n = np.frombuffer(value['buffer'], dtype=value['dtype'])
    n.shape = value['shape']
    return n

array_serialization = dict(to_json=array_to_json, from_json=array_from_json)


def array_to_compressed_json(value, widget):
    """Compressed array JSON serializer."""
    state = array_to_json(value, widget)
    if state is None:
        return state
    compression = getattr(widget, 'compression_level', 0)
    if compression == 0:
        return state
    buffer = state.pop('buffer')
    state['compressed_buffer'] = zlib.compress(
        buffer,
        compression
    )
    return state


def array_from_compressed_json(value, widget):
    """Compressed array JSON de-serializer."""
    comp = value.pop('compressed_buffer', None) if value is not None else None
    if comp is not None:
        value['buffer'] = zlib.decompress(comp)
    return array_from_json(value, widget)


compressed_array_serialization = dict(
    to_json=array_to_compressed_json,
    from_json=array_from_compressed_json)


#  Serializers for union type [ndarray | ndarraywidget]:

def data_union_to_json(value, widget):
    """Serializer for union of NDArray and NDArrayWidget"""
    if isinstance(value, Widget):
        return widget_serialization['to_json'](value, widget)
    return array_to_json(value, widget)


def data_union_from_json(value, widget):
    """Deserializer for union of NDArray and NDArrayWidget"""
    if isinstance(value, str) and value.startswith('IPY_MODEL_'):
        return widget_serialization['from_json'](value, widget)
    return array_from_json(value, widget)


data_union_serialization = dict(
    to_json=data_union_to_json,
    from_json=data_union_from_json)
