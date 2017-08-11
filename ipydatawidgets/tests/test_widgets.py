import pytest

import numpy as np
from traitlets import TraitError

from ..ndarray.traits import shape_constraints, validate_dtype
from ..ndarray.widgets import NDArrayWidget, ConstrainedNDArrayWidget


def test_datawidget_creation():
    data = np.zeros((2, 4))
    w = NDArrayWidget(data)
    assert w.array is data


def test_constrained_datawidget():
    ColorImage = ConstrainedNDArrayWidget(shape_constraints(None, None, 3), dtype=np.uint8)
    with pytest.raises(TraitError):
        ColorImage(np.zeros((4, 4)))
    w = ColorImage(np.zeros((4, 4, 3)))
    np.testing.assert_equal(w.array, np.zeros((4, 4, 3), dtype=np.uint8))
