// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as widgets from '@jupyter-widgets/base';
import * as services from '@jupyterlab/services';
import * as Backbone from 'backbone';

let numComms = 0;

export
class MockComm {
    constructor() {
        this.comm_id = `mock-comm-id-${numComms}`;
        numComms += 1;
    }
    on_close(fn: Function | null) {
        this._on_close = fn;
    }
    on_msg(fn: Function | null) {
        this._on_msg = fn;
    }
    _process_msg(msg: services.KernelMessage.ICommMsg) {
        if (this._on_msg) {
            return this._on_msg(msg);
        } else {
            return Promise.resolve();
        }
    }
    close() {
        if (this._on_close) {
            this._on_close();
        }
    }
    send() {}
    comm_id: string;
    _on_msg: Function | null = null;
    _on_close: Function | null = null;
}

export
class DummyManager extends widgets.ManagerBase<HTMLElement> {
    constructor() {
        super();
        this.el = window.document.createElement('div');
    }

    display_view(msg: services.KernelMessage.IMessage, view: Backbone.View<Backbone.Model>, options: any) {
        // TODO: make this a spy
        // TODO: return an html element
        return Promise.resolve(view).then(view => {
            this.el.appendChild(view.el);
            view.on('remove', () => console.log('view removed', view));
            return view.el;
        });
    }

    protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any> {
        if (moduleName === '@jupyter-widgets/base') {
            if ((widgets as any)[className]) {
                return Promise.resolve((widgets as any)[className]);
            } else {
                return Promise.reject(new Error(`Cannot find class ${className}`));
            }
        } else if (moduleName === 'jupyter-datawidgets') {
            if (this.testClasses[className]) {
                return Promise.resolve(this.testClasses[className]);
            } else {
                return Promise.reject(new Error(`Cannot find class ${className}`));
            }
        } else {
            return Promise.reject(new Error(`Cannot find class ${className}`));
        }
    }

    _get_comm_info() {
        return Promise.resolve({});
    }

    _create_comm() {
        return Promise.resolve(new MockComm());
    }

    el: HTMLElement;

    testClasses: { [key: string]: any } = {};
}
