// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  INotebookModel, NotebookPanel, INotebookTracker
} from '@jupyterlab/notebook';

import {
  JupyterLabPlugin, JupyterLab
} from '@jupyterlab/application';

import {
  Token
} from '@phosphor/coreutils';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import * as dataWidgets from 'jupyter-datawidgets';

import {
  INBWidgetExtension
 } from "@jupyter-widgets/jupyterlab-manager";


const EXTENSION_ID = 'jupyter.extensions.datawidgets'


/**
 * The token identifying the JupyterLab plugin.
 */
export
const IDataWidgetsExtension = new Token<IDataWidgetsExtension>(EXTENSION_ID);

/**
 * The type of the provided value of the plugin in JupyterLab.
 */
export
interface IDataWidgetsExtension {
};


/**
 * The notebook diff provider.
 */
const dataWidgetsProvider: JupyterLabPlugin<IDataWidgetsExtension> = {
  id: EXTENSION_ID,
  requires: [INBWidgetExtension],
  activate: activateWidgetExtension,
  autoStart: true
};

export default dataWidgetsProvider;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: JupyterLab, widgetsManager: INBWidgetExtension): IDataWidgetsExtension {
  widgetsManager.registerWidget({
      name: 'jupyter-datawidgets',
      version: dataWidgets.JUPYTER_DATAWIDGETS_VERSION,
      exports: dataWidgets
    });
  return {};
}
