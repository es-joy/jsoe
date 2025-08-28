import {DOM, $$e, $e, $$} from '../../../instrumented/utils/templateUtils.js';
// import {DOM, $$e, $e, $$} from '../../../src/utils/templateUtils.js'; // Test Cypress TS

describe('templateUtils (DOM)', function () {
  beforeEach(() => {
    while (document.body.firstChild) {
      document.body.firstChild.remove();
    }
  });
  describe('DOM.removeChildren', function () {
    it('converts string selector to DOM and processes', function () {
      DOM.removeChildren('body');
      expect(document.body.hasChildNodes()).to.equal(false);
    });

    it('throws if parent element not found', function () {
      expect(() => {
        DOM.removeChildren('non-existent');
      }).to.throw('Node not found!');
    });
  });

  describe('DOM.filterChildElements', function () {
    it('converts string selector to DOM and processes', function () {
      const a = document.createElement('a');
      const b = document.createElement('b');
      document.body.append(a, b);
      const els = DOM.filterChildElements('body', 'a');
      expect(els).to.deep.equal([a]);
    });

    it('throws if parent element not found', function () {
      expect(() => {
        DOM.filterChildElements('non-existent', 'a');
      }).to.throw('Element not found!');
    });
  });

  describe('DOM.removeIfExists', function () {
    it('do nothing if element does not exist', function () {
      DOM.removeIfExists('non-existing');
    });
    it('Removes if an element exists', function () {
      const a = document.createElement('a');
      document.body.append(a);
      DOM.removeIfExists('a');
      expect(document.querySelector('a')).to.equal(null);
    });

    it('Removes if an element exists (by DOM)', function () {
      const a = document.createElement('a');
      document.body.append(a);
      DOM.removeIfExists(a);
      expect(document.querySelector('a')).to.equal(null);
    });
  });

  describe('$$e', function () {
    it('returns empty array if element not present', function () {
      expect($$e('abc', 'missingElement')).to.deep.equal([]);
    });
  });

  describe('$e', function () {
    it('returns null if parent element not present', function () {
      expect($e('abc', 'irrelevantSelector')).to.equal(null);
    });
  });

  describe('$$', function () {
    it('gets an array of elements', function () {
      const a = document.createElement('a');
      const aa = document.createElement('a');
      document.body.append(a, aa);
      const els = $$('a');
      expect(els).to.deep.equal([a, aa]);
    });
  });
});
