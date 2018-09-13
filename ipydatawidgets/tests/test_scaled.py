#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

import numpy as np
from traitlets import TraitError, Undefined
from ipyscales import LinearScaleWidget

from ..scaled import ScaledArrayWidget


def test_scaled_creation_blank():
    with pytest.raises(TraitError):
        w = ScaledArrayWidget()


def test_scaled_creation():
    data = np.zeros((2, 4))
    scale = LinearScaleWidget()
    w = ScaledArrayWidget(data, scale)
    assert w.array is data

