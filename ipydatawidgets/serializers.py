"""
Simple serialization for numpy arrays

NB! This file copied verbatim from pythreejs:

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

import numpy as np

# Format:
# {'dtype': string, 'shape': tuple, 'array': memoryview}

def array_to_json(value, widget):
    """Array JSON serializer."""
    if value is None:
        return None
    # Workaround added to deal with slices: FIXME: what's the best place to put this?
    if isinstance(value, np.ndarray) and not value.flags['C_CONTIGUOUS']:
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
