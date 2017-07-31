
export {
  NDArrayModel
} from './ndarray';


export
const version = require('../package.json').version;


(window as any)['requirejs'].config({
  map: {
    '*': {
      'jupyter-datawidgets': 'nbextensions/jupyter-datawidgets/extension',
    },
  }
});

// Export the required load_ipython_extention
export
function load_ipython_extension() { };
