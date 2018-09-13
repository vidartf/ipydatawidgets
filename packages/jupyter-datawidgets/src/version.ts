// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


/**
 * The current package version.
 */
export
const version = (require('../package.json') as any).version;


/**
 * The semver range of this package that the serialization
 * format is compatible with.
 */
export
const EXTENSION_SPEC_VERSION = version;
