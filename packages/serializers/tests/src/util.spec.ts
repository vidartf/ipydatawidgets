import {
  arraysEqual
} from '../../src/util';


describe('arraysEqual', () => {

  it('should equal for two nulls', () => {
    expect(arraysEqual(null, null)).to.be(true);
  });

  it('should equal for two undefined', () => {
    expect(arraysEqual(undefined, undefined)).to.be(true);
  });

  it('should equal for two small arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).to.be(true);
  });

  it('should equal when passing same instance', () => {
    const a = [1, 2, 3];
    expect(arraysEqual(a, a)).to.be(true);
  });

  it('should not equal for two different arrays of same length', () => {
    expect(arraysEqual([1, 4, 6], [1, 2, 3])).to.be(false);
    expect(arraysEqual([1, 2, 3], [1, 4, 6])).to.be(false);
  });

  it('should not equal for two similar arrays of different length', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3, 4, 5])).to.be(false);
    expect(arraysEqual([1, 2, 3, 4, 5], [1, 2, 3])).to.be(false);
  });

  it('should not equal for null and undefined', () => {
    expect(arraysEqual(null, undefined)).to.be(false);
    expect(arraysEqual(undefined, null)).to.be(false);
  });

});
