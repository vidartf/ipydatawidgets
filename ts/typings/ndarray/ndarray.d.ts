// Type definitions for ndarray
// Project: ipydatawidgets
// Definitions by: vidartf

declare module 'ndarray' {

  export = ndarray;

  /**
   * creates an n-dimensional array view wrapping an underlying storage type
   *
   * @param {(any[] | TypedArray | IAccessorArrayLike<T>)} data a 1D array storage
   * @param {number[]} [shape] the shape of the view (Default: data.length)
   * @param {number} [stride] the resulting stride of the new array. (Default: row major)
   * @param {number} [offset] the offset to start the view (Default: 0)
   */
  function ndarray(
    data: any[] | ndarray.TypedArray | ndarray.IAccessorArrayLike,
    shape?: number[],
    stride?: number,
    offset?: number): ndarray.NDArray;


  namespace ndarray {
    export
    type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;

    export
    type dtype = 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64';

    export
    interface IAccessorArrayLike {
      length: number;
      get(...indices: number[]): number;
      set(...args: any[]): void;
    }

    export
    class NDArray {

      /**
       * The underlying 1D storage for the multidimensional array
       */
      data: number[] | ndarray.TypedArray | ndarray.IAccessorArrayLike;

      /**
       * The shape of the typed array
       */
      shape: number[];

      /**
       * The layout of the typed array in memory
       */
      stride: number;

      /**
       * The starting offset of the array in memory
       */
      offset: number;

      /**
       * Retrieves element i,j,... from the array.
       */
      get(...indices: number[]): number;

      /**
       * Sets element i,j,... to value (last parameter).
       */
      set(...args: number[]): void;

      /**
       * Returns a string representing the undelying data type of the ndarray.
       * Excluding generic data stores these types are compatible with typedarray-pool.
       */
      readonly dtype: ndarray.dtype;

      /**
       * Returns the size of the array in logical elements.
       */
      readonly size: number[];

      /**
       * Returns the order of the stride of the array, sorted in ascending length.
       * The first element is the first index of the shortest stride and the last
       * is the index the longest stride.
       */
      readonly order: number[];

      /**
       * Returns the dimension of the array.
       */
      readonly dimension: number[];

      /**
       * Creates a shifted view of the array. Think of it as taking the upper-left
       * corner of the image and dragging it inward by an amount equal to (i,j,k...).
       */
      lo(...indices: number[]): NDArray;

      /**
       * Creates a shifted view of the array. Think of it as taking the bottom-right
       * corner of the image and dragging it inward by an amount equal to (i,j,k...).
       */
      hi(...indices: number[]): NDArray;

      /**
       * Changes the stride length by rescaling. Negative indices flip axes. For example,
       *  here is how you create a reversed view of a 1D array:
       *
       *   var reversed = a.step(-1)
       *
       * You can also change the step size to be greater than 1 if you like, letting you
       * skip entries of a list. For example, here is how to split an array into even and
       * odd components:
       *
       *   var evens = a.step(2)
       *   var odds = a.lo(1).step(2)
       */
      step(...indices: number[]): NDArray;

      /**
       * For higher dimensional arrays you can transpose the indices without replicating
       * the data. This has the effect of permuting the shape and stride values and placing
       * the result in a new view of the same data. For example, in a 2D array you can
       * calculate the matrix transpose by:
       *
       *   M.transpose(1, 0)
       *
       * Or if you have a 3D volume image, you can shift the axes using more generic
       * transformations:
       *
       *   volume.transpose(2, 0, 1)
       */
      transpose(...order: number[]): NDArray;

      /**
       * Pull out a subarray from an ndarray by fixing a particular axis. The way this
       * works is you specify the direction you are picking by giving a list of values.
       * For example, if you have an image stored as an nxmx3 array you can pull out
       * the channel as follows:
       *
       *   var red   = image.pick(null, null, 0)
       *   var green = image.pick(null, null, 1)
       *   var blue  = image.pick(null, null, 2)
       *
       * As the above example illustrates, passing a negative or non-numeric value to a
       * coordinate in pick skips that index.
       */
      pick(...pick: (number | null)[]): NDArray;

    }

  }

}
