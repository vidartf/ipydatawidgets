
export {
  NDArrayModel, JSONToArray, arrayToJSON, array_serialization,
  IReceivedSerializedArray, ISendSerializedArray
} from './ndarray';

export {
  JSONToUnion, unionToJSON, data_union_serialization
} from './union';

export {
  JUPYTER_DATAWIDGETS_VERSION
} from './version';

export
const version = (require('../package.json') as any).version;

