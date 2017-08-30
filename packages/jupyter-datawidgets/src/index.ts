
export {
  NDArrayModel, JSONToArray, arrayToJSON, array_serialization,
  IReceivedSerializedArray, ISendSerializedArray
} from './ndarray';

export {
  JSONToUnion, JSONToUnionArray, unionToJSON, data_union_serialization,
  data_union_array_serialization, getArrayFromUnion, listenToUnion,
  DataUnion
} from './union';

export {
  ScaledArrayModel
} from './scaled';

export {
  getArray
} from './common';

export {
  JUPYTER_DATAWIDGETS_VERSION
} from './version';

export
const version = (require('../package.json') as any).version;

