import {
  makeJSONPointer, reduceJSONPointerParts
} from '#jsoe/utils/jsonPointer.js';

describe('jsonPointer', function () {
  describe('`makeJSONPointer`', function () {
    it('makeJSONPointer creates a JSON pointer path', function () {
      expect(makeJSONPointer('ab', 'cd~', 'ef/')).to.equal(
        '#/ab/cd~0/ef~1'
      );
    });
  });
  describe('reduceJSONPointerParts', function () {
    it('throws if path part not found', function () {
      expect(() => {
        reduceJSONPointerParts({}, 'abc');
      }).to.throw('Path part not found in object');
    });
  });
});
