import {
  nodeTouchesPath,
  applyLiteralRegexQuery,
  applyRangeQuery,
  applyCheckbox,
  applyMultiSelect,
  applyOptIn,
  syncRangeValidity
} from '#jsoe/search/searchUtils.js';

describe('searchUtils', () => {
  it('nodeTouchesPath with $or', () => {
    expect(nodeTouchesPath({
      $or: [
        {kind: 'hasProperty', path: 'a', $exists: true},
        {kind: 'hasProperty', path: 'b', $exists: true}
      ]
    }, 'a')).to.be.true;
    expect(nodeTouchesPath({
      $or: [
        {kind: 'hasProperty', path: 'a', $exists: true},
        {kind: 'hasProperty', path: 'b', $exists: true}
      ]
    }, 'c')).to.be.false;
  });

  it('nodeTouchesPath unwraps nested "not" leaves to reach the real path', () => {
    expect(nodeTouchesPath({
      kind: 'not',
      query: {
        kind: 'not',
        query: {kind: 'hasProperty', path: 'a', $exists: true}
      }
    }, 'a')).to.be.true;
  });

  it('nodeTouchesPath is false for an undefined node', () => {
    expect(nodeTouchesPath(undefined, 'a')).to.be.false;
  });

  it('applyLiteralRegexQuery early return', () => {
    const el = document.createElement('div');
    applyLiteralRegexQuery(el, undefined, 'key');
    expect(el.getHTML()).to.equal('');
  });

  it('applyLiteralRegexQuery notContains', () => {
    const el = document.createElement('div');
    const modeEl = document.createElement('select');
    modeEl.className = 'jsoeSearchMode--key';
    const valueEl = document.createElement('input');
    valueEl.className = 'jsoeSearchValue--key';
    el.append(modeEl);
    el.append(valueEl);
    applyLiteralRegexQuery(el, {kind: 'notContains', path: 'x', value: 'foo'}, 'key');
  });

  it('applyRangeQuery early return', () => {
    const el = document.createElement('div');
    applyRangeQuery(el, undefined, 'key');
    expect(el.getHTML()).to.equal('');
  });

  it('syncRangeValidity early return', () => {
    const el = document.createElement('div');
    syncRangeValidity(el, 'key');
    expect(el.getHTML()).to.equal('');
  });

  it('applyCheckbox early return', () => {
    const el = document.createElement('div');
    applyCheckbox(el, true);
    expect(el.getHTML()).to.equal('');
  });

  it('applyMultiSelect early return', () => {
    const el = document.createElement('div');
    applyMultiSelect(el, ['a']);
    expect(el.getHTML()).to.equal('');
  });

  it('applyOptIn early return', () => {
    const el = document.createElement('div');
    applyOptIn(el, true, 'key');
    expect(el.getHTML()).to.equal('');
  });
});
