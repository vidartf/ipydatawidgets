// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Application, IPlugin
} from '@phosphor/application';

import {
  Widget
} from '@phosphor/widgets';

import {
  Token
} from '@phosphor/coreutils';

import * as dataWidgets from 'jupyter-datawidgets';

import {
  IJupyterWidgetRegistry, ExportMap
 } from "@jupyter-widgets/base";


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
const dataWidgetsProvider: IPlugin<Application<Widget>, IDataWidgetsExtension> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateWidgetExtension,
  autoStart: true
};

export default dataWidgetsProvider;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: Application<Widget>, widgetsManager: IJupyterWidgetRegistry): IDataWidgetsExtension {
  widgetsManager.registerWidget({
      name: 'jupyter-datawidgets',
      version: dataWidgets.version,
      exports: dataWidgets as any as ExportMap
    });
  return {};
}
