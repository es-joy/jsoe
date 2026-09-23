import schemaFormat, {
  getTypesForSchema
} from '#jsoe/formats/schema.js';
import Types from '../../../src/types.js';

describe('schema', () => {
  it('combineModifiers max/maxLength and description', () => {
    const types = getTypesForSchema({
      type: 'intersection',
      left: {type: 'string', max: 10, meta: {a: 1}, description: 'left desc'},
      right: {type: 'string', max: 5, meta: {b: 2}, description: 'right desc'}
    }, {type: 'boolean'});
    expect(types.size).to.be.greaterThan(0);
  });

  it('combineModifiers with maxLength', () => {
    const types = getTypesForSchema({
      type: 'intersection',
      left: {type: 'string', maxLength: 10},
      right: {type: 'string', maxLength: 5}
    }, {type: 'boolean'});
    expect(types.size).to.be.greaterThan(0);
  });

  it('getTypesForSchema pipe with meta and description', () => {
    const types = getTypesForSchema({
      type: 'pipe',
      inner: {type: 'number'},
      outer: {type: 'boolean'},
      meta: {c: 3},
      description: 'pipe desc'
    }, {type: 'boolean'});
    expect(types.size).to.be.greaterThan(0);
  });

  it('convertFromTypeson promise', () => {
    if (!schemaFormat.convertFromTypeson) {
      throw new Error('convertFromTypeson expected');
    }
    /** @type {import('../../../src/types.js').StateObject} */
    const stateObj = {
      schemaContent: {type: 'boolean'},
      format: 'schema',
      readonly: false
    };
    const result = schemaFormat.convertFromTypeson(
      'number',
      new Types(),
      123,
      'prop',
      [{type: 'promise', value: {type: 'number'}}, undefined],
      stateObj
    );
    expect(result).to.deep.equal({
      type: 'number',
      schemaIdx: 0,
      schema: {type: 'number'},
      mustBeOptional: false
    });
  });

  it('mergeSchema throws on mismatched intersection types', () => {
    expect(() => getTypesForSchema({
      type: 'intersection',
      left: {type: 'string'},
      right: {type: 'number'}
    }, {type: 'boolean'})).to.throw('Cannot merge intersection types');
  });
});
