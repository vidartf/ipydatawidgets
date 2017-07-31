"""
Common base widgets for ipydatawidgets.
"""

from ipywidgets import Widget, register
from traitlets import Unicode

module_name = "jupyter-datawidgets"
module_version = "1.0.0"


class DataWidget(Widget):
    """An abstract widget class representing data.
    """
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)