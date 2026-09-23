import {stringifyJSON6} from '#jsoe/utils/json6Stringify.js';

describe('json6Stringify', () => {
  it('stringifies an empty object as {}', () => {
    expect(stringifyJSON6({}, '  ', '')).to.equal('{}');
  });
});
