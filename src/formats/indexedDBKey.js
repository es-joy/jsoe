import structuredCloning from './structuredCloning.js';

/** @type {import('../formats.js').Format} */
const indexedDBKey = {
  types: () => [
    'number', 'SpecialRealNumber', 'string', 'ValidDate', 'array',
    'buffersource'
  ],
  // A hack until we simply pass in our own types or do own parsing
  testInvalid (newType, value) {
    switch (newType) {
    /* istanbul ignore next -- Shouldn't occur as it is a preset */
    case 'SpecialRealNumber':
      /* istanbul ignore next -- Shouldn't occur as it is a preset */
      return Number.isNaN(value);
    case 'ValidDate':
      return Number.isNaN(/** @type {Date} */ (value).getTime());
    case 'array':
      return Object.keys(value).length !==
      /** @type {Array<import('../formats.js').StructuredCloneValue>} */ (
        value
      ).length;
    /* istanbul ignore next -- Shouldn't occur */
    default:
      /* istanbul ignore next -- Shouldn't occur */
      return false; // Todo: Should this throw?
    }
  },
  convertFromTypeson (typesonType) {
    return typesonToIndexedDBKey.get(typesonType);
  },
  iterate (records, stateObj) {
    stateObj.format = 'indexedDBKey';
    return structuredCloning.iterate(records, stateObj);
  },
  getTypesAndSchemasForState (types, state) {
    if (!state || ['array'].includes(state)) {
      return {
        types: this.types(),
        schemaObjects: []
      };
    }
    // Can't be object, so shouldn't normally reach here
    return undefined;
  }
};

/**
 * @type {Map<import('../types.js').AvailableType,
*   import('../types.js').AvailableType>
* }
*/
const typesonToIndexedDBKey = new Map([
  // This shouldn't occur as it is a preset
  ['SpecialNumber', 'SpecialRealNumber'],
  ['date', 'ValidDate'],
  // 'sparseArrays', 'array',
  ['arrayNonindexKeys', 'array']
]);

export default indexedDBKey;
