// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export function arraysEqual<T>(a: T[] | null | undefined, b: T[] | null | undefined) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
