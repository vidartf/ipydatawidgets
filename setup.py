#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# the name of the project
name = 'ipydatawidgets'

#-----------------------------------------------------------------------------
# get on with it
#-----------------------------------------------------------------------------

import io
import os
from glob import glob

from setuptools import setup, find_packages

from jupyter_packaging import (create_cmdclass, install_npm, ensure_targets,
    combine_commands)

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))

# Representative files that should exist after a successful build
jstargets = [
    os.path.join(here, name, 'nbextension', 'static', 'extension.js'),
    os.path.join(here, name, 'nbextension', 'static', 'index.js'),
    os.path.join(here, 'packages', 'jlabextension', 'build', 'index.js'),
]

version_ns = {}
with io.open(pjoin(here, name, '_version.py'), encoding="utf8") as f:
    exec(f.read(), {}, version_ns)


cmdclass = create_cmdclass(
    'js',
    data_files_spec=[
        ('share/jupyter/nbextensions/jupyter-datawidgets',
         name + '/nbextension/static',
         '*.js'),
        ('share/jupyter/nbextensions/jupyter-datawidgets',
         name + '/nbextension/static',
         '*.js.map'),
        ('share/jupyter/lab/extensions',
         'packages/jlabextension/dist',
         'jupyterlab-datawidgets-*.tgz'),
        ('share/jupyter/labextensions/jupyterlab-datawidgets',
         'packages/jlabextension/dist/jupyterlab-datawidgets',
         '**/*.*'),
        ('etc/jupyter/nbconfig',
         'jupyter-config',
         '**/*.json'),
    ],)
cmdclass['js'] = combine_commands(
    install_npm(here),
    ensure_targets(jstargets),
)


setup_args = dict(
    name            = name,
    description     = "A set of widgets to help facilitate reuse of large datasets across widgets",
    version         = version_ns['__version__'],
    scripts         = glob(pjoin('scripts', '*')),
    cmdclass        = cmdclass,
    packages        = find_packages(here),
    include_package_data = True,
    author          = 'Jupyter Development Team',
    author_email    = 'jupyter@googlegroups.com',
    url             = 'https://github.com/vidartf/ipydatawidgets',
    license         = 'BSD',
    platforms       = "Linux, Mac OS X, Windows",
    python_requires = ">=3.7",
    keywords        = ['Jupyter', 'Widgets', 'IPython'],
    classifiers     = [
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Framework :: Jupyter',
    ],
)


setuptools_args = {}
install_requires = setuptools_args['install_requires'] = [
    'ipywidgets>=7.0.0',
    'numpy',
    'traittypes>=0.2.0',
]

extras_require = setuptools_args['extras_require'] = {
    'test': [
        'pytest>=4',
        'pytest-cov',
        'nbval>=0.9.2',
    ],
    'docs': [
        'sphinx',
        'recommonmark',
        'sphinx_rtd_theme'
    ],
}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

    setup_args.pop('scripts', None)

    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
