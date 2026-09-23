import {
  makeOrNode,
  makeNotLeaf,
  makeValidDateCheckLeaf,
  makeNotContainsLeaf,
  makeKeyValueEnumLeaf,
  makePresenceLeaf
} from '#jsoe/search/queryTreeBuilders.js';

describe('queryTreeBuilders', () => {
  it('makeOrNode', () => {
    /** @type {import('../../../src/search/queryTree.js').QueryHasPropertyLeaf} */
    const a = {kind: 'hasProperty', path: 'a', $exists: true};
    /** @type {import('../../../src/search/queryTree.js').QueryHasPropertyLeaf} */
    const b = {kind: 'hasProperty', path: 'b', $exists: true};
    expect(makeOrNode([a, b])).to.deep.equal({$or: [a, b]});
  });

  it('makeNotLeaf', () => {
    /** @type {import('../../../src/search/queryTree.js').QueryHasPropertyLeaf} */
    const query = {kind: 'hasProperty', path: 'a', $exists: true};
    expect(makeNotLeaf(query)).to.deep.equal({kind: 'not', query});
  });

  it('makeValidDateCheckLeaf', () => {
    expect(makeValidDateCheckLeaf('a', true)).to.deep.equal({
      kind: 'validDateCheck', path: 'a', isValid: true
    });
  });

  it('makeNotContainsLeaf', () => {
    expect(makeNotContainsLeaf('a', 'needle')).to.deep.equal({
      kind: 'notContains', path: 'a', value: 'needle'
    });
  });

  it('makeKeyValueEnumLeaf', () => {
    expect(makeKeyValueEnumLeaf('a', true, [1, 2])).to.deep.equal({
      kind: 'keyValueEnum', path: 'a', matchKeys: true, values: [1, 2]
    });
  });

  it('makePresenceLeaf', () => {
    expect(makePresenceLeaf('a', false)).to.deep.equal({
      kind: 'presence', path: 'a', $exists: false
    });
  });
});
