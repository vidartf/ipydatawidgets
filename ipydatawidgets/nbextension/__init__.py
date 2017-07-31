
def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'nbextension/static',
        'dest': 'jupyter-datawidgets',
        'require': 'jupyter-datawidgets/extension'
    }]
