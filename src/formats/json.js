import structuredCloning from './structuredCloning.js';

/**
 * @type {Map<import('../types.js').AvailableType,
 *   import('../types.js').AvailableType>
 * }
 */
const typesonToJson = new Map([
  ['arrayNonindexKeys', 'array']
]);

/** @type {import('../formats.js').Format} */
const json = {
  types: () => [
    'null', 'true', 'false', 'number', 'string', 'array', 'object'
  ],
  iterate (records, stateObj) {
    // Todo (low): Add a more optimal (`JSON.stringify`-based iterator)
    const recs = records;
    // I believe this escaping should be by Typeson itself
    // if (records && typeof records === 'object' && records.$types) {
    //   recs = {$: records, $types: true};
    // }
    stateObj.format = 'json';
    return structuredCloning.iterate(recs, stateObj);
  },
  // A hack until we simply pass in our own types or do own parsing
  convertFromTypeson (typesonType) {
    return typesonToJson.get(typesonType);
  },
  testInvalid (newType, value) {
    switch (newType) {
    case 'array':
      return Object.keys(value).length !==
      /** @type {Array<import('../formats.js').StructuredCloneValue>} */ (
        value
      ).length;
    /* istanbul ignore next -- Shouldn't occur */
    default:
      /* istanbul ignore next -- Shouldn't occur */
      return undefined; // Todo: Fix?
    }
  },
  getTypesAndSchemasForState (types, state) {
    /* istanbul ignore else -- No other states apparently */
    if (!state || ['array', 'object'].includes(state)) {
      return {
        types: this.types(),
        schemaObjects: []
      };
    }
    // Shouldn't normally reach here
    return undefined;
  }
};

export default json;
