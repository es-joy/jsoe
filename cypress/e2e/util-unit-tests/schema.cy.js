import schemaFormat, {
  getTypesForSchema, recordKeyConforms, getXorBranchMatchInfo
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

  it(
    'mergeSchema keeps the stricter min/maxLength when the left side ' +
      'already has it, copies an object-valued meta key the left side ' +
      'lacks, and falls back to the right side\'s description when the ' +
      'left side has none',
    () => {
      const types = getTypesForSchema({
        type: 'intersection',
        left: {
          type: 'string', minLength: 5, maxLength: 5, meta: {a: 1}
        },
        right: {
          type: 'string',
          minLength: 3,
          maxLength: 10,
          meta: {a: 1, b: {nested: true}},
          description: 'right desc'
        }
      }, {type: 'boolean'});
      const [merged] = [...types];
      expect(merged).to.deep.include({
        minLength: 5, maxLength: 5, description: 'right desc'
      });
      expect(/** @type {any} */ (merged).meta.b).to.deep.equal({nested: true});
    }
  );

  it('mergeSchema throws on mismatched intersection types', () => {
    expect(() => getTypesForSchema({
      type: 'intersection',
      left: {type: 'string'},
      right: {type: 'number'}
    }, {type: 'boolean'})).to.throw('Cannot merge intersection types');
  });

  it(
    'getXorBranchMatchInfo counts a "checked"-type branch as unmatched ' +
      'for a value of the wrong JS type',
    () => {
      const types = new Types();
      const info = getXorBranchMatchInfo(
        types,
        /** @type {import('zodexy').SzUnion} */ (
          /** @type {unknown} */ ({
            type: 'union',
            options: [
              {type: 'any', checks: [{name: 'blob'}]},
              {type: 'string'}
            ]
          })
        ),
        'hello'
      );
      expect(info).to.deep.equal({matched: 1, total: 2});
    }
  );

  describe('recordKeyConforms', () => {
    const types = new Types();

    it('is true with no key schema', () => {
      expect(recordKeyConforms(types, undefined, 'abc')).to.equal(true);
    });

    it('is true with an undefined key', () => {
      expect(recordKeyConforms(types, {type: 'number'}, undefined)).to.equal(true);
    });

    it('is true when the key already conforms directly', () => {
      expect(recordKeyConforms(types, {type: 'string'}, 'abc')).to.equal(true);
    });

    it(
      'is true for a numeric-string key against a `number` key schema ' +
        '(Zod\'s numeric-string key fallback)',
      () => {
        expect(recordKeyConforms(types, {type: 'number'}, '42')).to.equal(true);
      }
    );

    it('is false for a non-string key that does not conform directly', () => {
      expect(recordKeyConforms(
        /** @type {any} */ (types), {type: 'number'}, /** @type {any} */ (null)
      )).to.equal(false);
    });

    it('is false for an all-whitespace key', () => {
      expect(recordKeyConforms(types, {type: 'number'}, ' '.repeat(3))).to.equal(false);
    });

    it('is false for a non-numeric string key against a `number` key schema', () => {
      expect(recordKeyConforms(types, {type: 'number'}, 'abc')).to.equal(false);
    });
  });
});
