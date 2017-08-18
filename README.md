
# ipydatawidgets

[![Build Status](https://travis-ci.org/vidartf/ipydatawidgets.svg?branch=master)](https://travis-ci.org/vidartf/ipydatawidgets)
[![codecov](https://codecov.io/gh/vidartf/ipydatawidgets/branch/master/graph/badge.svg)](https://codecov.io/gh/vidartf/ipydatawidgets)


ipydatawidgets is a set of widgets to help facilitate reuse of large datasets
across different widgets, and different packages.


## Installation

A typical installation requires the following three commands to be run:

```bash
pip install ipydatawidgets
jupyter nbextension install --py [--sys-prefix|--user|--system] ipydatawidgets
jupyter nbextension enable --py [--sys-prefix|--user|--system] ipydatawidgets
```

Or, if you use jupyterlab:

```bash
pip install ipydatawidgets
jupyter labextension install jupyterlab-datawidgets
```

## Usage

As a user, it should be noted that ipydatawidgets only works with packages that
explicitly allow for it, so a more detailed usage guide might be available in the
documentation of those packages. If you are a developer who wants to add support
for data widgets in your package, read the developer's section further below.

### Arrays

The main widget for arrays is the `NDArrayWidget` class. It has a main trait: A
numpy array. This array can be constrained/coerced in both size/shape and in data
type. It's main purpose is simply to be a standardized way of transmitting array
data from the kernel to the frontend, and to allow the data to be reused across
any number of other widgets, but with only a single sync across the network.

```python
import numpy as np
from ipydatawidgets import NDArrayWidget

raw_data = np.ones((100, 100, 3), dtype=np.float32)
datawidget = NDArrayWidget(raw_data)

# Below, my_other_widget has a trait `data` of the type `Instance(NDArrayWidget)`
my_other_widget.data = datawidget
```

In addition to the `NDArrayWidget`, ipydatawidgets also expose the trait type for
the numpy array and its serializers (on both the Python side and the javascript
side). More importantly, it exposes a `DataUnion` trait type, that accepts both
numpy arrays directly, or a reference to an `NDArrayWidget`. This allows other
widgets to easily accept *either* a numpy array *or* a data widget. Then the user
can choose which one they prefer, weighing the pros and cons against eachother
(the con of the widget being the extra overhead of creation).

```python
# ... continuation of example above
my_other_widget.data = raw_data  # also acceptable, if `data` is a DataUnion
```


## Developers

Developers should consider using ipydatawidgets because:

- It gives readily accessible syncing of array data using the binary transfer
  protocol of ipywidgets.
- It has inbuilt mechanisms for constraining shape and dtype, and can quickly
  be extended with more complex constraints.
- It avoids duplication of common code among different extensions, ensuring
  that bugs discovered for one extension gets fixed in all.


### Overview

The major parts of ipydatawidgets are:

- Traits/Widgets definitions
- Validators to coerce/constrain values assigned to those traits
- Serializers/deserializers to send the data across the network
- Apropriate javascript handling and representation of the data
